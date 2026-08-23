import { CONTESTANT_CATALOG } from "./contestant-catalog";
import { CONTESTANTS } from "../components/editorial-data";

export type ContestantCategory = "mr" | "miss" | "alumni";

export interface ContestantProfile {
  slug: string;
  name: string;
  category: ContestantCategory;
  /** "Mr Unibadan" / "Miss Unibadan" / "Alumni" */
  categoryLabel: string;
  contestantNumber: number | null;
  faculty: string | null;
  discipline: string | null;
  reign: string | null;
  quote: string | null;
  image: string | null;
  isAlumni: boolean;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/’|‘|'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProfiles(): ContestantProfile[] {
  const catalog: ContestantProfile[] = CONTESTANT_CATALOG.map((c) => ({
    slug: slugifyName(c.name),
    name: c.name,
    category: c.category,
    categoryLabel: c.category === "mr" ? "Mr Unibadan" : "Miss Unibadan",
    contestantNumber: c.contestant_number,
    faculty: c.faculty,
    discipline: null,
    reign: `${c.category === "mr" ? "Mr" : "Miss"} Unibadan ${c.contestant_number} / ${c.contestant_number}`,
    quote: c.quote,
    image: c.photo_url,
    isAlumni: false,
  }));

  const alumni: ContestantProfile[] = CONTESTANTS.filter((c) => c.id !== "the-next-crown").map(
    (c) => ({
      slug: slugifyName(c.name),
      name: c.name,
      category: c.reign.startsWith("Mr UI") ? "mr" : "miss",
      categoryLabel: "Alumni",
      contestantNumber: null,
      faculty: null,
      discipline: c.discipline,
      reign: c.reign,
      quote: c.quote,
      image: c.image,
      isAlumni: true,
    })
  );

  return [...catalog, ...alumni];
}

export const CONTESTANT_PROFILES: readonly ContestantProfile[] = buildProfiles();

export const MR_CANDIDATE_PROFILES: readonly ContestantProfile[] = CONTESTANT_PROFILES.filter(
  (p) => p.category === "mr" && !p.isAlumni
);

export const MISS_CANDIDATE_PROFILES: readonly ContestantProfile[] = CONTESTANT_PROFILES.filter(
  (p) => p.category === "miss" && !p.isAlumni
);

export const ALUMNI_PROFILES: readonly ContestantProfile[] = CONTESTANT_PROFILES.filter(
  (p) => p.isAlumni
);

export function getContestantProfileBySlug(slug: string): ContestantProfile | undefined {
  return CONTESTANT_PROFILES.find((p) => p.slug === slug);
}

export function contestantProfileUrl(slug: string): string {
  return `/contestants/${slug}`;
}

export function contestantTitle(p: ContestantProfile): string {
  const role = p.isAlumni
    ? p.reign
    : p.category === "mr"
      ? "Mr Unibadan Contestant"
      : "Miss Unibadan Contestant";
  return `${p.name} — ${role}`;
}

export function contestantDescription(p: ContestantProfile): string {
  const bits = [
    p.name,
    p.isAlumni
      ? p.reign
      : `${p.category === "mr" ? "Mr" : "Miss"} Unibadan contestant #${String(
          p.contestantNumber ?? ""
        ).padStart(2, "0")}`,
  ];
  if (p.faculty) bits.push(p.faculty);
  if (p.discipline) bits.push(p.discipline);
  if (p.quote) bits.push(`“${p.quote}”`);
  bits.push("University of Ibadan — Mr & Miss Unibadan 2026.");
  return bits.join(" · ");
}
