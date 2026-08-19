Task: Create a standalone, rate-limited CLI script named `scripts/send-mass-voting-links.ts` to send one-time voting link emails to all unvoted users via SendByte without hitting rate limits or crashing.

Requirements:
1. File Location: Create `scripts/send-mass-voting-links.ts`.
2. Database Query: Query the database for all voters where `has_voted` is `false` (`SELECT id, email FROM voters WHERE has_voted = FALSE`). Support our project's existing DB client (Prisma / Drizzle / Pg / Kysely).
3. Token Generation & DB Update:
   - For each user, generate a secure 32-byte hex token using Node's native `crypto.randomBytes(32).toString('hex')`.
   - Update the user record in the database with `vote_token = token` BEFORE sending the email.
4. Email Dispatch:
   - Reuse our existing email function from `sendVotingLink(email, token)` (or use SendByte fetch logic).
5. Chunking & Rate Limiting (Batching for 400+ users):
   - Implement an array chunking function with a batch size of 15 voters per chunk.
   - Run each batch concurrently with `Promise.all()`.
   - Add a mandatory `await sleep(2000)` delay (2 seconds) between batches to respect SendByte API rate limits.
6. Error Handling & Progress Logging:
   - Wrap each voter email operation in a `try/catch` block so individual failures do not stop the batch process.
   - Keep a running tally of `successCount`, `failCount`, and log progress after every batch (e.g., "Batch 3/25 completed...").
   - Output a final summary report showing total success and a list of failed emails.

Please create `scripts/send-mass-voting-links.ts` with complete, error-free TypeScript code, and provide the command to run it locally with environment variables loaded.