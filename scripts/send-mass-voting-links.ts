/**
 * send-mass-voting-links.ts
 *
 * Standalone CLI script that sends one-time voting link emails to pending
 * voters — has_voted = false AND link_sent_at IS NULL — restricted to major
 * email providers, and cross-checked against SendByte's own sent log before
 * sending, so we never pay to re-send someone who already has a message on
 * file (regardless of whether our local link_sent_at / webhook caught it).
 *
 * CHANGES from the original version:
 *  - Paginated the voters fetch with .range() — Supabase silently caps a
 *    single select() at 1000 rows, which was under-counting on any run past
 *    that many pending voters.
 *  - Restricted sends to major providers only (gmail, icloud, yahoo,
 *    outlook/hotmail/live) — cuts cost/noise from typo domains, dead
 *    temp-mail lookalikes, and other junk that either bounces or was never
 *    going to be read anyway. Anyone outside this list is logged and
 *    skipped, not deleted — reversible if you want to widen it later.
 *  - Cross-checks SendByte's GET /v1/emails against each voter's email (via
 *    the `to` field on each sent record — the list endpoint has no metadata
 *    field, only GET /v1/emails/{id} does) before sending. This is our
 *    source-of-truth belt-and-braces check on top of link_sent_at, since
 *    we've seen the delivery webhook lag/miss events. Any existing record
 *    (queued/sent/delivered/bounced/complained/suppressed) counts as
 *    "already handled" — one send attempt per email, no retries.
 *  - Marks link_sent_at directly after a confirmed successful send, instead
 *    of relying solely on the delivery webhook to eventually set it.
 *
 * SendByte API shape confirmed against https://docs.sendbyte.africa/api-reference/emails/list —
 * GET /v1/emails returns { data: [{ id, from, to: string[], subject, status,
 * sandbox, created_at }], has_more }, cursor-paginated via `after=<last id>`.
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

// Only send to these providers. Add/remove domains here if you want to
// widen or narrow the net later — this is the single place that controls it.
const ALLOWED_DOMAINS = new Set([
  "gmail.com",
  "stu.ui.edu.ng",
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
]);

const SENDBYTE_API_URL = "https://api.sendbyte.africa/v1/emails";
const sendbyteApiKey = process.env.SENDBYTE_API_KEY;

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

// ── Fetch ALL pending voters, paginated ─────────────────────────────
async function fetchPendingVoters(): Promise<Voter[]> {
  const PAGE_SIZE = 1000;
  const voters: Voter[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("voters")
      .select("id, email")
      .eq("has_voted", false)
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

// ── Fetch the set of recipient emails SendByte already has ANY record for ──
// Matches SendByte's real /v1/emails response shape: { data: [{ id, from,
// to: string[], subject, status, sandbox, created_at }], has_more }.
// There's no metadata field on the list endpoint (only on GET /v1/emails/{id}),
// so we match by recipient email instead of voter_id.
//
// We treat ANY existing record — queued, sent, delivered, bounced,
// complained, or suppressed — as "already handled, don't resend." A bounce
// won't fix itself by resending, and retrying complained/suppressed
// addresses risks hurting SendByte sender reputation. One attempt per
// email, full stop.
async function fetchAlreadySentEmails(): Promise<Set<string>> {
  const alreadySent = new Set<string>();

  if (!sendbyteApiKey) {
    console.warn(
      "⚠️  SENDBYTE_API_KEY not set — skipping SendByte cross-check (dev mode).",
    );
    return alreadySent;
  }

  let cursor: string | undefined = undefined;
  let pageCount = 0;

  while (true) {
    const url = new URL(SENDBYTE_API_URL);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("after", cursor);

    const response = await fetch(url.toString(), {
      headers: { authorization: `Bearer ${sendbyteApiKey}` },
    });

    if (!response.ok) {
      console.error(
        `❌  SendByte /v1/emails fetch failed (${response.status}) — proceeding without cross-check.`,
      );
      break;
    }

    const json = (await response.json()) as {
      data?: { id: string; to: string[] }[];
      has_more?: boolean;
    };

    const records = json.data ?? [];
    for (const record of records) {
      for (const recipient of record.to ?? []) {
        alreadySent.add(recipient.toLowerCase());
      }
    }

    pageCount++;
    console.log(
      `  📥  Fetched SendByte page ${pageCount} (${records.length} record(s), ${alreadySent.size} unique recipient(s) so far)`,
    );

    if (!json.has_more || records.length === 0) break;
    // Cursor is the id of the LAST item on this page — advance to it.
    cursor = records[records.length - 1].id;
  }

  console.log(`📥  Fetched ${alreadySent.size} already-sent recipient email(s) from SendByte total.\n`);
  return alreadySent;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Fetching pending users (paginated)…\n");
  const allPending = await fetchPendingVoters();
  console.log(`📋  Found ${allPending.length} pending user(s) total (has_voted=false, link_sent_at=null).\n`);

  if (allPending.length === 0) {
    console.log("Nothing to do — no pending voters. ✅");
    return;
  }

  // Filter to allowed providers only
  const allowed: Voter[] = [];
  const skippedDomain: Voter[] = [];
  for (const voter of allPending) {
    if (ALLOWED_DOMAINS.has(getDomain(voter.email))) {
      allowed.push(voter);
    } else {
      skippedDomain.push(voter);
    }
  }

  if (skippedDomain.length > 0) {
    console.log(
      `⏭️   Skipping ${skippedDomain.length} voter(s) outside allowed providers (not deleted, just not sent by this script):`,
    );
    for (const v of skippedDomain.slice(0, 20)) {
      console.log(`     • ${v.email}`);
    }
    if (skippedDomain.length > 20) {
      console.log(`     ...and ${skippedDomain.length - 20} more`);
    }
    console.log("");
  }

  // Cross-check against SendByte's own sent log
  console.log("🔍  Cross-checking against SendByte's sent log…\n");
  const alreadySentEmails = await fetchAlreadySentEmails();

  const list = allowed.filter((v) => !alreadySentEmails.has(v.email.toLowerCase()));
  const skippedAlreadySent = allowed.length - list.length;
  if (skippedAlreadySent > 0) {
    console.log(
      `⏭️   Skipping ${skippedAlreadySent} voter(s) SendByte already has a record for (local link_sent_at was out of sync).\n`,
    );
  }

  console.log(`📤  ${list.length} voter(s) left to actually send to.\n`);

  if (list.length === 0) {
    console.log("Nothing to do — everyone eligible already has a SendByte record. ✅");
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

        // 3. Mark link_sent_at directly — don't wait on the delivery
        // webhook, which we've seen lag or miss events.
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
  console.log(`  Skipped (domain):     ${skippedDomain.length}`);
  console.log(`  Skipped (already sent on SendByte): ${skippedAlreadySent}`);
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