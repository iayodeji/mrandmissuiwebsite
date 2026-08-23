# Mr & Miss Unibadan Voting System — PRD

## 1. Overview

A single-page application (SPA) that lets anyone with a valid email cast **one vote** consisting of one Mr Unibadan candidate and one Miss Unibadan candidate, submitted together. No paid SMS/identity verification — enforcement relies on email uniqueness, magic-link tokens, and free abuse-prevention layers (CAPTCHA, disposable-email blocking, rate limiting).

**Stack:** Next.js (existing SPA — this PRD covers implementing voting logic into it, not building the frontend from scratch) + Supabase (Postgres) for data storage.

**No user accounts, no signup, no login, no sessions.** Nobody creates an account on this platform. "Voters" in this document refers to rows tracking one-time vote eligibility per email — not user profiles. There is no Supabase Auth, no NextAuth, no password, no persistent login state for voters. The only "identity" that exists is a single-use token embedded in a URL. Do not implement any signup/login UI or auth middleware for the voting flow.

---

## 2. Core Rule

**One email = one vote = one Mr pick + one Miss pick, cast together, non-reversible.**

There is no partial voting state. A voter either has not voted (no vote exists) or has fully voted (both selections recorded, token burned). No email can generate a second valid token once it has voted.

---

## 3. User Flow

1. **Landing page (`/`)**: Voter enters email → CAPTCHA challenge → submit.
2. **Backend validates and issues token:**
   - Reject disposable/temporary email domains.
   - Reject if CAPTCHA fails.
   - Reject if rate limit exceeded for this IP.
   - Reject (silently, generic message) if email already has a `voters` record with `has_voted = true`.
   - If email has a `voters` record with `has_voted = false` and an unexpired token, resend the same link rather than issuing a new token (see §6 on resend policy — confirm before implementing).
   - Otherwise: create `voters` row, generate a unique token, set expiry (default 45 minutes), send email with link `https://yoursite.com/vote?token=xxxxx`.
3. **Voter clicks email link → lands on `/vote?token=xxxxx`** (same SPA, dedicated route, must work as a cold page load).
4. **Frontend on `/vote` mount:** reads token from query param, calls backend to validate token (exists, unused, unexpired). If invalid/expired/used → render an error state, no ballot shown. If valid → render ballot (Mr candidates + Miss candidates).
5. **Voter selects exactly one Mr candidate and one Miss candidate.** Submit button disabled until both are selected.
6. **Voter submits →** backend performs the atomic confirm-vote operation (§5).
7. **Success state:** show confirmation, do not allow re-submission from this route (token is now burned; reloading the same link should show "already voted").

---

## 4. Data Model (Postgres / Supabase)

```sql
CREATE TABLE voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,           -- store normalized: lowercased, trimmed
  has_voted BOOLEAN NOT NULL DEFAULT false,
  vote_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mr', 'miss')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  photo_url TEXT
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  category TEXT NOT NULL CHECK (category IN ('mr', 'miss')),
  vote_session_id UUID NOT NULL,        -- groups the mr+miss pair from one voter action
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Deliberate design choice:** `votes` has no foreign key or reference back to `voters`/email. This keeps vote choices unlinked from voter identity in storage — anonymity by design, and it shrinks the blast radius of any future data exposure. Enforcement of "one vote" lives entirely in the `voters` table.

---

## 5. Confirm-Vote Logic (must be atomic — this is the critical section)

Use a single Postgres transaction. Do not split this into separate round-trips from the application layer without a transaction wrapping them.

```sql
BEGIN;

-- Step 1: Atomically claim the token. This is the race-condition guard.
UPDATE voters
SET has_voted = true
WHERE vote_token = $1
  AND has_voted = false
  AND token_expires_at > now()
RETURNING id;

-- If the above returns 0 rows: token was already used, expired, or invalid.
-- ROLLBACK and return an error to the client — do not proceed to Step 2.

-- Step 2 (only if Step 1 returned a row): insert both votes.
INSERT INTO votes (candidate_id, category, vote_session_id)
VALUES
  ($2, 'mr', $4),
  ($3, 'miss', $4);

COMMIT;
```

Application logic wrapping this:
- Validate `$2` (mr candidate id) belongs to an active candidate with `category = 'mr'`.
- Validate `$3` (miss candidate id) belongs to an active candidate with `category = 'miss'`.
- Generate `$4` (vote_session_id) as a fresh UUID per request.
- If the `UPDATE` in Step 1 affects 0 rows, immediately rollback and respond with a generic "this link is invalid or already used" — do not reveal which specific condition failed (used vs expired vs invalid), to avoid giving probing attackers useful signal.

---

## 6. Endpoints (Next.js Route Handlers, e.g. `app/api/.../route.ts`)

Implement these as Next.js API routes (or Server Actions if that's the existing app's pattern — match whatever convention the rest of the app already uses). No auth middleware wraps these; they're public endpoints protected only by CAPTCHA, rate limiting, and the token logic itself.

### `POST /api/request-vote-link`
**Input:** `{ email }`
**Logic:**
1. Verify CAPTCHA token server-side (never trust client-side-only CAPTCHA).
2. Rate limit by IP (suggested: 5 requests/hour/IP).
3. Normalize email (lowercase, trim).
4. Check against disposable-email-domain blocklist; reject with clear message if matched.
5. Look up `voters` by email:
   - Not found → create row, generate token + expiry, send email.
   - Found, `has_voted = true` → return generic success message anyway ("if this email hasn't voted, a link has been sent") to avoid leaking voting status via response differences.
   - Found, `has_voted = false`, token still valid → resend same link (decide: yes/no, see open question below).
   - Found, `has_voted = false`, token expired → issue new token, overwrite old one, send new link.
6. Log IP + user agent on the `voters` row regardless of outcome, for forensic/audit purposes only (never used for blocking decisions).

### `GET /api/validate-token?token=xxxxx`
Used by the existing `/vote` route on mount, before rendering the ballot.
**Logic:** check token exists, `has_voted = false`, not expired. Return valid/invalid — do not return which specific reason.

### `POST /api/confirm-vote`
**Input:** `{ token, mrCandidateId, missCandidateId }`
**Logic:** the atomic transaction in §5. Returns success/failure only — no vote content echoed back beyond a confirmation.

### `GET /api/candidates`
Public. Returns active candidates split by category, for rendering the ballot.

---

## 7. Abuse-Prevention Layers (all free-tier)

| Layer | Tool | Enforcement point |
|---|---|---|
| CAPTCHA | Cloudflare Turnstile (free) | `request-vote-link` endpoint, before any DB write |
| Disposable email blocking | `disposable-email-domains` (or equivalent maintained blocklist) | `request-vote-link`, before token generation |
| Rate limiting | IP-based, e.g. 5 requests/hour | `request-vote-link` endpoint |
| Token expiry | 45 min default (tune as needed) | Checked in `validate-token` and `confirm-vote` |
| Forensic logging | IP + user agent stored per voter row | Not used for blocking — only for post-hoc dispute investigation |

None of these fully prevent determined multi-voting (e.g., someone with many real, permanent email addresses). This is a known, accepted limitation given the no-budget constraint — the goal is raising the cost of abuse, not making it impossible.

---

## 8. Frontend Integration Notes (existing Next.js routes)

The SPA and its routes already exist — this section only covers what the voting logic needs from those existing pages, not new pages to scaffold.

- Email-entry page — wire the existing form to call `POST /api/request-vote-link`, with CAPTCHA widget on submit.
- `/vote?token=xxxxx` route — Next.js handles cold loads (email client → fresh URL) natively, no rewrite-rule concerns like a static SPA would have.
- `/vote` route logic:
  1. On mount, extract `token` from query params.
  2. Call `validate-token`.
  3. If invalid: render error state, no candidate UI, no way to submit a vote.
  4. If valid: fetch candidates, render ballot with two selection groups (Mr / Miss), submit disabled until both selected.
  5. On submit: call `confirm-vote`. On success, render confirmation and prevent further interaction with the form (do not rely solely on the backend rejecting a resubmit — disable the UI too, backend is still the actual source of truth).

---

## 9. Open Questions to Confirm Before Implementation

1. **Resend policy:** if a voter requests a link twice before using it (e.g., can't find the first email), should the system resend the same unexpired token, or silently do nothing to avoid enabling probing? Recommendation: resend same token, since this is a legitimate UX need and doesn't weaken uniqueness (still one token, one use).
2. **Token expiry window:** 45 minutes suggested — confirm this fits expected voting behavior (some voters may check email hours later).
3. **Results visibility:** should vote counts be visible live, or only after voting closes? Not addressed in this PRD — affects whether a `GET /results` endpoint is needed and whether it should be rate-limited/cached to avoid becoming a scraping target during close races.
4. **Candidate management:** who adds/edits candidates — a simple admin-only route/table edit, or does this need an admin UI? Not scoped here.

---

## 10. Explicit Non-Goals

- No phone verification, no institutional identity check (open-to-anyone by design decision).
- No guarantee against a determined attacker with many real disposable-but-permanent-looking emails — accepted risk given no budget for stronger verification.
- No vote editing/retraction once confirmed.
