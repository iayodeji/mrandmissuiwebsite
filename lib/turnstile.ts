// Server-side Turnstile verification (canonical siteverify flow).
// Browser -> this backend -> challenges.cloudflare.com/turnstile/v0/siteverify.
// Never call siteverify from the browser.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Must match data-action on the widget embed (components/voting-email-form.tsx).
const EXPECTED_ACTION = "vote";

interface SiteverifyResponse {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    // Development fallback: without a secret, siteverify cannot run.
    console.warn(
      "⚠️  TURNSTILE_SECRET_KEY not set — CAPTCHA verification will be skipped. Set it in .env.local to enforce CAPTCHA."
    );
    return true;
  }

  // Reject malformed tokens before hitting the network.
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  // Approved frontend hostnames (TURNSTILE_HOSTNAMES). Empty set disables the
  // hostname check — set it in production to your real domain, never localhost.
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean)
  );

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    if (!response.ok) {
      console.error(`CAPTCHA siteverify failed with status ${response.status}`);
      return false;
    }

    const data = (await response.json()) as SiteverifyResponse;

    if (!data.success) {
      console.error(
        "CAPTCHA verification failed:",
        data["error-codes"] ?? "no error codes"
      );
      return false;
    }

    if (expectedHostnames.size > 0 && !expectedHostnames.has(data.hostname ?? "")) {
      console.error(
        `CAPTCHA hostname mismatch: expected one of [${[...expectedHostnames].join(", ")}], got "${data.hostname}"`
      );
      return false;
    }

    if (data.action !== EXPECTED_ACTION) {
      console.error(
        `CAPTCHA action mismatch: expected "${EXPECTED_ACTION}", got "${data.action}"`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return false;
  }
}
