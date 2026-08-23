import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import { SITE_EDITION, makeMetadata, breadcrumbJsonLd } from "@/lib/seo";
import {
  MR_CANDIDATE_PROFILES,
  MISS_CANDIDATE_PROFILES,
} from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `All Contestants — Mr & Miss Unibadan ${SITE_EDITION}`,
  description: `Meet all 20 Mr and Miss Unibadan ${SITE_EDITION} contestants from the University of Ibadan. Browse every candidate's profile, faculty and quote.`,
  path: "/contestants",
  titleAbsolute: true,
});

export default function ContestantsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contestants", path: "/contestants" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">Contestants</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">The {SITE_EDITION} lineup</p>
          <h1 className="seo-title">
            All <em>contestants</em>
          </h1>
          <p className="seo-lead">
            Twenty students. Two crowns. One people&apos;s choice. These are your OTP contestants
            heading to the <strong>Grand Finale on the 19th of September</strong>.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/leaderboard">
              See final standings <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="mr-contestants">
        <div className="seo-section__head">
          <p className="eyebrow">Mr Unibadan</p>
          <h2 className="seo-section__title" id="mr-contestants">
            Mr <em>Unibadan</em> candidates
          </h2>
          <p className="seo-section__copy">
            {MR_CANDIDATE_PROFILES.length} male candidates competing for the Mr Unibadan
            {SITE_EDITION} crown, from faculties including Dentistry, Computing, Science and
            the Arts.
          </p>
        </div>
        <div className="seo-grid">
          {MR_CANDIDATE_PROFILES.map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Miss Unibadan</p>
            <h2 className="seo-section__title" id="miss-contestants">
              Miss <em>Unibadan</em> candidates
            </h2>
            <p className="seo-section__copy">
              {MISS_CANDIDATE_PROFILES.length} female candidates competing for the Miss
              Unibadan {SITE_EDITION} crown, from faculties including Nursing, Agriculture,
              Education and the Sciences.
            </p>
          </div>
          <div className="seo-grid">
            {MISS_CANDIDATE_PROFILES.map((profile) => (
              <ContestantCard key={profile.slug} profile={profile} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
