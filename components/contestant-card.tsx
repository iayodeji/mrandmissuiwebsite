import type { ContestantProfile } from "@/lib/contestant-seo";
import { contestantProfileUrl } from "@/lib/contestant-seo";

export function ContestantCard({ profile }: { profile: ContestantProfile }) {
  const number = profile.contestantNumber
    ? `#${String(profile.contestantNumber).padStart(2, "0")}`
    : null;

  return (
    <a className="seo-card focus-ring" href={contestantProfileUrl(profile.slug)}>
      <div className="seo-card__media">
        {profile.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.image}
            alt={`${profile.name} — ${profile.isAlumni ? profile.reign ?? "Mr & Miss UI alumni" : `${profile.categoryLabel} contestant`} portrait`}
            loading="lazy"
            decoding="async"
          />
        )}
        {number && <span className="seo-card__number">{number}</span>}
      </div>
      <div className="seo-card__body">
        <h3 className="seo-card__name">{profile.name}</h3>
        <p className="seo-card__faculty">
          {profile.faculty ?? profile.discipline ?? profile.reign}
        </p>
        {profile.quote && <p className="seo-card__quote">“{profile.quote}”</p>}
        <span className="seo-card__cta">
          View profile <span aria-hidden="true">↘</span>
        </span>
      </div>
    </a>
  );
}
