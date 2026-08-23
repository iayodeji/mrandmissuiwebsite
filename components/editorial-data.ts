export type ContestantAction = "vote" | "profile";

export type Contestant = {
  id: string;
  number: string;
  name: string;
  image: string;
  alt: string;
  discipline: string;
  reign: string;
  quote: string;
  voteCount: number | null;
  action: ContestantAction;
  actionLabel: string;
};

export type LeaderboardEntry = Pick<
  Contestant,
  "id" | "name" | "image" | "alt" | "discipline" | "voteCount"
> & {
  rank: number;
  subline: string;
};

export type Pillar = {
  title: string;
  description: string;
};

export type EventDetail = {
  label: string;
  value: string;
};

export const CONTESTANTS: readonly Contestant[] = [
  {
    id: "olubaseyi-damilare",
    number: "#01",
    name: "Olubaseyi Damilare",
    image: "/Images-Carousels/IMG_4798.PNG",
    alt: "Olubaseyi Damilare portrait from the Mr and Miss UI archive",
    discipline: "Mathematics · 400 level",
    reign: "Mr UI 2023 / 2024",
    quote: "A standard carried with grace, intelligence, and presence.",
    voteCount: 6000,
    action: "vote",
    actionLabel: "Vote now",
  },
  {
    id: "adegbenro-daniel",
    number: "#02",
    name: "Adegbenro Daniel",
    image: "/Images-Carousels/IMG_4796.PNG",
    alt: "Adegbenro Daniel portrait from the Mr and Miss UI archive",
    discipline: "European Studies · 300 level",
    reign: "Mr UI 2022 / 2023",
    quote: "Confidence is the quiet work behind every visible crown.",
    voteCount: 5619,
    action: "vote",
    actionLabel: "Vote now",
  },
  {
    id: "anthony-jasper-laris",
    number: "#03",
    name: "Anthony Jasper Laris",
    image: "/Images-Carousels/IMG_4793.PNG",
    alt: "Anthony Jasper Laris portrait from the Mr and Miss UI archive",
    discipline: "Mathematics · 400 level",
    reign: "Mr UI 2021 / 2022",
    quote: "To represent is to turn personal excellence into shared pride.",
    voteCount: 5533,
    action: "vote",
    actionLabel: "Vote now",
  },
  {
    id: "tobiloba-oluwole",
    number: "#04",
    name: "Tobiloba Oluwole",
    image: "/Images-Carousels/image7.png",
    alt: "Tobiloba Oluwole portrait from the Mr and Miss UI archive",
    discipline: "Theater Arts · 300 level",
    reign: "Miss UI 2023 / 2024",
    quote: "A story of discipline, expression, and courageous becoming.",
    voteCount: 3448,
    action: "vote",
    actionLabel: "Vote now",
  },
  {
    id: "onuoha-marvellous",
    number: "#05",
    name: "Onuoha Marvellous",
    image: "/Images-Carousels/IMG_4752.PNG",
    alt: "Onuoha Marvellous portrait from the Mr and Miss UI archive",
    discipline: "Special Education · 300 level",
    reign: "Miss UI 2022 / 2023",
    quote: "Make presence matter — then leave something worthy behind.",
    voteCount: 3210,
    action: "vote",
    actionLabel: "Vote now",
  },
  {
    id: "the-next-crown",
    number: "#06",
    name: "The next crown",
    image: "/Images-Carousels/IMG_4757.PNG",
    alt: "A stage moment representing the next Mr and Miss UI contestant",
    discipline: "Contestant profile",
    reign: "Portrait slot / 2026 edition",
    quote: "Your story begins here.",
    voteCount: null,
    action: "profile",
    actionLabel: "View profile",
  },
] as const;

export const LEADERBOARD: readonly LeaderboardEntry[] = [
  {
    id: "olubaseyi-damilare",
    rank: 1,
    name: "Olubaseyi Damilare",
    image: "/Images-Carousels/IMG_4798.PNG",
    alt: "Olubaseyi Damilare leaderboard thumbnail",
    discipline: "Mathematics",
    subline: "Mathematics · University of Ibadan",
    voteCount: 6000,
  },
  {
    id: "adegbenro-daniel",
    rank: 2,
    name: "Adegbenro Daniel",
    image: "/Images-Carousels/IMG_4796.PNG",
    alt: "Adegbenro Daniel leaderboard thumbnail",
    discipline: "European Studies",
    subline: "European Studies · University of Ibadan",
    voteCount: 5619,
  },
  {
    id: "anthony-jasper-laris",
    rank: 3,
    name: "Anthony Jasper Laris",
    image: "/Images-Carousels/IMG_4793.PNG",
    alt: "Anthony Jasper Laris leaderboard thumbnail",
    discipline: "Mathematics",
    subline: "Mathematics · University of Ibadan",
    voteCount: 5533,
  },
  {
    id: "tobiloba-oluwole",
    rank: 4,
    name: "Tobiloba Oluwole",
    image: "/Images-Carousels/image7.png",
    alt: "Tobiloba Oluwole leaderboard thumbnail",
    discipline: "Theater Arts",
    subline: "Theater Arts · University of Ibadan",
    voteCount: 3448,
  },
  {
    id: "onuoha-marvellous",
    rank: 5,
    name: "Onuoha Marvellous",
    image: "/Images-Carousels/IMG_4752.PNG",
    alt: "Onuoha Marvellous leaderboard thumbnail",
    discipline: "Special Education",
    subline: "Special Education · University of Ibadan",
    voteCount: 3210,
  },
] as const;

export const PILLARS: readonly Pillar[] = [
  { title: "Advocacy", description: "Raising voices for causes that matter." },
  { title: "Leadership", description: "Shaping the next generation of UI leaders." },
  { title: "Legacy", description: "Building a lasting impact beyond the crown." },
] as const;

export const EVENT_DETAILS: readonly EventDetail[] = [
  { label: "Event", value: "Mr & Miss Unibadan 2026" },
  { label: "Venue", value: "University of Ibadan" },
  { label: "Edition", value: "2026 / Crystal Excellence" },
] as const;

export function formatVotes(voteCount: number | null) {
  return voteCount === null ? "Coming soon" : `${new Intl.NumberFormat("en-US").format(voteCount)} votes`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
