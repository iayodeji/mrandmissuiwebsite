/**
 * Voting-link email delivery via the SendByte REST API.
 *
 * We call the API directly with fetch instead of using the `@sendbyte/node`
 * SDK: the SDK imports Node's `crypto` built-in at module load, which crashes
 * API routes on Cloudflare Workers (500 before the handler runs). fetch is
 * available on every runtime.
 *
 * Endpoint (mirrors the SDK's `emails.send`):
 *   POST https://api.sendbyte.africa/v1/emails
 *   Authorization: Bearer <SENDBYTE_API_KEY>
 *   body: { from, to, subject, html }
 */

const SENDBYTE_API_URL = "https://api.sendbyte.africa/v1/emails";

const sendbyteApiKey = process.env.SENDBYTE_API_KEY;
const votingEmailFrom =
  process.env.VOTING_EMAIL_FROM || "Mr & Miss Unibadan <voting@unibadan.example.com>";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrandmissunibadan.click").replace(
  /\/+$/,
  ""
);

if (!sendbyteApiKey) {
  console.warn("⚠️  SENDBYTE_API_KEY not set — emails will not be sent (development mode)");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendViaSendByte(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!sendbyteApiKey) {
    throw new Error("SENDBYTE_API_KEY is not set");
  }

  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(SENDBYTE_API_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${sendbyteApiKey}`,
          "content-type": "application/json",
          "user-agent": "mrandmissunibadan-web/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        let detail = text;
        try {
          const parsed = JSON.parse(text) as { error?: { message?: string; code?: string } };
          detail = parsed.error?.message ?? parsed.error?.code ?? text;
        } catch {
          // keep raw text
        }
        lastError = new Error(`SendByte API error (${response.status}): ${detail}`);

        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < maxAttempts) {
          await sleep(250 * 2 ** (attempt - 1));
          continue;
        }
        break;
      }

      return; // sent successfully
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("Failed to send email after exhausting retries");
}

export async function sendVotingLink(email: string, token: string): Promise<boolean> {
  const voteLink = `${siteUrl}/vote?token=${token}`;

  const emailContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Mr & Miss Unibadan Voting Link</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0d090a;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #171011;
      }
      .header {
        background: linear-gradient(145deg, #2b080d 0%, #5d1018 55%, #741923 100%);
        border-bottom: 1px solid rgba(197, 161, 91, 0.55);
        padding: 44px 40px 40px;
        text-align: center;
      }
      .eyebrow {
        color: #e4c47b;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        margin-bottom: 18px;
      }
      .header h1 {
        margin: 0;
        color: #f2eadc;
        font-family: Georgia, 'Times New Roman', serif;
        font-weight: 500;
        font-size: 40px;
        line-height: 1.05;
        letter-spacing: -0.02em;
      }
      .header h1 em {
        color: #e4c47b;
        font-style: italic;
      }
      .content {
        padding: 40px;
      }
      .content p {
        margin: 0 0 18px;
        color: #d8ccbd;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 15px;
        line-height: 1.8;
      }
      .content .lead {
        color: #f2eadc;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 20px;
        line-height: 1.4;
        border-left: 2px solid #c5a15b;
        padding-left: 16px;
      }
      .cta-wrap {
        text-align: center;
        margin: 32px 0;
      }
      .cta-button {
        display: inline-block;
        background-color: #c5a15b;
        color: #0d090a;
        padding: 16px 34px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        text-decoration: none;
      }
      .fallback {
        background-color: #201516;
        border: 1px solid rgba(197, 161, 91, 0.35);
        padding: 14px 16px;
        margin: 24px 0;
        color: #aa9a92;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        line-height: 1.6;
        word-break: break-all;
      }
      .fallback a {
        color: #e4c47b;
        text-decoration: underline;
      }
      .warning {
        border: 1px solid rgba(197, 161, 91, 0.55);
        background: rgba(197, 161, 91, 0.1);
        padding: 14px 16px;
        margin: 24px 0;
        color: #e4c47b;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        line-height: 1.6;
      }
      .divider {
        border-top: 1px solid rgba(242, 234, 220, 0.18);
        margin: 32px 0 26px;
      }
      .footer {
        padding: 0 40px 34px;
        color: #aa9a92;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        letter-spacing: 0.14em;
        line-height: 1.9;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="eyebrow">Edition 01 / 2026</div>
        <h1>Mr &amp; <em>Miss</em><br />Unibadan.</h1>
      </div>
      <div class="content">
        <p class="lead">Your vote is ready.</p>
        <p>Hello,</p>
        <p>Thank you for your interest in the Mr &amp; Miss Unibadan election. Your ballot is waiting — cast your vote before the link expires.</p>
        <div class="cta-wrap">
          <a href="${voteLink}" class="cta-button">Cast your vote ↗</a>
        </div>
        <p style="text-align:center;color:#aa9a92;">If the button doesn't work, copy the link below:</p>
        <div class="fallback">
          <a href="${voteLink}">${voteLink}</a>
        </div>
        <div class="warning">
          ⏰ <strong>This link expires in 10 minutes.</strong> Once submitted, your vote cannot be changed.
        </div>
        <div class="divider"></div>
        <p style="color:#aa9a92;font-size:13px;">Questions? Contact us at voting@unibadan.example.com</p>
      </div>
      <div class="footer">
        <p>© 2026 Mr &amp; Miss Unibadan Election</p>
        <p>University of Ibadan · This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </body>
</html>
  `;

  if (!sendbyteApiKey) {
    console.log(`[DEV] Would send voting link to ${email}:\n${voteLink}`);
    return true;
  }

  try {
    await sendViaSendByte({
      from: votingEmailFrom,
      to: email,
      subject: "Your Mr & Miss Unibadan Voting Link 🎉",
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
