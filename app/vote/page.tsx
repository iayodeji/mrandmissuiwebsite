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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ballot...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Voting Link</h1>
          </div>
          <p className="text-gray-600 mb-6">
            {error || "This voting link is invalid, expired, or has already been used."}
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="text-5xl mb-2">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Vote Recorded!</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Thank you for voting! Your vote has been successfully recorded and cannot be changed.
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">🎭 Mr & Miss Unibadan</h1>
          <p className="text-center text-gray-600 mb-8">Cast your vote now</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Mr Candidates */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">👨 Mr Unibadan</h2>
              <div className="space-y-3">
                {candidates.mr.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedMr(candidate.id)}
                    className={`w-full p-4 rounded-lg border-2 transition cursor-pointer text-left ${
                      selectedMr === candidate.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-gray-50 hover:border-indigo-300"
                    }`}
                  >
                    {candidate.photo_url && (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold">{candidate.name}</p>
                    {selectedMr === candidate.id && (
                      <p className="text-indigo-600 text-sm mt-1">✓ Selected</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Miss Candidates */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">👩 Miss Unibadan</h2>
              <div className="space-y-3">
                {candidates.miss.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedMiss(candidate.id)}
                    className={`w-full p-4 rounded-lg border-2 transition cursor-pointer text-left ${
                      selectedMiss === candidate.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-gray-50 hover:border-indigo-300"
                    }`}
                  >
                    {candidate.photo_url && (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold">{candidate.name}</p>
                    {selectedMiss === candidate.id && (
                      <p className="text-indigo-600 text-sm mt-1">✓ Selected</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSubmit}
              disabled={!selectedMr || !selectedMiss || submitting}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                selectedMr && selectedMiss && !submitting
                  ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Vote"}
            </button>
            <p className="text-center text-sm text-gray-500">
              ⚠️ Once submitted, your vote cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ballot...</p>
        </div>
      </div>
    }>
      <VotePageContent />
    </Suspense>
  )};