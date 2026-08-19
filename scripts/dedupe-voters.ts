/**
 * dedupe-voters.ts
 *
 * Finds voters whose emails are the same person abusing Gmail's dot-trick
 * or +tag trick to vote multiple times, and deletes every row for that
 * person except the EARLIEST one (by created_at).
 *
 * SAFE BY DEFAULT: runs in dry-run mode unless you pass --execute.
 * Dry-run prints exactly what it WOULD delete, with zero DB writes.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/dedupe-voters.ts                # dry run
 *   npx tsx --env-file=.env.local scripts/dedupe-voters.ts --execute      # actually deletes
 *
 * ⚠️  TAKE A BACKUP / EXPORT OF public.voters BEFORE RUNNING WITH --execute.
 *     In Supabase: Table Editor → voters → Export as CSV, or
 *     `pg_dump` the table if you have direct DB access.
 *
 * Env vars required (set in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────
const DRY_RUN = !process.argv.includes("--execute");

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

// ── Normalization logic ──────────────────────────────────────────────
// Same rules as the app-level normalizer:
//  - lowercase everything
//  - strip +tag for all providers
//  - strip dots ONLY for gmail.com / googlemail.com (that's the only
//    provider that actually ignores dots — do NOT strip dots elsewhere,
//    it would wrongly merge real distinct addresses like first.last@company.com)
//  - fold googlemail.com -> gmail.com
function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  const noPlus = local.split("+")[0];
  const isGmail = domain === "gmail.com" || domain === "googlemail.com";
  const cleanedLocal = isGmail ? noPlus.replace(/\./g, "") : noPlus;
  const normalizedDomain = domain === "googlemail.com" ? "gmail.com" : domain;

  return `${cleanedLocal}@${normalizedDomain}`;
}

// ── Types ─────────────────────────────────────────────────────────────
interface VoterRow {
  id: string;
  email: string;
  has_voted: boolean;
  created_at: string;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log(
    DRY_RUN
      ? "🔍  DRY RUN — no rows will be deleted. Pass --execute to actually delete.\n"
      : "⚠️   LIVE RUN — rows WILL be deleted from public.voters.\n",
  );

  // Supabase caps a single select() at 1000 rows by default. Page through
  // with .range() until a page comes back shorter than PAGE_SIZE, so this
  // works correctly no matter how many voters there are.
  const PAGE_SIZE = 1000;
  const rows: VoterRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("voters")
      .select("id, email, has_voted, created_at")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("❌  Failed to fetch voters:", error.message);
      process.exit(1);
    }

    const page = (data ?? []) as VoterRow[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log(`📋  Loaded ${rows.length} voter row(s).\n`);

  // Group by normalized email
  const groups = new Map<string, VoterRow[]>();
  for (const row of rows) {
    const key = normalizeEmail(row.email);
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  // Rows are sorted by created_at ascending (from the query above). Within
  // each duplicate group we prefer to KEEP a row where has_voted = true,
  // even if it's not the earliest — someone who registered early but only
  // actually cast their vote on a later attempt shouldn't get un-voted just
  // because an earlier, unvoted row of theirs happens to sort first.
  // If multiple rows in a group have has_voted = true (shouldn't normally
  // happen, but just in case), keep the earliest of those.
  // If NONE have has_voted = true, fall back to keeping the earliest row.
  const toDelete: VoterRow[] = [];
  const duplicateGroups: { normalized: string; keep: VoterRow; drop: VoterRow[] }[] = [];

  for (const [normalized, bucket] of groups.entries()) {
    if (bucket.length <= 1) continue;

    const votedRows = bucket.filter((r) => r.has_voted);
    const keep = votedRows.length > 0 ? votedRows[0] : bucket[0];
    const drop = bucket.filter((r) => r.id !== keep.id);

    duplicateGroups.push({ normalized, keep, drop });
    toDelete.push(...drop);
  }

  if (duplicateGroups.length === 0) {
    console.log("✅  No duplicate voters found. Nothing to do.");
    return;
  }

  // ── Report ────────────────────────────────────────────────────────
  console.log(
    `🚨  Found ${duplicateGroups.length} normalized email(s) with duplicates ` +
      `(${toDelete.length} row(s) to delete total).\n`,
  );

  for (const { normalized, keep, drop } of duplicateGroups) {
    console.log(`── ${normalized} (${drop.length + 1} rows) ──`);
    console.log(`  ✅  KEEP   ${keep.id}  ${keep.email}  has_voted=${keep.has_voted}  ${keep.created_at}`);
    for (const d of drop) {
      console.log(`  🗑️  DELETE ${d.id}  ${d.email}  has_voted=${d.has_voted}  ${d.created_at}`);
    }
    console.log("");
  }

  if (DRY_RUN) {
    console.log("═══════════════════════════════════════════════════");
    console.log(`  Would delete ${toDelete.length} row(s) across ${duplicateGroups.length} email(s).`);
    console.log("  Re-run with --execute to actually delete these rows.");
    console.log("  Make sure you've backed up public.voters first.");
    console.log("═══════════════════════════════════════════════════");
    return;
  }

  // ── Execute deletion ─────────────────────────────────────────────
  const idsToDelete = toDelete.map((r) => r.id);
  console.log(`🗑️   Deleting ${idsToDelete.length} row(s)...\n`);

  // Delete in chunks to stay well under any URL/payload limits
  const CHUNK = 200;
  let deletedCount = 0;
  for (let i = 0; i < idsToDelete.length; i += CHUNK) {
    const chunkIds = idsToDelete.slice(i, i + CHUNK);
    const { error: deleteError, count } = await supabase
      .from("voters")
      .delete({ count: "exact" })
      .in("id", chunkIds);

    if (deleteError) {
      console.error(
        `❌  Failed deleting chunk starting at index ${i}:`,
        deleteError.message,
      );
      console.error("   Stopping — check remaining duplicates manually before retrying.");
      process.exit(1);
    }

    deletedCount += count ?? chunkIds.length;
    console.log(`  ✅  Deleted ${deletedCount}/${idsToDelete.length} so far...`);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  ✅  Done. Deleted ${deletedCount} duplicate row(s).`);
  console.log(`  ${duplicateGroups.length} email(s) now have exactly one row each.`);
  console.log("═══════════════════════════════════════════════════");
  console.log(
    "\nNext: add the normalized_email column + unique index so this can't recur, " +
      "and update your vote-request flow to normalize before insert/lookup.",
  );
}

main().catch((err) => {
  console.error("💥  Unexpected error:", err);
  process.exit(1);
});