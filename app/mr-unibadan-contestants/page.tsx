import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import { SITE_EDITION, makeMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { MR_CANDIDATE_PROFILES } from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `Mr Unibadan ${SITE_EDITION} Contestants — Mr UI Candidates`,
  description: `Meet all Mr Unibadan ${SITE_EDITION} contestants — the Mr UI candidates of the University of Ibadan. Browse profiles, faculties and quotes, then cast your vote for Mr Unibadan.`,
  path: "/mr-unibadan-contestants",
  titleAbsolute: true,
});

export default function MrContestantsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contestants", path: "/contestants" },
          { name: "Mr Unibadan", path: "/mr-unibadan-contestants" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/contestants">Contestants</a>
          </li>
          <li aria-current="page">Mr Unibadan</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Mr Unibadan · {SITE_EDITION}</p>
          <h1 className="seo-title">
            Mr <em>Unibadan</em> {SITE_EDITION}
          </h1>
          <p className="seo-lead">
            Meet the {MR_CANDIDATE_PROFILES.length} candidates vying to become Mr Unibadan
            {SITE_EDITION} — the young men carrying the identity of the University of Ibadan
            forward. These are your OTP contestants heading to the Grand Finale on the 19th of September.
          </p>
          <div className="seo-hero__actions">
            <a className="ghost-button focus-ring" href="/miss-unibadan-contestants">
              Miss Unibadan candidates <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/leaderboard">
              See final standings <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="mr-candidates">
        <div className="seo-section__head">
          <p className="eyebrow">Candidates</p>
          <h2 className="seo-section__title" id="mr-candidates">
            The Mr <em>Unibadan</em> lineup
          </h2>
          <p className="seo-section__copy">
            Ten students nominated from faculties across UI — from the lecture halls of
            Dentistry to the studios of the Arts. Each profile carries the candidate&apos;s
            number, faculty and personal motto.
          </p>
        </div>
        <div className="seo-grid">
          {MR_CANDIDATE_PROFILES.map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
