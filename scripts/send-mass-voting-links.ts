/**
 * send-mass-voting-links.ts
 *
 * Standalone CLI script that sends one-time voting link emails to pending
 * voters (has_voted = false AND requested latest yesterday). 
 * Restricted to major standard email providers to avoid temp emails.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/send-mass-voting-links.ts
 */

import { createClient } from "@supabase/supabase-js";
import { generateToken, getTokenExpiry } from "../lib/crypto-utils";
import { sendVotingLink } from "../lib/email";

// ── Config ────────────────────────────────────────────────────────────
const BATCH_SIZE = 15;
const DELAY_MS = 3_000;
const TOKEN_EXPIRY_MINUTES = parseInt(
  process.env.VOTING_TOKEN_EXPIRY_MINUTES || "60",
  10,
);

// STRICT STANDARD PROVIDERS ONLY — No temp emails.
// STRICT STANDARD PROVIDERS + UI STUDENT EMAILS
const ALLOWED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "stu.ui.edu.ng", // <-- Added this back
]);

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

function getDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

// ── Types ─────────────────────────────────────────────────────────────
interface Voter {
  id: string;
  email: string;
}

// ── Fetch ALL pending voters (has_voted = false & created before today) ──
async function fetchPendingVoters(): Promise<Voter[]> {
  const PAGE_SIZE = 1000;
  const voters: Voter[] = [];
  let from = 0;

  // Calculate "latest yesterday" (anything strictly before 00:00:00 today)
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0); 
  const cutoffIso = cutoff.toISOString();

  while (true) {
    const { data, error } = await supabase
      .from("voters")
      .select("id, email")
      .eq("has_voted", false)
      .lt("created_at", cutoffIso) // Requested latest yesterday
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("❌  Failed to query voters:", error.message);
      process.exit(1);
    }

    const page = (data ?? []) as Voter[];
    voters.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return voters;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Fetching pending users (has_voted=false, requested latest yesterday)…\n");
  const allPending = await fetchPendingVoters();
  console.log(`📋  Found ${allPending.length} pending user(s) total.\n`);

  if (allPending.length === 0) {
    console.log("Nothing to do — no pending voters fit the criteria. ✅");
    return;
  }

  // Filter to allowed providers only (Standard emails)
  const list: Voter[] = [];
  const skippedDomain: Voter[] = [];
  
  for (const voter of allPending) {
    if (ALLOWED_DOMAINS.has(getDomain(voter.email))) {
      list.push(voter);
    } else {
      skippedDomain.push(voter);
    }
  }

  if (skippedDomain.length > 0) {
    console.log(
      `⏭️   Skipping ${skippedDomain.length} voter(s) outside standard providers (temp/custom emails):`,
    );
    for (const v of skippedDomain.slice(0, 20)) {
      console.log(`    • ${v.email}`);
    }
    if (skippedDomain.length > 20) {
      console.log(`    ...and ${skippedDomain.length - 20} more`);
    }
    console.log("");
  }

  console.log(`📤  ${list.length} voter(s) ready for sending.\n`);

  if (list.length === 0) {
    console.log("Nothing to do — no eligible standard emails found. ✅");
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
        const sent = await sendVotingLink(voter.email, token, voter.id);
        if (!sent) {
          throw new Error("sendVotingLink returned false");
        }

        // 3. Mark link_sent_at directly 
        const { error: markSentError } = await (
          supabase.from("voters") as any
        )
          .update({ link_sent_at: new Date().toISOString() })
          .eq("id", voter.id);

        if (markSentError) {
          console.error(
            `  ⚠️  Sent to ${voter.email} but failed to record link_sent_at: ${markSentError.message}`,
          );
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

    if (batchIdx < batches.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log(`  📊  SUMMARY`);
  console.log(`  Total pending:        ${allPending.length}`);
  console.log(`  Skipped (non-standard): ${skippedDomain.length}`);
  console.log(`  Attempted:            ${list.length}`);
  console.log(`  ✅  Success:           ${successCount}`);
  console.log(`  ❌  Failed:            ${failedEmails.length}`);
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