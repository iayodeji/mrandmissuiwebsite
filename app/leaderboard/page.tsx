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
          <p className="seo-kicker">Live results · {SITE_EDITION}</p>
          <h1 className="seo-title">
            The <em>leaderboard</em>
          </h1>
          <p className="seo-lead">
            Current standings for the Mr &amp; Miss Unibadan {SITE_EDITION} people&apos;s
            choice vote. Every confirmed ballot moves the numbers — make sure your favourite
            isn&apos;t left behind.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Add your vote <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
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
              The table below reflects the standings shown on the platform. During the voting
              window, live counts update on the home page as ballots are confirmed.
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
            vote. The totals are tallied from confirmed votes only, so the standings stay fair
            from the first ballot to the final count on crown night.
          </p>
          <p>
            Want to change the order? The fastest way is your own ballot — and the second
            fastest is telling your friends. <a href="/vote">Vote now</a>, or dig into the{" "}
            <a href="/faq">rules of the vote</a> first.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
