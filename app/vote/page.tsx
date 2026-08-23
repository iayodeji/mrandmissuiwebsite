"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MR_CANDIDATES,
  MISS_CANDIDATES,
  CATEGORY_LABEL,
  type CatalogCandidate,
} from "@/lib/contestant-catalog";

function CandidateOption({
  candidate,
  selected,
  onSelect,
}: {
  candidate: CatalogCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  const number = String(candidate.contestant_number).padStart(2, "0");

  return (
    <button
      onClick={onSelect}
      className={`candidate-option${selected ? " candidate-option--selected" : ""}`}
    >
      {candidate.photo_url && (
        <img
          src={candidate.photo_url}
          alt={candidate.name}
          className="candidate-option-photo"
          loading="lazy"
        />
      )}
      <span className="candidate-option-info">
        <span className="candidate-option-number">{number}</span>
        <span className="candidate-option-name">{candidate.name}</span>
        {candidate.faculty && (
          <span className="candidate-option-faculty">{candidate.faculty}</span>
        )}
        {candidate.quote && (
          <span className="candidate-option-quote">“{candidate.quote}”</span>
        )}
      </span>
      {selected && <span className="candidate-option-check">Selected ✓</span>}
    </button>
  );
}

function VotePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [selectedMr, setSelectedMr] = useState<string | null>(null);
  const [selectedMiss, setSelectedMiss] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <h2 className="ballot-col-title">{CATEGORY_LABEL.mr}</h2>
            <div className="candidate-list">
              {MR_CANDIDATES.map((candidate) => (
                <CandidateOption
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedMr === candidate.id}
                  onSelect={() => setSelectedMr(candidate.id)}
                />
              ))}
            </div>
          </div>

          {/* Miss Candidates */}
          <div>
            <h2 className="ballot-col-title">{CATEGORY_LABEL.miss}</h2>
            <div className="candidate-list">
              {MISS_CANDIDATES.map((candidate) => (
                <CandidateOption
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedMiss === candidate.id}
                  onSelect={() => setSelectedMiss(candidate.id)}
                />
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
    <Suspense fallback={null}>
      <VotePageContent />
    </Suspense>
  );
}
