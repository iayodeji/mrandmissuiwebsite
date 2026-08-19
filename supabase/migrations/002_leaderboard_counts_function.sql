-- Leaderboard counts function
-- Returns vote counts grouped by candidate_id, avoiding the 1000-row
-- PostgREST default limit that caused some candidates to show 0 votes.

CREATE OR REPLACE FUNCTION get_leaderboard_counts()
RETURNS TABLE(candidate_id UUID, vote_count BIGINT) AS $$
  SELECT v.candidate_id, COUNT(*)::BIGINT AS vote_count
  FROM votes v
  GROUP BY v.candidate_id;
$$ LANGUAGE sql STABLE;
