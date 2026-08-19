/**
 * load-test.ts
 *
 * Simulates high concurrency traffic to the voting link generation endpoint.
 * Bypasses IP and Email rate limiting by spoofing headers and generating random addresses.
 *
 * Usage:
 *   npx tsx scripts/load-test.ts <concurrency_level>
 * Example:
 *   npx tsx scripts/load-test.ts 100
 *
 * NOTE: This script uses Cloudflare's official Turnstile TEST credentials
 * (dummy sitekey/secret that always pass). Your server's TURNSTILE_SECRET_KEY
 * env var must be set to the matching test secret for this to work:
 *   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
 * Never use test keys in production.
 */

// Update this to match your local dev server + the correct API path
const TARGET_URL = "http://localhost:3000/api/request-vote-link";

// Cloudflare's official "always passes" dummy token — only works when the
// server is configured with the matching test secret key.
const DUMMY_CAPTCHA_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

// Grab the number of concurrent users from the CLI argument, default to 10
const concurrencyArgs = parseInt(process.argv[2] || "10", 10);

// Helper to generate a random Nigerian-style mobile IP (e.g., MTN/Airtel ranges)
function getRandomIP(): string {
  const subnet = Math.random() > 0.5 ? "197.210" : "105.112";
  const block3 = Math.floor(Math.random() * 255);
  const block4 = Math.floor(Math.random() * 255);
  return `${subnet}.${block3}.${block4}`;
}

// Helper to generate a random test email
function getRandomEmail(): string {
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `test.voter.${randomStr}@example.com`;
}

interface RequestOutcome {
  email: string;
  ip: string;
  captcha: string;
  result: Response | null;
  body?: string;
  error?: unknown;
}

async function runLoadTest(concurrentUsers: number) {
  console.log(`🚀 Initiating load test with ${concurrentUsers} concurrent requests...`);
  console.log(`📍 Target: ${TARGET_URL}\n`);
  console.log("Using secret:", process.env.TURNSTILE_SECRET_KEY);

  const startTime = Date.now();
  const requests: Promise<RequestOutcome>[] = [];

  // Build the massive array of concurrent requests
  for (let i = 0; i < concurrentUsers; i++) {
    const fakeIp = getRandomIP();
    const fakeEmail = getRandomEmail();
    const captchaToken = DUMMY_CAPTCHA_TOKEN;

    const req = fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Spoof the IP to bypass Vercel/Custom edge rate limiters
        "x-forwarded-for": fakeIp,
      },
      // Pass the mock email + dummy captcha token so the route's fail-closed
      // CAPTCHA check doesn't reject every request before anything else runs
      body: JSON.stringify({ email: fakeEmail, captchaToken }),
    })
      .then(async (res) => {
        // Clone so we can log the body without consuming the response
        const bodyText = await res
          .clone()
          .text()
          .catch(() => "<unreadable body>");
        return { email: fakeEmail, ip: fakeIp, captcha: captchaToken, result: res, body: bodyText };
      })
      .catch((err) => {
        return { email: fakeEmail, ip: fakeIp, captcha: captchaToken, result: null, error: err };
      });

    requests.push(req);
  }

  // Fire them all into the event loop at the exact same time
  const settledResults = await Promise.allSettled(requests);
  const endTime = Date.now();

  // Tally the results
  let successCount = 0;
  let clientErrorCount = 0;
  let rateLimitedCount = 0;
  let serverErrorCount = 0;
  let failedNetworkCount = 0;

  console.log(`📋 PER-REQUEST LOG`);
  console.log(`---------------------------------------------------`);

  for (const settled of settledResults) {
    if (settled.status !== "fulfilled") {
      // Shouldn't happen since errors are caught inside the promise itself,
      // but guard against it anyway.
      console.log(`💥 [unhandled promise rejection] ${settled.reason}`);
      failedNetworkCount++;
      continue;
    }

    const { email, ip, result, error, body } = settled.value;

    if (!result) {
      console.log(`💥 NETWORK FAIL | ${email} | ip=${ip} | ${String(error)}`);
      failedNetworkCount++;
      continue;
    }

    const status = result.status;
    const trimmedBody = body?.slice(0, 150) ?? "";

    if (status >= 200 && status < 300) {
      successCount++;
      console.log(`✅ ${status} | ${email} | ip=${ip} | ${trimmedBody}`);
    } else if (status === 429) {
      rateLimitedCount++;
      console.log(`⚠️  429 | ${email} | ip=${ip} | ${trimmedBody}`);
    } else if (status >= 400 && status < 500) {
      clientErrorCount++;
      console.log(`🚫 ${status} | ${email} | ip=${ip} | ${trimmedBody}`);
    } else if (status >= 500) {
      serverErrorCount++;
      console.log(`❌ ${status} | ${email} | ip=${ip} | ${trimmedBody}`);
    }
  }

  console.log(`---------------------------------------------------\n`);

  console.log(`📊 SUMMARY (${endTime - startTime}ms total execution time)`);
  console.log(`---------------------------------------------------`);
  console.log(`✅ Success (2xx):         ${successCount}`);
  console.log(`🚫 Bad Request (4xx):     ${clientErrorCount}`);
  console.log(`⚠️  Rate Limited (429):    ${rateLimitedCount}`);
  console.log(`❌ Server Errors (5xx):   ${serverErrorCount}`);
  console.log(`💥 Network Failures:      ${failedNetworkCount}`);
  console.log(`---------------------------------------------------`);

  if (serverErrorCount > 0) {
    console.log(
      "🚨 WARNING: Your database or serverless functions are crashing under load. Check Vercel logs for Supabase connection pool limits."
    );
  } else if (successCount === concurrentUsers) {
    console.log("🏆 FLAWLESS VICTORY: Infrastructure handled the entire load perfectly.");
  }
}

runLoadTest(concurrencyArgs).catch((err) => {
  console.error("Fatal test error:", err);
});