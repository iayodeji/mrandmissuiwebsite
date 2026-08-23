import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import {
  SITE_NAME,
  SITE_EDITION,
  DEFAULT_OG_IMAGE,
  siteImage,
  makeMetadata,
  personJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import {
  CONTESTANT_PROFILES,
  MR_CANDIDATE_PROFILES,
  MISS_CANDIDATE_PROFILES,
  ALUMNI_PROFILES,
  getContestantProfileBySlug,
  contestantProfileUrl,
  contestantTitle,
  contestantDescription,
  type ContestantProfile,
} from "@/lib/contestant-seo";

export function generateStaticParams() {
  return CONTESTANT_PROFILES.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getContestantProfileBySlug(slug);
  if (!profile) return makeMetadata({ title: "Contestant not found", description: "", noindex: true });

  return makeMetadata({
    title: contestantTitle(profile),
    description: contestantDescription(profile),
    path: contestantProfileUrl(slug),
    image: profile.image ?? DEFAULT_OG_IMAGE,
  });
}

function roleLabel(profile: ContestantProfile): string {
  if (profile.isAlumni) return profile.reign ?? "Mr & Miss UI alumni";
  if (profile.category === "mr") return "Mr Unibadan Contestant";
  return "Miss Unibadan Contestant";
}

function relatedProfiles(profile: ContestantProfile): ContestantProfile[] {
  if (profile.isAlumni) return ALUMNI_PROFILES.filter((p) => p.slug !== profile.slug).slice(0, 3);
  const pool = profile.category === "mr" ? MR_CANDIDATE_PROFILES : MISS_CANDIDATE_PROFILES;
  return pool.filter((p) => p.slug !== profile.slug).slice(0, 3);
}

export default async function ContestantProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getContestantProfileBySlug(slug);
  if (!profile) notFound();

  const number = profile.contestantNumber
    ? `#${String(profile.contestantNumber).padStart(2, "0")}`
    : null;
  const url = contestantProfileUrl(profile.slug);
  const related = relatedProfiles(profile);

  return (
    <PageShell>
      <JsonLd
        data={[
          personJsonLd({
            name: profile.name,
            url,
            image: profile.image ?? undefined,
            jobTitle: roleLabel(profile),
            alumniOf: "University of Ibadan",
            description: contestantDescription(profile),
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contestants", path: "/contestants" },
            { name: profile.name, path: url },
          ]),
        ]}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/contestants">Contestants</a>
          </li>
          <li aria-current="page">{profile.name}</li>
        </ol>
      </nav>

      <section className="seo-profile-hero">
        <div className="seo-profile-hero__inner">
          {profile.image && (
            <div className="seo-profile-hero__photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.image}
                alt={`${profile.name} — ${roleLabel(profile)}, University of Ibadan`}
              />
            </div>
          )}
          <div className="seo-profile-hero__copy">
            <p className="seo-kicker">
              {profile.isAlumni ? "Mr & Miss UI Alumni" : profile.categoryLabel} · {SITE_EDITION}
            </p>
            <h1 className="seo-profile-hero__title">
              {profile.name.split(" ").slice(0, -1).join(" ")} <em>{profile.name.split(" ").slice(-1)}</em>
            </h1>

            <div className="seo-profile-hero__facts">
              {number && (
                <div className="seo-profile-hero__fact">
                  <p className="seo-profile-hero__fact-label">Contestant number</p>
                  <p className="seo-profile-hero__fact-value">{number}</p>
                </div>
              )}
              {(profile.faculty || profile.discipline) && (
                <div className="seo-profile-hero__fact">
                  <p className="seo-profile-hero__fact-label">
                    {profile.isAlumni ? "Discipline" : "Faculty"}
                  </p>
                  <p className="seo-profile-hero__fact-value">
                    {profile.faculty ?? profile.discipline}
                  </p>
                </div>
              )}
              {profile.reign && !profile.isAlumni && (
                <div className="seo-profile-hero__fact">
                  <p className="seo-profile-hero__fact-label">Category</p>
                  <p className="seo-profile-hero__fact-value">{profile.categoryLabel}</p>
                </div>
              )}
              <div className="seo-profile-hero__fact">
                <p className="seo-profile-hero__fact-label">University</p>
                <p className="seo-profile-hero__fact-value">University of Ibadan</p>
              </div>
            </div>

            {profile.quote && (
              <blockquote className="seo-profile-hero__quote">“{profile.quote}”</blockquote>
            )}

            <div className="seo-profile-hero__actions">
              <a className="gold-button focus-ring" href="/leaderboard">
                See final standings <span aria-hidden="true">↗</span>
              </a>
              <a className="ghost-button focus-ring" href="/contestants">
                All contestants <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">The candidate</p>
            <h2 className="seo-section__title">
              About <em>{profile.name.split(" ")[0]}</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              {profile.name} is {profile.isAlumni ? "a former titleholder" : "one of the twenty contestants"} of
              {SITE_NAME} {SITE_EDITION}, representing the{" "}
              {profile.faculty ?? profile.discipline ?? "University of Ibadan"} in the{" "}
              {profile.isAlumni ? profile.reign : profile.categoryLabel} category.
              {profile.isAlumni
                ? " Their reign set the standard for the class that followed."
                : ` Carrying contestant number ${profile.contestantNumber ?? ""}, they are competing to become ${profile.categoryLabel} ${SITE_EDITION}.`}
            </p>
            <p>
              {profile.name.split(" ")[0]}&apos;s candidacy embodies the spirit of the University
              of Ibadan — brilliance, grace and a commitment to the people&apos;s choice.{" "}
              {profile.quote ? (
                <>
                  Their motto — <em>“{profile.quote}”</em> — captures exactly that.
                </>
              ) : (
                "Every vote brings the crown one step closer."
              )}
            </p>
            <p>
              The winners of {SITE_NAME} {SITE_EDITION} are decided entirely by verified public
              votes, so every single ballot counts. If {profile.name.split(" ")[0]} has earned
              your support, <a href="/#vote">cast your vote</a> — and check the{" "}
              <a href="/leaderboard">live leaderboard</a> to see how the race is shaping up.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="related-contestants">
        <div className="seo-section__head">
          <p className="eyebrow">More contestants</p>
          <h2 className="seo-section__title" id="related-contestants">
            Also in the <em>running</em>
          </h2>
        </div>
        <div className="seo-related">
          {related.map((relatedProfile) => (
            <ContestantCard key={relatedProfile.slug} profile={relatedProfile} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
