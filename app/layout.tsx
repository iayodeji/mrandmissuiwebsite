import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Inter } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_EDITION,
  SITE_TAGLINE,
  siteUrl,
  siteImage,
  DEFAULT_OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";
import "./uni-balance.css";
import "./seo.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} ${SITE_EDITION} — Vote Now | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME} ${SITE_EDITION}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "pageant",
  alternates: {
    canonical: siteUrl("/"),
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico", sizes: "any" },
      { url: "/favicon_io/favicon-16x16.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon_io/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} ${SITE_EDITION} — Vote Now`,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
    images: [
      {
        url: siteImage(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 1200,
        alt: `${SITE_NAME} ${SITE_EDITION} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} ${SITE_EDITION} — Vote Now`,
    description: SITE_DESCRIPTION,
    images: [siteImage(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME_SHORT,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
