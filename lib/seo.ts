import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/* Site-wide identity                                                  */
/* ------------------------------------------------------------------ */

export const SITE_NAME = "Mr & Miss Unibadan";
export const SITE_NAME_SHORT = "Mr & Miss UI";
export const SITE_EDITION = "2026";
export const SITE_TAGLINE = "Where brilliance meets grace.";

export const SITE_DESCRIPTION =
  "Vote for the Mr & Miss Unibadan 2026 contestants — the students carrying the identity of the University of Ibadan forward. Meet all 20 contestants, follow the live leaderboard, and cast your vote on the official Mr & Miss UI platform.";

export const SITE_KEYWORDS = [
  "Mr and Miss Unibadan",
  "Mr and Miss UI",
  "Mr & Miss Unibadan",
  "Mr & Miss UI",
  "Mr Unibadan",
  "Miss Unibadan",
  "Mr UI",
  "Miss UI",
  "University of Ibadan pageant",
  "UI pageant",
  "Mr and Miss Unibadan 2026",
  "Mr and Miss UI voting",
  "Unibadan beauty pageant",
  "University of Ibadan",
  "UI",
  "Unibadan",
  "vote Mr and Miss UI",
  "Mr and Miss UI contestants",
].join(", ");

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/mrandmissui_pageants?igsh=MWtlZWd2cmdtd3hnNw==",
  tiktok: "https://www.tiktok.com/@mrandmissunibadan_?_r=1&_t=ZS-98em0vYtP9w",
  whatsapp: "https://chat.whatsapp.com/BpuMFNuIVk8BBZZ6y59Y2L?s=cl&p=i&mlu=4",
} as const;

export const PRODUCTION_SITE_URL = "https://www.mrandmissunibadan.click";

/**
 * Base URL used for canonical/OG/sitemap URLs.
 * Reads NEXT_PUBLIC_SITE_URL, but falls back to the production domain whenever
 * the env var is unset or still a localhost/example placeholder.
 */
export function siteUrl(path = ""): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const isPlaceholder =
    !configured ||
    configured.includes("localhost") ||
    configured.includes("example.com") ||
    configured.includes("127.0.0.1");
  const base = (isPlaceholder ? PRODUCTION_SITE_URL : configured).replace(/\/+$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for a public asset (og image, logos, photos). */
export function siteImage(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl(path.startsWith("/") ? path : `/${path}`);
}

export const DEFAULT_OG_IMAGE = "/logo_normal.jpg";

/* ------------------------------------------------------------------ */
/* Metadata factory                                                    */
/* ------------------------------------------------------------------ */

interface PageMetaOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** Use as the exact <title> instead of the layout's "%s | Site Name" template. */
  titleAbsolute?: boolean;
}

/**
 * Build a complete Metadata object with canonical, OpenGraph, Twitter,
 * robots and keyword tags — the baseline for every page on the site.
 */
export function makeMetadata({
  title,
  description,
  path = "/",
  keywords,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  titleAbsolute = false,
}: PageMetaOptions): Metadata {
  const url = siteUrl(path);
  const ogImage = siteImage(image);

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    metadataBase: new URL(siteUrl()),
    alternates: { canonical: url },
    robots: {
      index: !noindex,
      follow: true,
      googleBot: {
        index: !noindex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: "en_NG",
      images: [{ url: ogImage, width: 1200, height: 1200, alt: `${SITE_NAME} ${SITE_EDITION}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD structured data                                             */
/* ------------------------------------------------------------------ */

export type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: SITE_NAME_SHORT,
    url: siteUrl(),
    logo: siteImage("/logo_raster.png"),
    image: siteImage(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok],
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_SHORT,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": siteUrl("/#organization") },
  };
}

export function eventJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Mr & Miss Unibadan 2026",
    alternateName: "Mr & Miss UI 2026",
    description:
      "The 2026 people's choice voting edition of the Mr & Miss Unibadan pageant at the University of Ibadan. Meet the contestants, follow the leaderboard and cast your vote.",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "University of Ibadan",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ibadan",
        addressRegion: "Oyo",
        addressCountry: "NG",
      },
    },
    image: siteImage(DEFAULT_OG_IMAGE),
    url: siteUrl("/"),
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}

export function personJsonLd(input: {
  name: string;
  url: string;
  image?: string | null;
  jobTitle?: string;
  alumniOf?: string;
  description?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    url: input.url,
    image: input.image ? siteImage(input.image) : undefined,
    jobTitle: input.jobTitle,
    alumniOf: input.alumniOf,
    description: input.description,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
