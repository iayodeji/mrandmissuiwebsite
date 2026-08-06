import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const votingEmailFrom = process.env.VOTING_EMAIL_FROM || "voting@unibadan.example.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

if (!resendApiKey) {
  console.warn("⚠️  RESEND_API_KEY not set — emails will not be sent (development mode)");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVotingLink(email: string, token: string): Promise<boolean> {
  const voteLink = `${siteUrl}/vote?token=${token}`;

  const emailContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Your Mr & Miss Unibadan Voting Link</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
        border-radius: 0 0 8px 8px;
      }
      .cta-button {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer {
        font-size: 12px;
        color: #666;
        margin-top: 20px;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      .warning {
        background: #fff3cd;
        border: 1px solid #ffc107;
        color: #856404;
        padding: 15px;
        border-radius: 4px;
        margin: 20px 0;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 You're Invited to Vote!</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Thank you for your interest in the Mr & Miss Unibadan election. We're excited to have your vote!</p>
        <p><strong>Click the button below to cast your vote:</strong></p>
        <p>
          <a href="${voteLink}" class="cta-button">Vote Now</a>
        </p>
        <p><strong>Or copy this link if the button doesn't work:</strong></p>
        <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
          ${voteLink}
        </p>
        <div class="warning">
          ⏰ <strong>This link expires in 10 minutes.</strong> Once you submit your vote, it cannot be changed.
        </div>
        <p>Questions? Contact us at voting@unibadan.example.com</p>
        <div class="footer">
          <p>© 2026 Mr & Miss Unibadan Election. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this address.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  if (!resend) {
    console.log(`[DEV] Would send voting link to ${email}:\n${voteLink}`);
    return true;
  }

  try {
    await resend.emails.send({
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
