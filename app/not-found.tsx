import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Page not found",
  description: "The page you are looking for could not be found on the Mr & Miss Unibadan 2026 platform.",
  path: "/",
  noindex: true,
});

export default function NotFound() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "404", path: "/" }])}
      />
      <section className="seo-hero">
        <div className="seo-hero__inner seo-hero--center">
          <p className="seo-kicker">404 / Not found</p>
          <h1 className="seo-title">
            This page is <em>off-stage.</em>
          </h1>
          <p className="seo-lead">
            The page you are looking for doesn&apos;t exist or has moved. Head back home to meet
            the Mr &amp; Miss Unibadan contestants and cast your vote.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/">
              Back to home <span aria-hidden="true">↗</span>
            </a>
            <a className="ghost-button focus-ring" href="/contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
