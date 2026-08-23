import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import {
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_EDITION,
  makeMetadata,
  eventJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import {
  CONTESTANT_PROFILES,
  MR_CANDIDATE_PROFILES,
  MISS_CANDIDATE_PROFILES,
} from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `Mr and Miss UI ${SITE_EDITION} — Vote for ${SITE_NAME_SHORT} 2026`,
  description: `Mr and Miss UI is the people's choice pageant of the University of Ibadan. Meet all ${SITE_EDITION} contestants, follow the live leaderboard and cast your vote for Mr & Miss Unibadan ${SITE_EDITION}.`,
  path: "/mr-and-miss-ui",
  titleAbsolute: true,
});

export default function MrAndMissUiPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          eventJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Mr and Miss UI", path: "/mr-and-miss-ui" },
          ]),
        ]}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">Mr and Miss UI</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Mr &amp; Miss UI · {SITE_EDITION} edition</p>
          <h1 className="seo-title">
            Mr and Miss <em>UI</em> {SITE_EDITION}
          </h1>
          <p className="seo-lead">
            The official people&apos;s choice pageant of the University of Ibadan. The votes
            are in and the truth has been revealed. Meet your OTP contestants heading
            to the <strong>Grand Finale on the 19th of September</strong>.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/leaderboard">
              See final standings <span aria-hidden="true">↗</span>
            </a>
            <a className="ghost-button focus-ring" href="/contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="seo-hero__meta">
            <div className="seo-hero__meta-item">
              <strong>20</strong> Contestants
            </div>
            <div className="seo-hero__meta-item">
              <strong>10 + 10</strong> Mr &amp; Miss
            </div>
            <div className="seo-hero__meta-item">
              <strong>01</strong> Crown night
            </div>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">The pageant</p>
            <h2 className="seo-section__title">
              What is <em>Mr and Miss UI?</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              Mr and Miss UI — officially {SITE_NAME} — is the flagship beauty, intellect and
              leadership pageant of the University of Ibadan (UI), Nigeria&apos;s premier
              university. Each year, twenty students are chosen to represent the faculties of
              UI; ten contend for the crown of Mr Unibadan and ten for Miss Unibadan.
            </p>
            <p>
              Unlike a traditional beauty pageant, {SITE_NAME} is a <strong>people&apos;s
              choice</strong> contest. The student body decides who carries the crown. Every
              vote is verified by email and counts toward the live leaderboard, so the winners
              are crowned by the community they represent.
            </p>
            <p>
              The {SITE_EDITION} edition celebrates the values that define a Unibadan student:
              advocacy, leadership and legacy. From the lecture theatres to the great hall, the
              contestants carry the identity of UI forward — and now, you decide who does it
              best.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="contestants-2026">
        <div className="seo-section__head">
          <p className="eyebrow">The {SITE_EDITION} lineup</p>
          <h2 className="seo-section__title" id="contestants-2026">
            Meet the <em>contestants</em>
          </h2>
          <p className="seo-section__copy">
            Ten Mr Unibadan candidates and ten Miss Unibadan candidates, drawn from faculties
            across the University of Ibadan. Every profile links to the full contestant page.
          </p>
        </div>
        <div className="seo-grid">
          {CONTESTANT_PROFILES.filter((p) => !p.isAlumni).map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Two crowns</p>
            <h2 className="seo-section__title">
              Mr Unibadan &amp; <em>Miss Unibadan</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              The contest is split into two categories. <strong>Mr Unibadan</strong> —{" "}
              {MR_CANDIDATE_PROFILES.length} male candidates from faculties like Dentistry,
              Computing, Science and the Arts — and <strong>Miss Unibadan</strong> —{" "}
              {MISS_CANDIDATE_PROFILES.length} female candidates from Nursing, Agriculture,
              Education and beyond. You select one Mr candidate and one Miss candidate, then
              submit a single ballot.
            </p>
            <p>
              <a href="/mr-unibadan-contestants">Browse all Mr Unibadan contestants</a> or{" "}
              <a href="/miss-unibadan-contestants">browse all Miss Unibadan contestants</a>.
              Prefer a quick view? The <a href="/leaderboard">final leaderboard</a> ranks every
              candidate by votes.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="seo-section__head">
          <p className="eyebrow">The truth revealed</p>
          <h2 className="seo-section__title">
            Your OTP <em>contestants</em>
          </h2>
        </div>
        <div className="seo-body">
          <p>
            The votes have been counted and the people have spoken. These are the contestants
            who captured the hearts of the University of Ibadan community. Watch them compete
            at the <strong>Grand Finale on the 19th of September</strong> for the crown
            of Mr &amp; Miss Unibadan {SITE_EDITION}.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
