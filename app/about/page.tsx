import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_EDITION,
  SITE_TAGLINE,
  makeMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: `About — ${SITE_NAME} ${SITE_EDITION}`,
  description: `About the ${SITE_NAME} ${SITE_EDITION} platform: the people's choice voting pageant of the University of Ibadan, built on advocacy, leadership and legacy.`,
  path: "/about",
});

const pillars = [
  {
    title: "Advocacy",
    copy: "Every Mr and Miss Unibadan candidate carries a cause. The platform gives those voices a stage — and a crown with a platform behind it.",
  },
  {
    title: "Leadership",
    copy: "The pageant exists to surface the next generation of UI leaders: students who can command a hall, move a community and represent Unibadan with poise.",
  },
  {
    title: "Legacy",
    copy: "A crown is a moment; a legacy is what remains. The winners join a lineage of Mr & Miss UI alumni who keep representing the university long after the night ends.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">About</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">{SITE_TAGLINE}</p>
          <h1 className="seo-title">
            About the <em>platform</em>
          </h1>
          <p className="seo-lead">
            {SITE_NAME} {SITE_EDITION} is a ceremonial voting platform for the students
            carrying the identity and excellence of the University of Ibadan forward — built
            by the community, decided by the community.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/vote">
              Cast your vote <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">The idea</p>
            <h2 className="seo-section__title">
              A crown decided by <em>the people</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              Most pageants are decided by a panel of judges. Mr &amp; Miss Unibadan flips the
              script: the crown belongs to whoever the University of Ibadan community chooses.
              Every student, alumni and supporter with a valid email gets an equal voice, and
              every voice lands as one verified vote on the live leaderboard.
            </p>
            <p>
              The {SITE_EDITION} edition runs on three pillars — advocacy, leadership and
              legacy — and pairs the glamour of crown night with a serious mandate: the winners
              spend their reign championing causes and representing UI with excellence.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section" aria-labelledby="pillars">
        <div className="seo-section__head">
          <p className="eyebrow">What we stand for</p>
          <h2 className="seo-section__title" id="pillars">
            Three <em>pillars</em>
          </h2>
        </div>
        <div className="seo-steps">
          {pillars.map((pillar, index) => (
            <div className="seo-step" key={pillar.title}>
              <p className="seo-step__index">0{index + 1}</p>
              <h3 className="seo-step__title">{pillar.title}</h3>
              <p className="seo-step__copy">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Get involved</p>
            <h2 className="seo-section__title">
              Join the <em>community</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              The pageant runs on support from across UI and beyond — from the candidates on
              stage to the sponsors behind the scenes to every single voter. Explore the{" "}
              <a href="/contestants">full lineup</a>, follow the <a href="/leaderboard">live
              standings</a>, and make sure your voice is part of the decision.
            </p>
            <p>
              Questions about the {SITE_EDITION} edition? The <a href="/faq">FAQ</a> has
              answers, and the voting guide explains the whole process in five steps.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
