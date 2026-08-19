Act as a senior full-stack software engineer and security reviewer. Refactor the provided Next.js voting route handlers and rate-limiting utility to fix all identified security vulnerabilities, concurrency bugs, and type-safety issues.

### Refactoring Requirements:

1. **Sanitize Error Handling (Security):**
   - Remove all detailed internal database errors, stack traces, and debug fields (`debugMessage`, `debugDetails`) from API response payloads.
   - Return clean, non-disclosing error messages to the client (e.g., `{ error: "An internal server error occurred." }`).
   - Ensure full error details are logged strictly server-side using `console.error`.

2. **Fix Concurrency & Race Conditions:**
   - Replace manual "check-then-insert" logic in `request-vote-link` with an atomic Supabase `.upsert()` using a database-level `UNIQUE(email)` constraint.
   - Ensure `confirm_vote_atomic` operations run safely within a database transaction block to prevent double-voting under concurrent requests.

3. **Serverless-Safe Rate Limiting:**
   - Refactor the `checkRateLimit` utility. If using an in-memory `Map`, add automatic key pruning/garbage collection to prevent memory leaks.
   - Abstract the rate limiter interface so it can seamlessly fall back to an external distributed store (like Upstash Redis) in serverless environments.

4. **Strict Type Safety:**
   - Remove all `as unknown as ...` type assertions.
   - Import generated Supabase types (`import { Database } from "@/types/supabase"`) and instantiate a typed client (`createClient<Database>()`).

5. **Fail-Closed CAPTCHA Verification:**
   - Update Turnstile token verification to explicitly return `status 400` if the token parameter is empty, null, or missing prior to running verification.

Please output the complete, refactored code files with clear comments highlighting the changes.