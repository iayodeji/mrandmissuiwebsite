/**
 * POST /api/request-vote-link
 *
 * Security hardening applied:
 * - Fail-closed: explicit 400 for missing/empty CAPTCHA token before calling
 *   the Turnstile verification endpoint.
 * - Atomic upsert replaces the manual check-then-insert race window.
 * - All internal error details are logged server-side only; the client receives
 *   a non-disclosing message.
 * - All `as unknown as` type assertions removed in favour of the typed
 *   Supabase client (`Database` generic).
 * - `checkRateLimit` is now awaited (async store interface).
 * - Email is normalized (lowercase, strip +tag, strip dots for Gmail/Googlemail)
 *   before any DB lookup or write. Lookups and the upsert conflict target are
 *   on `normalized_email`, not raw `email`, so the dot-trick / plus-trick can no
 *   longer be used to create multiple voter rows for the same real inbox.
 *   NOTE: returning a specific "you've already voted" style message below is a
 *   deliberate deviation from the anti-enumeration generic message previously
 *   used for the has_voted=true case — accepted tradeoff, see PR discussion.
 *
 * LOAD TESTING:
 * - Setting LOAD_TEST_MODE=true skips the CAPTCHA check entirely, for local
 *   load testing only (see scripts/load-test.ts).
 * - Defaults to skipped/false — CAPTCHA is enforced unless this var is
 *   explicitly set. NEVER set LOAD_TEST_MODE=true in production env vars
 *   (Vercel project settings) — doing so disables bot protection on this
 *   endpoint entirely.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendVotingLink } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limiter";
import { isDisposableEmail } from "@/lib/disposable-email-check";
import { generateToken, getTokenExpiry } from "@/lib/crypto-utils";
import { normalizeEmail } from "@/lib/normalize-email";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; captchaToken?: string };
    const { email, captchaToken } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Raw, lightly-cleaned email — this is what we STORE and what we SEND to.
    const cleanedEmail = email.toLowerCase().trim();

    // Normalized form (strips +tag everywhere, strips dots for gmail/googlemail)
    // — this is what we LOOK UP and CONFLICT on, so name+1@gmail.com,
    // n.a.m.e@gmail.com, and name@gmail.com all collapse to one voter.
    const normalizedEmail = normalizeEmail(cleanedEmail);

    // Get client IP for rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 1. Check rate limit by IP
    const rateLimitKey = `request-vote-link:${clientIp}`;
    const maxRequests = parseInt(process.env.VOTING_RATE_LIMIT_PER_HOUR || "5");
    const rateAllowed = await checkRateLimit(rateLimitKey, maxRequests, 60);
    if (!rateAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2 & 3. CAPTCHA check — skipped only when LOAD_TEST_MODE=true (local load testing)
    const isLoadTest = process.env.LOAD_TEST_MODE === "true";
    if (!isLoadTest) {
      // Fail-closed CAPTCHA check: reject before calling external API
      if (!captchaToken || typeof captchaToken !== "string" || !captchaToken.trim()) {
        return NextResponse.json(
          { error: "CAPTCHA token is required." },
          { status: 400 }
        );
      }

      const captchaValid = await verifyTurnstileToken(captchaToken, clientIp);
      if (!captchaValid) {
        return NextResponse.json(
          { error: "CAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // 4. Check for disposable email (checked against the cleaned, non-normalized
    // form — disposable-domain lists match on domain, normalization doesn't
    // change the domain except googlemail -> gmail, which is fine either way)
    if (isDisposableEmail(cleanedEmail)) {
      return NextResponse.json(
        { error: "Disposable email addresses are not allowed. Please use a permanent email." },
        { status: 400 }
      );
    }

    // 5. Check for existing voter BY NORMALIZED EMAIL
    const { data: existingVoter, error: queryError } = await supabase
      .from("voters")
      .select("*")
      .eq("normalized_email", normalizedEmail)
      .single();

    // PGRST116 = no rows found — expected for a new voter
    if (queryError && queryError.code !== "PGRST116") {
      console.error("DB query error in request-vote-link:", queryError);
      return NextResponse.json(
        { error: "An internal server error occurred." },
        { status: 500 }
      );
    }

    const tokenExpiryMinutes = parseInt(process.env.VOTING_TOKEN_EXPIRY_MINUTES || "10");

    if (existingVoter) {
      // Already voted — including via a +tag/dot variant of this same inbox.
      if (existingVoter.has_voted) {
        return NextResponse.json(
          { error: "Abah na, stop trying to vote more than once na 😭" },
          { status: 409 }
        );
      }

      // Token still valid — resend it to the ORIGINAL email on file, not
      // whatever variant they just typed, so we don't keep minting new
      // "valid" addresses for the same person.
      if (
        existingVoter.vote_token &&
        existingVoter.token_expires_at &&
        new Date(existingVoter.token_expires_at) > new Date()
      ) {
        const emailSent = await sendVotingLink(existingVoter.email, existingVoter.vote_token);
        if (!emailSent) {
          return NextResponse.json(
            { error: "Failed to send email. Please try again." },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { message: "Voting link resent to your email." },
          { status: 200 }
        );
      }

      // Token expired — issue new token (typed upsert)
      const newToken = generateToken();
      const newExpiry = getTokenExpiry(tokenExpiryMinutes);

      const { error: updateError } = await supabase
        .from("voters")
        .update({
          vote_token: newToken,
          token_expires_at: newExpiry.toISOString(),
          ip_address: clientIp,
          user_agent: request.headers.get("user-agent"),
        })
        .eq("id", existingVoter.id);

      if (updateError) {
        console.error("DB update error in request-vote-link:", updateError);
        return NextResponse.json(
          { error: "An internal server error occurred." },
          { status: 500 }
        );
      }

      const emailSent = await sendVotingLink(existingVoter.email, newToken);
      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send email. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "New voting link sent to your email." },
        { status: 200 }
      );
    }

    // 6. New voter — atomic upsert on normalized_email to eliminate the race
    // condition AND close off the dot/plus-trick at the DB level (belt and
    // braces alongside the read check above).
    const newToken = generateToken();
    const newExpiry = getTokenExpiry(tokenExpiryMinutes);

    const { error: upsertError } = await supabase.from("voters").upsert(
      {
        email: cleanedEmail,
        normalized_email: normalizedEmail,
        vote_token: newToken,
        token_expires_at: newExpiry.toISOString(),
        ip_address: clientIp,
        user_agent: request.headers.get("user-agent"),
      },
      { onConflict: "normalized_email" }
    );

    if (upsertError) {
      console.error("DB upsert error in request-vote-link:", upsertError);
      return NextResponse.json(
        { error: "An internal server error occurred." },
        { status: 500 }
      );
    }

    const emailSent = await sendVotingLink(cleanedEmail, newToken);
    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Voting link sent to your email." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in request-vote-link:", error);
    // No internal details leaked to the client
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}