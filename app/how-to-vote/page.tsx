import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_EDITION,
  makeMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: `How to Vote — Mr & Miss Unibadan ${SITE_EDITION}`,
  description: `Step-by-step guide to voting for Mr and Miss Unibadan ${SITE_EDITION}. Enter your email, open your magic link, pick one Mr and one Miss candidate, and submit your ballot.`,
  path: "/how-to-vote",
});

const steps = [
  {
    title: "Enter your email address",
    copy: `Go to the ${SITE_NAME} homepage and submit the email you want your ballot sent to. A secure voting link is emailed to you within minutes — one email equals one vote.`,
  },
  {
    title: "Open your voting link",
    copy: `Click the magic link in your inbox. The link is unique to you and expires after a short window, so vote promptly. If it expires, simply request a fresh link with the same email.`,
  },
  {
    title: "Meet your candidates",
    copy: `Your private ballot lists all ten Mr Unibadan candidates and all ten Miss Unibadan candidates with their photos, faculties and mottos.`,
  },
  {
    title: "Pick one Mr and one Miss",
    copy: `Select the Mr candidate and the Miss candidate you want to crown. A single ballot must include one of each — then review your picks.`,
  },
  {
    title: "Submit your ballot",
    copy: `Confirm and submit. Your vote is recorded instantly, appears on the live leaderboard, and cannot be changed. Share the link so your friends vote too.`,
  },
];

export default function HowToVotePage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How to Vote", path: "/how-to-vote" },
        ])}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">How to Vote</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Voting guide · {SITE_EDITION}</p>
          <h1 className="seo-title">
            How to <em>vote</em>
          </h1>
          <p className="seo-lead">
            Voting for Mr &amp; Miss Unibadan {SITE_EDITION} takes about two minutes. Here is
            exactly how it works — from your inbox to the leaderboard.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Start voting now <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/faq">
              Read the FAQ <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="seo-section__head">
          <p className="eyebrow">Five steps</p>
          <h2 className="seo-section__title">
            From email to <em>ballot</em>
          </h2>
        </div>
        <div className="seo-steps seo-steps--single">
          {steps.map((step, index) => (
            <div className="seo-step" key={step.title}>
              <p className="seo-step__index">0{index + 1}</p>
              <h3 className="seo-step__title">{step.title}</h3>
              <p className="seo-step__copy">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--cream">
        <div className="seo-section__inner">
          <div className="seo-section__head">
            <p className="eyebrow dark-eyebrow">Fair play</p>
            <h2 className="seo-section__title">
              Keeping the vote <em>fair</em>
            </h2>
          </div>
          <div className="seo-body">
            <p>
              The {SITE_NAME} platform is built to keep the contest honest. Every email address
              is verified before a ballot is issued, each voting link works exactly once, and
              ballots are recorded atomically — so nobody can vote twice for the same
              candidate.
            </p>
            <p>
              Disposable email addresses are blocked, request limits apply per device, and
              voting links expire after a short window. The result: a leaderboard that reflects
              genuine support, not automation.
            </p>
            <p>
              Have a question the guide didn&apos;t answer? The{" "}
              <a href="/faq">frequently asked questions</a> cover link expiry, resending
              ballots, and what happens after you vote.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
