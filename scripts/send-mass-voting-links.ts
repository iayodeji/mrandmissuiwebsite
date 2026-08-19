/**
 * send-mass-voting-links.ts
 *
 * Standalone CLI script that sends one-time voting link emails to every
 * voter whose `has_voted` column is FALSE.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/send-mass-voting-links.ts
 *
 * Env vars required (set in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SENDBYTE_API_KEY
 *   VOTING_EMAIL_FROM        (optional – has default)
 *   NEXT_PUBLIC_SITE_URL     (optional – has default)
 */

import { createClient } from "@supabase/supabase-js";
import { generateToken, getTokenExpiry } from "../lib/crypto-utils";
import { sendVotingLink } from "../lib/email";

// ── Config ────────────────────────────────────────────────────────────
const BATCH_SIZE = 15;
const DELAY_MS = 2_000;
const TOKEN_EXPIRY_MINUTES = parseInt(
  process.env.VOTING_TOKEN_EXPIRY_MINUTES || "10",
  10,
);

// ── Supabase client ──────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers ───────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Types ─────────────────────────────────────────────────────────────
interface Voter {
  id: string;
  email: string;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Fetching unvoted users…\n");

  const { data: voters, error: fetchError } = await supabase
    .from("voters")
    .select("id, email")
    .eq("has_voted", false);

  if (fetchError) {
    console.error("❌  Failed to query voters:", fetchError.message);
    process.exit(1);
  }

  const list = (voters ?? []) as Voter[];
  console.log(`📋  Found ${list.length} unvoted user(s).\n`);

  if (list.length === 0) {
    console.log("Nothing to do — all users have already voted. ✅");
    return;
  }

  const batches = chunk(list, BATCH_SIZE);
  let successCount = 0;
  const failedEmails: { email: string; error: string }[] = [];

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchNum = batchIdx + 1;

    console.log(`── Batch ${batchNum}/${batches.length} (${batch.length} users) ──`);

    const results = await Promise.allSettled(
      batch.map(async (voter) => {
        // 1. Generate token & persist BEFORE sending
        const token = generateToken();
        const expiresAt = getTokenExpiry(TOKEN_EXPIRY_MINUTES).toISOString();

        const { error: updateError } = await (
          supabase.from("voters") as any
        )
          .update({ vote_token: token, token_expires_at: expiresAt })
          .eq("id", voter.id);

        if (updateError) {
          throw new Error(`DB update failed: ${updateError.message}`);
        }

        // 2. Send the voting link email
        const sent = await sendVotingLink(voter.email, token);
        if (!sent) {
          throw new Error("sendVotingLink returned false");
        }

        return voter.email;
      }),
    );

    // Tally results
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        successCount++;
      } else {
        const reason =
          result.status === "rejected"
            ? String(result.reason?.message ?? result.reason)
            : "Unknown error";
        failedEmails.push({ email: batch[i].email, error: reason });
        console.error(`  ⚠️  Failed: ${batch[i].email} — ${reason}`);
      }
    }

    console.log(
      `  ✅  Batch ${batchNum}/${batches.length} done — ` +
        `success so far: ${successCount}, failed: ${failedEmails.length}\n`,
    );

    // Delay between batches (skip after the last batch)
    if (batchIdx < batches.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log(`  📊  SUMMARY`);
  console.log(`  Total users:  ${list.length}`);
  console.log(`  ✅  Success:   ${successCount}`);
  console.log(`  ❌  Failed:    ${failedEmails.length}`);
  console.log("═══════════════════════════════════════════════════");

  if (failedEmails.length > 0) {
    console.log("\nFailed emails:");
    for (const { email, error } of failedEmails) {
      console.log(`  • ${email} — ${error}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("💥  Unexpected error:", err);
  process.exit(1);
});
