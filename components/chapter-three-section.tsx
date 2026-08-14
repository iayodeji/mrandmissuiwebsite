"use client";

import { useEffect, useState } from "react";
import {
  CONTESTANT_CATALOG,
  CATEGORY_LABEL,
  type CatalogCandidate,
} from "@/lib/contestant-catalog";
import { getInitials } from "./editorial-data";

function formatCount(count: number) {
  return new Intl.NumberFormat("en-US").format(count);
}

function LeaderGroup({
  title,
  entries,
  voteCount,
}: {
  title: string;
  entries: CatalogCandidate[];
  voteCount: (c: CatalogCandidate) => number;
}) {
  return (
    <div className="leaderboard-group">
      <h3 className="leaderboard-group-title">{title}</h3>
      <div className="leaderboard-list" role="list" aria-label={`${title} rankings`}>
        {entries.map((entry, index) => (
          <div className="leader-row" role="listitem" key={entry.id}>
            <span className="leader-rank">#{index + 1}</span>
            <span
              className={`leader-thumb${entry.photo_url ? "" : " leader-placeholder"}`}
              aria-label={`Portrait of ${entry.name}`}
              role="img"
            >
              {entry.photo_url ? (
                <img src={entry.photo_url} alt={entry.name} className="leader-photo" />
              ) : (
                getInitials(entry.name)
              )}
            </span>
            <div>
              <div className="leader-name">{entry.name}</div>
              <div className="leader-sub">
                {entry.faculty ? `${entry.faculty} · ` : ""}
                {CATEGORY_LABEL[entry.category]}
              </div>
            </div>
            <div className="leader-votes">
              {formatCount(voteCount(entry))}
              <span>votes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChapterThreeSection() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/leaderboard", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = (await res.json()) as { counts: Record<string, number> };
        setCounts(data.counts);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error loading leaderboard:", err);
        }
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const voteCount = (c: CatalogCandidate) => counts?.[c.id] ?? 0;
  const sortByVotes = (a: CatalogCandidate, b: CatalogCandidate) =>
    voteCount(b) - voteCount(a) ||
    a.contestant_number - b.contestant_number;

  const mr = CONTESTANT_CATALOG.filter((c) => c.category === "mr").sort(sortByVotes);
  const miss = CONTESTANT_CATALOG.filter((c) => c.category === "miss").sort(sortByVotes);

  return (
    <section className="section leaderboard-section" id="leaderboard" aria-labelledby="leaderboard-title">
      <div className="leaderboard-head">
        <div>
          <p className="eyebrow">03 / The pulse</p>
          <h2 className="section-title" id="leaderboard-title">
            Live
            <br />
            <em>leaderboard.</em>
          </h2>
        </div>
        <p className="leaderboard-intro">
          The numbers move as the community votes. Return often, support your candidate, and watch the race for the crown unfold in real time.
        </p>
      </div>

      <LeaderGroup title="Mr Unibadan" entries={mr} voteCount={voteCount} />
      <LeaderGroup title="Miss Unibadan" entries={miss} voteCount={voteCount} />
    </section>
  );
}
