import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import { SITE_EDITION, makeMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { ALUMNI_PROFILES } from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `Past Winners — Mr UI & Miss UI Lineage | ${SITE_EDITION} Edition`,
  description: `The lineage of Mr and Miss UI: past winners of the Mr & Miss Unibadan pageant at the University of Ibadan, from Mr UI 2021/22 to the ${SITE_EDITION} crown.`,
  path: "/past-winners",
  titleAbsolute: true,
});

export default function PastWinnersPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Past Winners", path: "/past-winners" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">Past Winners</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">The lineage</p>
          <h1 className="seo-title">
            Past <em>winners</em>
          </h1>
          <p className="seo-lead">
            Before the {SITE_EDITION} crown, there was a lineage. Meet the recent Mr UI and
            Miss UI titleholders whose reigns set the standard the current contestants are
            reaching for.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/contestants">
              Meet this year&apos;s contestants <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Roll of honour</p>
            <h2 className="seo-section__title">
              The Mr &amp; Miss UI <em>lineage</em>
            </h2>
            <p className="seo-section__copy">
              Every titleholder profiled below carried the identity of the University of Ibadan
              forward during their reign — and handed the standard to the next class.
            </p>
          </div>

          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Contestant</th>
                  <th scope="col">Discipline</th>
                </tr>
              </thead>
              <tbody>
                {ALUMNI_PROFILES.map((profile) => (
                  <tr key={profile.slug}>
                    <td>{profile.reign}</td>
                    <td>
                      <a href={`/contestants/${profile.slug}`}>{profile.name}</a>
                    </td>
                    <td>{profile.discipline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="alumni-profiles">
        <div className="seo-section__head">
          <p className="eyebrow">Profiles</p>
          <h2 className="seo-section__title" id="alumni-profiles">
            The <em>titleholders</em>
          </h2>
          <p className="seo-section__copy">
            Open each profile to read the motto behind the reign. The {SITE_EDITION} class is
            next — and your vote decides who joins them.
          </p>
        </div>
        <div className="seo-grid">
          {ALUMNI_PROFILES.map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
