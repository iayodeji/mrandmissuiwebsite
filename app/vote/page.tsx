"use client";

import { Suspense } from "react";

function VotePageContent() {
  return (
    <div className="ballot-page">
      <div className="ballot-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <p className="eyebrow">Voting Closed</p>
        <h1 className="ballot-title">
          The truth has been <em>revealed</em>.
        </h1>
        <p className="ballot-head-copy" style={{ marginBottom: '32px' }}>
          Voting for Mr & Miss Unibadan 2026 is officially closed.
          The leaderboard now reflects the true voice of UI.
        </p>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: 1.6,
          marginBottom: '32px',
          color: 'var(--text-muted, #888)',
        }}>
          Your OTP contestants have been chosen. Watch them compete
          at the <strong>Grand Finale on the 19th of September</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/leaderboard" className="gold-button focus-ring">
            See final standings <span aria-hidden="true">↗</span>
          </a>
          <a href="/" className="ghost-button focus-ring">
            Return Home <span aria-hidden="true">↗</span>
          </a>
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
