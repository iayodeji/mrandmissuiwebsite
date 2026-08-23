import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendVotingLink } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limiter";
import { isDisposableEmail } from "@/lib/disposable-email-check";
import { generateToken, getTokenExpiry } from "@/lib/crypto-utils";
import { normalizeEmail } from "@/lib/normalize-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; captchaToken?: string };
    const { email, captchaToken } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanedEmail = email.toLowerCase().trim();
    const normalizedEmail = normalizeEmail(cleanedEmail);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 1. Check rate limit
    const rateLimitKey = `request-vote-link:${clientIp}`;
    const maxRequests = parseInt(process.env.VOTING_RATE_LIMIT_PER_HOUR || "100");
    const rateAllowed = await checkRateLimit(rateLimitKey, maxRequests, 60);
    if (!rateAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // 2 & 3. CAPTCHA check
    const isLoadTest = process.env.LOAD_TEST_MODE === "true";
    if (!isLoadTest) {
      if (!captchaToken || typeof captchaToken !== "string" || !captchaToken.trim()) {
        return NextResponse.json({ error: "CAPTCHA token is required." }, { status: 400 });
      }

      const captchaValid = await verifyTurnstileToken(captchaToken, clientIp);
      if (!captchaValid) {
        return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
      }
    }

    // 4. Disposable email check
    if (isDisposableEmail(cleanedEmail)) {
      return NextResponse.json({ error: "Disposable email addresses are not allowed." }, { status: 400 });
    }

    // 5. Existing voter check
    const { data: existingVoter, error: queryError } = await supabase
      .from("voters")
      .select("*")
      .eq("normalized_email", normalizedEmail)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      console.error("DB query error in request-vote-link:", queryError);
      return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }

    const tokenExpiryMinutes = parseInt(process.env.VOTING_TOKEN_EXPIRY_MINUTES || "120");

    if (existingVoter) {
      if (existingVoter.has_voted) {
        return NextResponse.json({ error: "Abah na, stop trying to vote more than once na 😭" }, { status: 409 });
      }

      // RESEND PATH
      if (
        existingVoter.vote_token &&
        existingVoter.token_expires_at &&
        new Date(existingVoter.token_expires_at) > new Date()
      ) {
        // Pass existingVoter.id as the 3rd argument
        const emailSent = await sendVotingLink(existingVoter.email, existingVoter.vote_token, existingVoter.id);
        if (!emailSent) {
          return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
        }
        return NextResponse.json({ message: "Voting link resent to your email." }, { status: 200 });
      }

      // REISSUE PATH
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
        console.error("DB update error:", updateError);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
      }

      // Pass existingVoter.id as the 3rd argument
      const emailSent = await sendVotingLink(existingVoter.email, newToken, existingVoter.id);
      if (!emailSent) {
        return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ message: "New voting link sent to your email." }, { status: 200 });
    }

    // 6. NEW VOTER PATH
    const newToken = generateToken();
    const newExpiry = getTokenExpiry(tokenExpiryMinutes);

    const { data: upsertedVoter, error: upsertError } = await supabase.from("voters").upsert(
      {
        email: cleanedEmail,
        normalized_email: normalizedEmail,
        vote_token: newToken,
        token_expires_at: newExpiry.toISOString(),
        ip_address: clientIp,
        user_agent: request.headers.get("user-agent"),
      },
      { onConflict: "normalized_email" }
    )
    .select() // Return the inserted/updated row
    .single(); // Ensure it's a single object, not an array

    if (upsertError || !upsertedVoter) {
      console.error("DB upsert error:", upsertError);
      return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }

    // Pass upsertedVoter.id as the 3rd argument
    const emailSent = await sendVotingLink(cleanedEmail, newToken, upsertedVoter.id);
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Voting link sent to your email." }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error in request-vote-link:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}