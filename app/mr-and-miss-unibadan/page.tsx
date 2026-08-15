import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { ContestantCard } from "@/components/contestant-card";
import {
  SITE_NAME,
  SITE_EDITION,
  makeMetadata,
  eventJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { CONTESTANT_PROFILES } from "@/lib/contestant-seo";

export const metadata: Metadata = makeMetadata({
  title: `Mr and Miss Unibadan ${SITE_EDITION} — Vote Now`,
  description: `Mr and Miss Unibadan ${SITE_EDITION}: the people's choice pageant of the University of Ibadan. Meet all 20 contestants, check live votes and cast your ballot for Mr & Miss Unibadan on the official platform.`,
  path: "/mr-and-miss-unibadan",
  titleAbsolute: true,
});

export default function MrAndMissUnibadanPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          eventJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Mr and Miss Unibadan", path: "/mr-and-miss-unibadan" },
          ]),
        ]}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">Mr and Miss Unibadan</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">{SITE_NAME} · {SITE_EDITION} edition</p>
          <h1 className="seo-title">
            Mr and Miss <em>Unibadan</em> {SITE_EDITION}
          </h1>
          <p className="seo-lead">
            The official voting platform for {SITE_NAME} {SITE_EDITION}. Twenty students of the
            University of Ibadan, one people&apos;s choice crown each — meet them, follow the
            votes, and decide who carries the identity of Unibadan forward.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Vote now <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/leaderboard">
              View live votes <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="seo-hero__meta">
            <div className="seo-hero__meta-item">
              <strong>{SITE_EDITION}</strong> Edition
            </div>
            <div className="seo-hero__meta-item">
              <strong>20</strong> Contestants
            </div>
            <div className="seo-hero__meta-item">
              <strong>UI</strong> University of Ibadan
            </div>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">About the contest</p>
            <h2 className="seo-section__title">
              Unibadan&apos;s <em>people&apos;s choice</em> pageant
            </h2>
          </div>
          <div className="seo-body">
            <p>
              “Unibadan” is the affectionate name students give the University of Ibadan — and
              {SITE_NAME} is its crown jewel event. Now in its {SITE_EDITION} edition, the
              pageant picks the two students who best embody the university&apos;s spirit of
              brilliance, grace and leadership: one Mr Unibadan and one Miss Unibadan.
            </p>
            <p>
              Every candidate was nominated for excellence in their faculty, from Dentistry to
              Drama, Nursing to Mathematics. What sets this pageant apart is that the final
              verdict belongs to the students. Voting is open to everyone with a valid email —
              one email, one ballot, one vote per candidate.
            </p>
            <p>
              The crown night caps months of advocacy projects and leadership showcases. But
              before the gowns and the grand hall, the numbers decide. Follow the{" "}
              <a href="/leaderboard">live leaderboard</a> to see which candidates are pulling
              ahead, and make sure your favourite isn&apos;t left behind.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="full-lineup">
        <div className="seo-section__head">
          <p className="eyebrow">Full lineup</p>
          <h2 className="seo-section__title" id="full-lineup">
            The {SITE_EDITION} <em>contestants</em>
          </h2>
          <p className="seo-section__copy">
            All twenty candidates competing for the Mr Unibadan and Miss Unibadan crowns.
            Tap any card for the full profile, quote and voting information.
          </p>
        </div>
        <div className="seo-grid">
          {CONTESTANT_PROFILES.filter((p) => !p.isAlumni).map((profile) => (
            <ContestantCard key={profile.slug} profile={profile} />
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Why vote</p>
            <h2 className="seo-section__title">
              Your ballot <em>decides the crown</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              There are no judges and no shortlists on crown night — only the total of every
              student&apos;s vote. Each ballot is secured with an emailed magic link, so the
              results are as fair as they are transparent. Support your faculty, back the story
              you believe in, and be part of the community that crowns Mr &amp; Miss Unibadan.
            </p>
            <p>
              New to the process? Read the <a href="/how-to-vote">step-by-step voting guide</a>,
              or check the <a href="/faq">frequently asked questions</a> for everything from
              link expiry to vote limits.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
