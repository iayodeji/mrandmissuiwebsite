import { ChapterFourSection } from "@/components/chapter-four-section";
import { ChapterOneSection } from "@/components/chapter-one-section";
import { ChapterThreeSection } from "@/components/chapter-three-section";
import { ChapterTwoSection } from "@/components/chapter-two-section";
import { HeroSection } from "@/components/hero-section";
import { InteractiveEffects } from "@/components/interactive-effects";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TheLineageSection } from "@/components/the-lineage-section";

export default function Home() {
  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursor-ring" />
      <InteractiveEffects />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ChapterOneSection />
        <ChapterTwoSection />
        <ChapterThreeSection />
        <TheLineageSection />
        <ChapterFourSection />
      </main>
      <SiteFooter />
    </>
  );
}
