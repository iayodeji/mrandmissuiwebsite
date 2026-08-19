# Task: Add a safe "send mass voting links" GitHub Action

## Context
We have a Next.js + Supabase voting app. Table `public.voters`:

```sql
create table public.voters (
  id uuid not null default gen_random_uuid (),
  email text not null,
  has_voted boolean not null default false,
  vote_token text null,
  token_expires_at timestamp with time zone null,
  ip_address text null,
  user_agent text null,
  created_at timestamp with time zone not null default now(),
  constraint voters_pkey primary key (id),
  constraint voters_email_key unique (email),
  constraint voters_vote_token_key unique (vote_token)
);
```

There's an existing script at `scripts/send-mass-voting-links.ts` that queries voters
with `has_voted = false` and emails each one a one-time voting link, setting
`vote_token` and `token_expires_at`.

**Problem to fix:** the script currently has no way to know who's already been
emailed. If it runs more than once, anyone still sitting at `has_voted = false`
gets a brand-new token and a duplicate email, silently invalidating their
original link. We need a durable "already sent" flag that is independent of
`has_voted` and independent of token expiry.

## What to implement

1. **Migration** — add a nullable timestamp column that records when a voting
   link was last emailed to a voter:

   ```sql
   alter table public.voters add column if not exists link_sent_at timestamptz null;
   ```

   Add this as a proper migration file if the project uses Supabase migrations
   (check `supabase/migrations/`); otherwise add it wherever this project's
   schema changes normally live. Do not modify `has_voted` semantics — it still
   only means "has cast a vote."

2. **Update `scripts/send-mass-voting-links.ts`**:
   - Change the fetch query to select only voters who have *not* been sent a
     link yet: `has_voted = false AND link_sent_at IS NULL`.
   - When a link send succeeds for a voter, set `link_sent_at = now()` in the
     same update call that already sets `vote_token` and `token_expires_at`.
   - If a per-voter update or send fails, do **not** set `link_sent_at` for
     that voter — leave them eligible for a retry on the next run.
   - Keep the existing batching, delay, and summary/logging behavior as-is.
   - Do not touch `lib/crypto-utils`, `lib/email`, or `has_voted` logic unless
     something above requires it.

3. **New GitHub Actions workflow** at `.github/workflows/send-voting-links.yml`:
   - Triggers: `schedule` (every 10 minutes — use a cron you think is
     reasonable) and `workflow_dispatch` (manual trigger, no inputs needed).
   - Job steps:
     a. Query Supabase's REST API (`/rest/v1/voters`) with
        `select=id&has_voted=eq.false&link_sent_at=is.null` and
        `Prefer: count=exact` to get the pending count via the
        `Content-Range` response header — do not fetch full rows just to
        count them.
     b. Only proceed to install deps and run the script if the count is
        `>= 50`. Every step after the count check must be conditioned on
        this threshold so we don't run `npm ci` / the script unnecessarily.
     c. Run `npx tsx scripts/send-mass-voting-links.ts` with the required
        env vars sourced from repo secrets: `NEXT_PUBLIC_SUPABASE_URL`,
        `SUPABASE_SERVICE_ROLE_KEY`, `SENDBYTE_API_KEY`, and any others the
        script/`lib/email.ts` actually needs — check the script's own header
        comment and imports for the authoritative list, don't guess.
   - Never hardcode any key, URL, or credential in the workflow file — secrets
     only, referenced via `${{ secrets.NAME }}`.
   - Add a comment at the top of the workflow file explaining the threshold
     logic and pointing at `link_sent_at` as the dedupe mechanism, so it's
     obvious to future-us why this exists.

## Guardrails — do not skip these

- **Idempotency is the whole point of this task.** Before writing any code,
  re-verify that a voter who already has `link_sent_at` set can never be
  selected again by the query, even if `has_voted` is still `false` and even
  if the workflow runs back-to-back.
- Do not silently widen the query to include already-emailed voters "just in
  case" — if a resend mechanism is wanted later, that's a separate, explicit
  feature (e.g. a `--resend-expired` flag), not a default behavior.
- Do not remove or weaken the existing per-voter error handling — a failed
  send for one voter must not mark them as sent, and must not stop the batch
  for everyone else.
- Do not commit real secret values anywhere (workflow file, `.env` committed
  to git, logs). If you need me to add repo secrets, tell me exactly which
  ones by name and I'll add them myself.
- After implementing, show me: the migration, the diff on the script, and the
  full workflow file, plus a one-line explanation of how you verified the
  dedupe logic (test run, dry read of the query, etc.) before I merge.
