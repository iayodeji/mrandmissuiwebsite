-- Mr & Miss Unibadan Voting System Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
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
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  category TEXT NOT NULL CHECK (category IN ('mr', 'miss')),
  vote_session_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_voters_email ON voters(email);
CREATE INDEX idx_voters_vote_token ON voters(vote_token);
CREATE INDEX idx_candidates_category ON candidates(category);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_votes_vote_session_id ON votes(vote_session_id);

-- Atomic confirm vote function (transaction-safe)
CREATE OR REPLACE FUNCTION confirm_vote_atomic(
  p_token TEXT,
  p_mr_candidate_id UUID,
  p_miss_candidate_id UUID,
  p_vote_session_id UUID
)
RETURNS void AS $$
BEGIN
  -- Step 1: Atomically claim the token
  UPDATE voters
  SET has_voted = true
  WHERE vote_token = p_token
    AND has_voted = false
    AND token_expires_at > now();

  -- If no rows were updated, the transaction is complete (token already used, expired, or invalid)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Step 2: Insert both votes
  INSERT INTO votes (candidate_id, category, vote_session_id)
  VALUES
    (p_mr_candidate_id, 'mr', p_vote_session_id),
    (p_miss_candidate_id, 'miss', p_vote_session_id);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security) if desired for additional security
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: voters table is only accessible to authenticated service role
-- (Service Role has bypass, so this is mainly for safety if using anon key)
CREATE POLICY "voters_accessible_to_service_role" ON voters
  FOR ALL USING (auth.uid() IS NOT NULL OR current_user = 'postgres');

-- RLS Policy: votes table is insert-only for votes, select for counting
CREATE POLICY "votes_insertable" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "votes_readable" ON votes
  FOR SELECT USING (true);

-- RLS Policy: candidates are readable by anyone
CREATE POLICY "candidates_readable" ON candidates
  FOR SELECT USING (true);
