import { ChapterFourSection } from "@/components/chapter-four-section";
import { ChapterOneSection } from "@/components/chapter-one-section";
import { ChapterThreeSection } from "@/components/chapter-three-section";
import { ChapterTwoSection } from "@/components/chapter-two-section";
import { HeroSection } from "@/components/hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TheLineageSection } from "@/components/the-lineage-section";
import { JsonLd } from "@/components/json-ld";
import { eventJsonLd } from "@/lib/seo";

export default function Home() {
  return (
    <div id="top" className="site-shell">
      <JsonLd data={eventJsonLd()} />
      <SiteHeader />
      <main>
        <HeroSection />
        <ChapterOneSection />
        <ChapterTwoSection />
        <ChapterThreeSection />
        <TheLineageSection />
        <ChapterFourSection />
      </main>
      <SiteFooter />
    </div>
  );
}
