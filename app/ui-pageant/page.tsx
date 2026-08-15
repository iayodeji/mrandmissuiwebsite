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
import { ALUMNI_PROFILES, CONTESTANT_PROFILES } from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `UI Pageant — University of Ibadan Pageant ${SITE_EDITION} | ${SITE_NAME_SHORT}`,
  description: `The University of Ibadan (UI) pageant, ${SITE_EDITION} edition. ${SITE_NAME} is the people's choice pageant of UI — meet every Mr and Miss contestant, follow live votes and vote for the crown.`,
  path: "/ui-pageant",
  titleAbsolute: true,
});

export default function UiPageantPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          eventJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "UI Pageant", path: "/ui-pageant" },
          ]),
        ]}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">UI Pageant</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">University of Ibadan · {SITE_EDITION}</p>
          <h1 className="seo-title">
            The UI <em>Pageant</em>
          </h1>
          <p className="seo-lead">
            {SITE_NAME} {SITE_EDITION} is the pageant of the University of Ibadan — the oldest
            and one of the most prestigious universities in Nigeria. This is where the campus
            crowns its Mr Unibadan and Miss Unibadan, and you hold the deciding vote.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Vote in the pageant <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/past-winners">
              Past Mr &amp; Miss UI <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="seo-hero__meta">
            <div className="seo-hero__meta-item">
              <strong>1948</strong> Founded
            </div>
            <div className="seo-hero__meta-item">
              <strong>{SITE_EDITION}</strong> Edition
            </div>
            <div className="seo-hero__meta-item">
              <strong>2</strong> Crowns
            </div>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Campus tradition</p>
            <h2 className="seo-section__title">
              A pageant rooted in <em>UI tradition</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              The University of Ibadan has always been a stage. From its famous debating halls
              to its drama productions, UI cultivates students who speak, lead and perform with
              confidence. {SITE_NAME} — the Mr and Miss Unibadan pageant — is the campus&apos;s
              annual celebration of that culture, wrapped in a crown night that the whole
              university watches.
            </p>
            <p>
              For the {SITE_EDITION} edition, the contest follows a people&apos;s choice format:
              the twenty candidates are shortlisted by their faculties, but the winners are
              chosen entirely by student votes collected on this platform. No judges, no
              backroom deals — just the community&apos;s verdict.
            </p>
            <p>
              Alumni of the pageant have gone on to lead student unions, found initiatives and
              represent UI on national stages. See the <a href="/past-winners">roll of honour</a>{" "}
              from previous Mr &amp; Miss UI editions, then decide who joins them.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="pageant-2026">
        <div className="seo-section__head">
          <p className="eyebrow">{SITE_EDITION} lineup</p>
          <h2 className="seo-section__title" id="pageant-2026">
            This year&apos;s <em>pageant contestants</em>
          </h2>
          <p className="seo-section__copy">
            All twenty candidates competing in the University of Ibadan pageant, {SITE_EDITION}
            edition — ten for Mr Unibadan and ten for Miss Unibadan.
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
            <p className="eyebrow dark-eyebrow">Lineage</p>
            <h2 className="seo-section__title">
              From past crowns to <em>the next one</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              Every edition of the UI pageant adds a new name to a lineage that stretches back
              through the university&apos;s modern era. The {ALUMNI_PROFILES.length} most recent
              Mr &amp; Miss UI winners are profiled on this site — each one a reminder of the
              standard the {SITE_EDITION} contestants are reaching for.
            </p>
            <p>
              The next chapter of that story is being written right now, one vote at a time.
              Don&apos;t watch from the sidelines — <a href="/mr-and-miss-ui">meet the
              contestants</a>, follow the <a href="/leaderboard">leaderboard</a>, and{" "}
              <a href="/vote">cast your ballot</a>.
            </p>
          </div>
          <div className="seo-related">
            {ALUMNI_PROFILES.slice(0, 3).map((profile) => (
              <ContestantCard key={profile.slug} profile={profile} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
