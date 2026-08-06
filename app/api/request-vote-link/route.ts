import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendVotingLink } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limiter";
import { isDisposableEmail } from "@/lib/disposable-email-check";
import { generateToken, getTokenExpiry } from "@/lib/crypto-utils";

interface VoterRecord {
  id: string;
  email: string;
  has_voted: boolean;
  vote_token: string | null;
  token_expires_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; captchaToken?: string };
    const { email, captchaToken } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get client IP for rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 1. Check rate limit by IP
    const rateLimitKey = `request-vote-link:${clientIp}`;
    const maxRequests = parseInt(process.env.VOTING_RATE_LIMIT_PER_HOUR || "5");
    if (!checkRateLimit(rateLimitKey, maxRequests, 60)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Verify CAPTCHA
    if (captchaToken) {
      const captchaValid = await verifyTurnstileToken(captchaToken, clientIp);
      if (!captchaValid) {
        return NextResponse.json(
          { error: "CAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // 3. Check for disposable email
    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Disposable email addresses are not allowed. Please use a permanent email." },
        { status: 400 }
      );
    }

    // 4. Look up voter by email
    const { data: existingVoter, error: queryError } = await supabase
      .from("voters")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 = not found, which is expected
      throw queryError;
    }

    const typedVoter = existingVoter as VoterRecord | null;
    const tokenExpiryMinutes = parseInt(process.env.VOTING_TOKEN_EXPIRY_MINUTES || "10");

    if (typedVoter) {
      // Voter exists
      if (typedVoter.has_voted) {
        // Already voted — return generic success to avoid leaking voting status
        return NextResponse.json(
          { message: "If this email hasn't voted, a link has been sent." },
          { status: 200 }
        );
      }

      // Check if token is still valid
      if (
        typedVoter.vote_token &&
        new Date(typedVoter.token_expires_at!) > new Date()
      ) {
        // Resend same token
        const emailSent = await sendVotingLink(normalizedEmail, typedVoter.vote_token);
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

      // Token expired — issue new token
      const newToken = generateToken();
      const newExpiry = getTokenExpiry(tokenExpiryMinutes);

      const { error: updateError } = await (
        supabase.from("voters") as unknown as {
          update: (
            data: Record<string, unknown>
          ) => { eq: (col: string, val: unknown) => Promise<{ error: unknown }> };
        }
      )
        .update({
          vote_token: newToken,
          token_expires_at: newExpiry.toISOString(),
          ip_address: clientIp,
          user_agent: request.headers.get("user-agent"),
        })
        .eq("id", typedVoter.id);

      if (updateError) throw updateError;

      const emailSent = await sendVotingLink(normalizedEmail, newToken);
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

    // New voter — create row, generate token, send email
    const newToken = generateToken();
    const newExpiry = getTokenExpiry(tokenExpiryMinutes);

    const { error: insertError } = await (
      supabase.from("voters") as unknown as {
        insert: (
          data: Record<string, unknown>
        ) => Promise<{ error: unknown }>;
      }
    ).insert({
      email: normalizedEmail,
      vote_token: newToken,
      token_expires_at: newExpiry.toISOString(),
      ip_address: clientIp,
      user_agent: request.headers.get("user-agent"),
    });

    if (insertError) throw insertError;

    const emailSent = await sendVotingLink(normalizedEmail, newToken);
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
  } catch (error) {
    console.error("Error in request-vote-link:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
