import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { LEADERBOARD, formatVotes } from "@/components/editorial-data";
import { SITE_EDITION, makeMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: `Live Leaderboard — Mr & Miss Unibadan ${SITE_EDITION} Votes`,
  description: `Live voting leaderboard for Mr and Miss Unibadan ${SITE_EDITION}. See how every University of Ibadan contestant ranks by votes, and make your vote count.`,
  path: "/leaderboard",
});

export default function LeaderboardPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Leaderboard", path: "/leaderboard" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">Leaderboard</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Final results · {SITE_EDITION}</p>
          <h1 className="seo-title">
            The <em>leaderboard</em>
          </h1>
          <p className="seo-lead">
            The truth has been revealed. These are the final standings for the Mr &amp; Miss
            Unibadan {SITE_EDITION} people&apos;s choice vote — a testament to the
            contestants who captured the heart of the University of Ibadan.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "24px" }}>
            Your OTP contestants have been chosen. Watch them compete
            at the <strong>Grand Finale on the 19th of September</strong>.
          </p>
          <div className="seo-hero__actions">
            <a className="ghost-button focus-ring" href="/contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/">
              Return Home <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Standings</p>
            <h2 className="seo-section__title">
              Ranked by <em>your votes</em>
            </h2>
            <p className="seo-section__copy">
              The final standings are locked in. These numbers represent the true voice
              of the University of Ibadan community.
            </p>
          </div>

          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Contestant</th>
                  <th scope="col">Faculty</th>
                  <th scope="col">Votes</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((entry) => (
                  <tr key={entry.id}>
                    <td>{String(entry.rank).padStart(2, "0")}</td>
                    <td>
                      <a href={`/contestants/${entry.id}`}>{entry.name}</a>
                    </td>
                    <td>{entry.discipline}</td>
                    <td>{formatVotes(entry.voteCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="seo-section__head">
          <p className="eyebrow">Every vote counts</p>
          <h2 className="seo-section__title">
            Behind the <em>numbers</em>
          </h2>
        </div>
        <div className="seo-body">
          <p>
            Each entry on this leaderboard represents a real, verified ballot: one email, one
            vote. The totals are tallied from confirmed votes only — ensuring the standings
            reflect genuine support from the UI community.
          </p>
          <p>
            The voting period is now closed. The results stand as a testament to the
            contestants who truly represented the spirit of the University of Ibadan.
            Catch the final reveal at the <strong>Grand Finale on the 19th of September</strong>.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
