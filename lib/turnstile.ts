export async function verifyTurnstileToken(token: string, remoteIp: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("⚠️  TURNSTILE_SECRET_KEY not set — CAPTCHA verification will be skipped");
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const data = (await response.json()) as { success: boolean; error_codes?: string[] };
    return data.success;
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return false;
  }
}
