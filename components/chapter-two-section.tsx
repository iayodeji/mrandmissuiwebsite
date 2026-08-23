"use client";

import {
  MR_CANDIDATES,
  MISS_CANDIDATES,
  CATEGORY_LABEL,
  type CatalogCandidate,
} from "@/lib/contestant-catalog";
import { getInitials } from "./editorial-data";

function ContestantCard({ contestant }: { contestant: CatalogCandidate }) {
  const number = `#${String(contestant.contestant_number).padStart(2, "0")}`;

  return (
    <article className="contestant-card">
      <div
        className={`contestant-image-wrap${
          contestant.photo_url ? "" : " contestant-placeholder"
        }`}
        role="img"
        aria-label={`Portrait of ${contestant.name}`}
      >
        {contestant.photo_url ? (
          <img
            src={contestant.photo_url}
            alt={contestant.name}
            className="contestant-photo"
            loading="lazy"
          />
        ) : (
          <div className="placeholder-art" aria-hidden="true">
            <span className="placeholder-orbit" />
            <span className="placeholder-monogram">{getInitials(contestant.name)}</span>
            <span className="placeholder-caption mono">Portrait study / 2026</span>
          </div>
        )}
        <span className="number-badge" aria-label={`Contestant ${number}`}>
          {number}
        </span>
      </div>
      <div className="contestant-info">
        <h3 className="contestant-name">{contestant.name}</h3>
        <div className="contestant-field">
          <span>{contestant.faculty ?? "—"}</span>
          <span>{CATEGORY_LABEL[contestant.category]}</span>
        </div>
        {contestant.quote && (
          <p className="contestant-quote">&ldquo;{contestant.quote}&rdquo;</p>
        )}
      </div>
    </article>
  );
}

function ContestantGroup({
  title,
  contestants,
}: {
  title: string;
  contestants: readonly CatalogCandidate[];
}) {
  return (
    <div className="contestant-group">
      <h3 className="contestant-group-title">{title}</h3>
      <div className="contestant-grid">
        {contestants.map((contestant) => (
          <ContestantCard contestant={contestant} key={contestant.id} />
        ))}
      </div>
    </div>
  );
}

export function ChapterTwoSection() {
  return (
    <section className="contestants-section" id="contestants" aria-labelledby="contestants-title">
      <div className="contestants-inner">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow dark-eyebrow">02 / The candidates</p>
            <h2 className="section-title" id="contestants-title">
              Meet the
              <br />
              <em>contenders.</em>
            </h2>
          </div>
          <p className="contestants-summary">
            Every portrait carries a different discipline, story, and kind of presence. These are your OTP contestants heading to the Grand Finale on the 19th of September.
          </p>
        </div>

        <ContestantGroup title="Mr Unibadan" contestants={MR_CANDIDATES} />
        <ContestantGroup title="Miss Unibadan" contestants={MISS_CANDIDATES} />
      </div>
    </section>
  );
}
