import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * The branded shell every SEO page shares: skip-to-content link,
 * sticky site header, semantic <main>, and the site footer.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div id="top" className="site-shell">
      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}
