import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { CONTESTANT_PROFILES, contestantProfileUrl } from "@/lib/contestant-seo";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/mr-and-miss-ui", priority: 0.9, changeFrequency: "weekly" },
  { path: "/mr-and-miss-unibadan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/ui-pageant", priority: 0.9, changeFrequency: "weekly" },
  { path: "/contestants", priority: 0.9, changeFrequency: "daily" },
  { path: "/vote", priority: 0.9, changeFrequency: "daily" },
  { path: "/leaderboard", priority: 0.8, changeFrequency: "daily" },
  { path: "/how-to-vote", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/mr-unibadan-contestants", priority: 0.8, changeFrequency: "weekly" },
  { path: "/miss-unibadan-contestants", priority: 0.8, changeFrequency: "weekly" },
  { path: "/past-winners", priority: 0.7, changeFrequency: "monthly" },
];

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: siteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const contestantUrls: MetadataRoute.Sitemap = CONTESTANT_PROFILES.map((profile) => ({
    url: siteUrl(contestantProfileUrl(profile.slug)),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...contestantUrls];
}
