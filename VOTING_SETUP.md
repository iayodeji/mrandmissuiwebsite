# Voting System Setup Guide

The Mr & Miss Unibadan voting system is now fully implemented! Follow these steps to get it running.

## 1. Supabase Setup

### 1.1 Create/Configure Your Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project or use an existing one
- Copy your **Project URL** and **Service Role Key** from Settings → API

### 1.2 Run Database Migrations
- In the Supabase dashboard, go to SQL Editor
- Create a new query
- Copy the entire contents from `supabase/migrations/001_init_voting_schema.sql`
- Paste and execute

This creates:
- `voters` table (tracks email + token + voting status)
- `candidates` table (Mr/Miss candidates)
- `votes` table (anonymous vote records)
- `confirm_vote_atomic()` function (atomic transaction-safe voting)

### 1.3 Seed Test Candidates (Optional)
Run this SQL to add test candidates:

```sql
INSERT INTO candidates (name, category, is_active, photo_url)
VALUES
  ('Candidate A', 'mr', true, NULL),
  ('Candidate B', 'mr', true, NULL),
  ('Candidate C', 'miss', true, NULL),
  ('Candidate D', 'miss', true, NULL);
```

Replace with real candidate names and add `photo_url` links to their photos.

## 2. Environment Setup

### 2.1 Copy the Example File
```bash
copy .env.local.example .env.local
```

### 2.2 Fill in Your Credentials
Edit `.env.local` with:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SendByte Email
SENDBYTE_API_KEY=sk_xxxxxxxxxxxxx
VOTING_EMAIL_FROM=Mr & Miss Unibadan <voting@yourdomain.com>

# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Voting Config
VOTING_TOKEN_EXPIRY_MINUTES=10
VOTING_RATE_LIMIT_PER_HOUR=5
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your domain in production
```

#### Getting Credentials:
- **Supabase**: Dashboard → Settings → API
- **SendByte**: [docs.sendbyte.africa](https://docs.sendbyte.africa) → API Keys (sandbox `sk_test_` keys work immediately; swap to a live `sk_live_` key after verifying your domain)
- **Turnstile**: [Cloudflare Dashboard](https://dash.cloudflare.com) → Turnstile (free)

## 3. Frontend Integration

### 3.1 Add Voting Form to Your Home Page
In `app/page.tsx` or wherever you want the voting entry point, import and use:

```tsx
import { VotingEmailForm } from "@/components/voting-email-form";

export default function Home() {
  return (
    <div>
      {/* ...your existing content... */}
      <section className="py-12">
        <VotingEmailForm />
      </section>
    </div>
  );
}
```

### 3.2 The /vote Route
This is already created at `app/vote/page.tsx`. It:
- Validates the token from the URL
- Displays the ballot (Mr + Miss candidates)
- Handles vote submission
- Shows success/error states

Users will land here after clicking the email link.

## 4. Testing

### 4.1 Local Development
```bash
npm run dev
```

Navigate to `http://localhost:3000` and test the flow:
1. Enter email → CAPTCHA → Submit
2. Check console output (if SENDBYTE_API_KEY not set, link prints to console)
3. Copy the token from the link and manually visit: `http://localhost:3000/vote?token=xxxxx`
4. Select candidates and submit

### 4.2 Common Test Scenarios

#### Disposable Email
- Try `test@guerrillamail.com` → should reject with "disposable email" message

#### Rate Limiting
- Submit 6 requests from same IP within 1 hour → 6th should fail with "too many requests"

#### Invalid Token
- Visit `/vote?token=invalid` → should show "invalid/expired" error

#### Already Voted
- After voting, visit the same `/vote?token=xxxxx` link → should show "already voted"

## 5. Deployment Checklist

Before going live:

- [ ] Update `.env.local` with production Supabase credentials
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your live domain
- [ ] Set up email domain with SendByte (verify sender domain)
- [ ] Configure Turnstile site key for your production domain
- [ ] Test full flow on staging environment
- [ ] Back up your Supabase database
- [ ] Consider enabling RLS policies for additional security (already created in schema)
- [ ] Set up monitoring for failed emails/CAPTCHA issues

## 6. API Endpoints Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/request-vote-link` | POST | Request voting link via email |
| `/api/validate-token` | GET | Check if token is valid before rendering ballot |
| `/api/confirm-vote` | POST | Atomically record a vote |
| `/api/candidates` | GET | Fetch active candidates |

## 7. Key Features Implemented

✅ One email = one vote (enforced by email uniqueness + token expiry)
✅ Atomic voting transaction (no race conditions)
✅ Email-based voting link (magic tokens)
✅ CAPTCHA protection (Cloudflare Turnstile)
✅ Rate limiting per IP (5 requests/hour)
✅ Disposable email blocking
✅ Branded email templates (SendByte)
✅ Token expiry (10 minutes, configurable)
✅ Resend same token if not yet expired (UX-friendly)
✅ Anonymous votes (no email-vote linkage in storage)
✅ Generic error messages (no probing signals)

## 8. Troubleshooting

### Emails not sending
- Check `SENDBYTE_API_KEY` is set in `.env.local`
- In dev mode without API key, check console logs for token
- Verify sender domain is configured in the SendByte dashboard
- Use a `sk_live_` key in production (sandbox `sk_test_` keys don't deliver real email)

### CAPTCHA not loading
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set
- Check Turnstile is enabled for your domain in Cloudflare

### Database errors
- Verify migration SQL was fully executed
- Check `voters`, `candidates`, `votes` tables exist
- Confirm RLS policies aren't blocking queries (service role should bypass)

### Token validation failing
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` has proper permissions
- Verify token hasn't expired (default 10 minutes)

## 9. Future Enhancements

Consider adding:
- Admin panel for candidate management
- Live results dashboard (cached to prevent scraping)
- Vote count API with results filtering
- SMS backup verification (paid tier)
- Institutional email verification (e.g., `.unibadan.edu.ng` only)
- Audit logging and forensics dashboard

---

**Next Steps:**
1. Set up Supabase and run migrations
2. Configure `.env.local` with your credentials
3. Add `<VotingEmailForm />` to your home page
4. Test the full flow locally
5. Deploy to production!
