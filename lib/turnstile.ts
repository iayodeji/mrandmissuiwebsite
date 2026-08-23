const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string,
  expectedAction: string = "vote"
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Fail-open ONLY in development to avoid accidentally bypassing CAPTCHA in production.
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ TURNSTILE_SECRET_KEY not set — bypassing CAPTCHA verification in non-production environment."
      );
      return true;
    }
    console.error("❌ TURNSTILE_SECRET_KEY missing in production environment. CAPTCHA verification failed.");
    return false;
  }

  // Reject malformed or empty tokens early.
  if (typeof token !== "string" || !token.trim() || token.length > 2048) {
    return false;
  }

  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
  );

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    if (remoteIp && remoteIp !== "::1" && remoteIp !== "127.0.0.1") {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: formData,
    });

    if (!response.ok) {
      console.error(`CAPTCHA siteverify HTTP error: ${response.status}`);
      return false;
    }

    const data = (await response.json()) as SiteverifyResponse;

    if (!data.success) {
      console.error("CAPTCHA verification failed:", data["error-codes"] ?? "unknown_error");
      return false;
    }

    if (expectedHostnames.size > 0 && !expectedHostnames.has(data.hostname ?? "")) {
      console.error(
        `CAPTCHA hostname mismatch: expected [${[...expectedHostnames].join(", ")}], got "${data.hostname}"`
      );
      return false;
    }

    if (data.action !== expectedAction) {
      console.error(`CAPTCHA action mismatch: expected "${expectedAction}", got "${data.action}"`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("CAPTCHA siteverify unexpected error:", error);
    return false;
  }
}