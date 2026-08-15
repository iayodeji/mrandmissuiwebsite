import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import { SITE_EDITION, makeMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { MISS_CANDIDATE_PROFILES } from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `Miss Unibadan ${SITE_EDITION} Contestants — Miss UI Candidates`,
  description: `Meet all Miss Unibadan ${SITE_EDITION} contestants — the Miss UI candidates of the University of Ibadan. Browse profiles, faculties and quotes, then cast your vote for Miss Unibadan.`,
  path: "/miss-unibadan-contestants",
  titleAbsolute: true,
});

export default function MissContestantsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contestants", path: "/contestants" },
          { name: "Miss Unibadan", path: "/miss-unibadan-contestants" },
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
          <li aria-current="page">Miss Unibadan</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Miss Unibadan · {SITE_EDITION}</p>
          <h1 className="seo-title">
            Miss <em>Unibadan</em> {SITE_EDITION}
          </h1>
          <p className="seo-lead">
            Meet the {MISS_CANDIDATE_PROFILES.length} candidates vying to become Miss Unibadan
            {SITE_EDITION} — the young women carrying the identity of the University of Ibadan
            forward. Choose your Miss and make your vote count.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Vote for Miss Unibadan <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/mr-unibadan-contestants">
              Mr Unibadan candidates <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="miss-candidates">
        <div className="seo-section__head">
          <p className="eyebrow">Candidates</p>
          <h2 className="seo-section__title" id="miss-candidates">
            The Miss <em>Unibadan</em> lineup
          </h2>
          <p className="seo-section__copy">
            Ten students nominated from faculties across UI — from Nursing and Agriculture to
            the Sciences and the Arts. Each profile carries the candidate&apos;s number,
            faculty and personal motto.
          </p>
        </div>
        <div className="seo-grid">
          {MISS_CANDIDATE_PROFILES.map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
