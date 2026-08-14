// Static catalog of the 2026 contestants, mirrored from the DB (contestants-info.txt).
// Lives entirely on the client so images load straight from storage and the browser
// never asks the server for candidate data — the only DB call is the vote itself.
import { getContestantPhoto } from "./contestant-photos";

export type CandidateCategory = "mr" | "miss";

export interface CatalogCandidate {
  id: string;
  name: string;
  category: CandidateCategory;
  contestant_number: number;
  faculty: string | null;
  quote: string | null;
  photo_url: string | null;
}

const RAW: readonly [
  name: string,
  category: CandidateCategory,
  contestant_number: number,
  faculty: string | null,
  quote: string | null,
][] = [
  // Mr Unibadan (1–10)
  ["Adedokun Adefolahan Haleem", "mr", 1, "Dentistry", "VENI, VIDI, VICI. I came, I saw, I conquered."],
  ["Yusuff Tolulope Fausol", "mr", 2, "Education", "Win!"],
  ["Idon Joshua Oyakhiome", "mr", 3, "Computing", "Fuck beliefs and avoid being a zombie sheep"],
  ["Adeyemi Donald Obaloluwa", "mr", 4, "Arts", "Believe you can and you’re half way there"],
  ["Durojaiye Erioluwa Okikioluwa", "mr", 5, "Arts", "A moving man will one day meet his luck"],
  ["ADEFEMI Oluwadamilola Adewunmi", "mr", 6, "The Social Sciences", "Winners never quit, Quitters never win."],
  ["Otegbayo Inioluwa", "mr", 7, "Basic Medical Sciences", "I think, therefore I am."],
  ["Obidare Taofeek Omobolaji", "mr", 8, "Arts", "Live, and let live."],
  ["Adewoye David Adedamola", "mr", 9, "Science", "in-between the idea and the noise, find your frequency"],
  ["Olawuyi Babayanmife Folorunso", "mr", 10, "Arts", "I am not trying to fit into the story, I am trying to make the story worth remembering"],
  // Miss Unibadan (1–10)
  ["Ikwuje ojonoka Sharon", "miss", 1, "Agriculture", "“Que sera,sera” what ever will be, will be."],
  ["Tumo Gift Joanna", "miss", 2, "Arts", "“She believed she could, so she did”"],
  ["Agbonoga Sofia Omoyeme", "miss", 3, "Basic Medical Sciences", "“Nothing can dim the light that shines from within.”"],
  ["Onamusi Ayomide Grace", "miss", 4, "Arts", "‘I walk like I belong , because I know I do ‘"],
  ["Adelakun Eniolatosi Adetola", "miss", 5, "Education", "becoming the best version of myself, one step at a time."],
  ["Imoh Favour Abasifreke", "miss", 6, "Science", "“Your presence is your power; never shrink yourself to fit where you were meant to stand out.”"],
  ["Bodede Mabel Mopelola", "miss", 7, "Arts", "Those who dare to begin, dare to become."],
  ["Adigun Precious Oluwakemisola", "miss", 8, "Nursing", "I am who I am"],
  ["God’s-Treasure Oluwafemi", "miss", 9, "Education", "In all your ways acknowledge him, and he will make your paths straight."],
  ["Semilore", "miss", 10, "Arts", null],
];

// DB ids (from the candidates table), ordered by category + contestant_number
const IDS: Record<CandidateCategory, readonly string[]> = {
  mr: [
    "64d93752-5a9b-41f8-bc05-d756a6148405",
    "65ae51ae-0154-49aa-ad8d-c6916f9db673",
    "ca65e13e-998d-4024-9e77-da08d0e56dc1",
    "0ab637cb-0dbf-4617-8bc9-dd26a7a8719f",
    "411c9cd0-2708-4eae-8ac2-601f56d197a3",
    "9a75d16b-4048-4523-a9c9-cb8014274e25",
    "08509d0d-0c23-45a4-b8e4-8743cde0ec51",
    "a15be3d7-fabc-4e27-8eda-b1542fed346b",
    "711af575-2960-4090-a672-c5728a876c20",
    "b99b2661-968c-45d0-813e-ebeadd0b5139",
  ],
  miss: [
    "d4132260-c342-48e3-b74a-3707db6d79d2",
    "26915ed2-e2bf-4d3c-89e8-e73381dc2820",
    "ca91fa71-4ff8-405f-9868-86122a8e6aae",
    "caf3c16d-6f68-45a5-8e92-33289e7d72cd",
    "b772ec0c-dc15-4b7b-848c-868921fea6a1",
    "1eef1077-12af-47a1-8fc0-cc5ad81f1bb0",
    "91f72785-27f2-4e73-8e5d-6b2ba0ba6862",
    "af16d783-9e06-4959-bb4d-5b288aac4b31",
    "27454768-45a1-449b-ab84-767c62190986",
    "f61664e9-e9f9-4123-9658-e8d37589b5af",
  ],
};

function buildCatalog(): CatalogCandidate[] {
  return RAW.map(([name, category, contestant_number, faculty, quote], index) => {
    const id = IDS[category][contestant_number - 1];
    return {
      id,
      name,
      category,
      contestant_number,
      faculty,
      quote,
      photo_url: getContestantPhoto(category, contestant_number),
    };
  });
}

export const CONTESTANT_CATALOG: readonly CatalogCandidate[] = buildCatalog();

export const MR_CANDIDATES: readonly CatalogCandidate[] = CONTESTANT_CATALOG.filter(
  (c) => c.category === "mr"
);

export const MISS_CANDIDATES: readonly CatalogCandidate[] = CONTESTANT_CATALOG.filter(
  (c) => c.category === "miss"
);

export const CATEGORY_LABEL: Record<CandidateCategory, string> = {
  mr: "Mr Unibadan",
  miss: "Miss Unibadan",
};
