"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Candidate {
  id: string;
  name: string;
  category: "mr" | "miss";
  photo_url: string | null;
}

interface CandidatesData {
  mr: Candidate[];
  miss: Candidate[];
}

function VotePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [candidates, setCandidates] = useState<CandidatesData>({ mr: [], miss: [] });
  const [selectedMr, setSelectedMr] = useState<string | null>(null);
  const [selectedMiss, setSelectedMiss] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateAndLoadCandidates() {
      if (!token) {
        setError("No voting token provided.");
        setLoading(false);
        return;
      }

      try {
        // Validate token
        const validateRes = await fetch(`/api/validate-token?token=${encodeURIComponent(token)}`);
        const validateData = (await validateRes.json()) as { valid: boolean };

        if (!validateData.valid) {
          setError("This voting link is invalid, expired, or has already been used.");
          setLoading(false);
          return;
        }

        setTokenValid(true);

        // Fetch candidates
        const candidatesRes = await fetch("/api/candidates");
        const candidatesData = (await candidatesRes.json()) as CandidatesData;
        setCandidates(candidatesData);

        setLoading(false);
      } catch (err) {
        console.error("Error validating token or loading candidates:", err);
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    }

    validateAndLoadCandidates();
  }, [token]);

  async function handleSubmit() {
    if (!selectedMr || !selectedMiss || !token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/confirm-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mrCandidateId: selectedMr,
          missCandidateId: selectedMiss,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error || "Failed to submit vote.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError("An error occurred while submitting your vote.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="ballot-status">
        <div className="ballot-status-panel">
          <div className="ballot-spinner" role="status" aria-label="Loading ballot" />
          <p className="ballot-status-copy">Loading ballot...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="ballot-status">
        <div className="ballot-status-panel">
          <p className="eyebrow">Voting link</p>
          <h1 className="ballot-status-title">Invalid link</h1>
          <p className="ballot-status-copy">
            {error || "This voting link is invalid, expired, or has already been used."}
          </p>
          <a href="/" className="gold-button focus-ring ballot-status-action">
            Return to Home <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="ballot-status">
        <div className="ballot-status-panel">
          <p className="eyebrow">Confirmed</p>
          <h1 className="ballot-status-title">Vote recorded</h1>
          <p className="ballot-status-copy">
            Thank you for voting! Your vote has been successfully recorded and cannot be changed.
          </p>
          <a href="/" className="gold-button focus-ring ballot-status-action">
            Return to Home <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="ballot-page">
      <div className="ballot-panel">
        <div className="ballot-head">
          <p className="eyebrow">Your ballot</p>
          <h1 className="ballot-title">
            Mr &amp; <em>Miss</em> Unibadan
          </h1>
          <p className="ballot-head-copy">
            Select one Mr candidate and one Miss candidate, then submit. Once
            recorded, your vote cannot be changed.
          </p>
        </div>

        {error && <div className="ballot-error">{error}</div>}

        <div className="ballot-grid">
          {/* Mr Candidates */}
          <div>
            <h2 className="ballot-col-title">Mr Unibadan</h2>
            <div className="candidate-list">
              {candidates.mr.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedMr(candidate.id)}
                  className={`candidate-option${
                    selectedMr === candidate.id ? " candidate-option--selected" : ""
                  }`}
                >
                  {candidate.photo_url && (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.name}
                      className="candidate-option-photo"
                    />
                  )}
                  <span className="candidate-option-name">{candidate.name}</span>
                  {selectedMr === candidate.id && (
                    <span className="candidate-option-check">Selected ✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Miss Candidates */}
          <div>
            <h2 className="ballot-col-title">Miss Unibadan</h2>
            <div className="candidate-list">
              {candidates.miss.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedMiss(candidate.id)}
                  className={`candidate-option${
                    selectedMiss === candidate.id ? " candidate-option--selected" : ""
                  }`}
                >
                  {candidate.photo_url && (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.name}
                      className="candidate-option-photo"
                    />
                  )}
                  <span className="candidate-option-name">{candidate.name}</span>
                  {selectedMiss === candidate.id && (
                    <span className="candidate-option-check">Selected ✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="ballot-submit-row">
          <button
            onClick={handleSubmit}
            disabled={!selectedMr || !selectedMiss || submitting}
            className="gold-button focus-ring ballot-submit"
          >
            {submitting ? "Submitting..." : "Submit Vote"}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="ballot-warning">
            Once submitted, your vote cannot be changed
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense
      fallback={
        <div className="ballot-status">
          <div className="ballot-status-panel">
            <div className="ballot-spinner" role="status" aria-label="Loading ballot" />
            <p className="ballot-status-copy">Loading ballot...</p>
          </div>
        </div>
      }
    >
      <VotePageContent />
    </Suspense>
  );
}
