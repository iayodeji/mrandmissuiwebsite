import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_EDITION,
  makeMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: `FAQ — Mr & Miss Unibadan ${SITE_EDITION}`,
  description: `Answers to common questions about Mr and Miss Unibadan ${SITE_EDITION}: how voting works, link expiry, one-email-one-vote rules, leaderboard updates and more.`,
  path: "/faq",
});

const faqs = [
  {
    question: "What is Mr and Miss Unibadan?",
    answer: `Mr and Miss Unibadan — also known as Mr and Miss UI — is the people's choice pageant of the University of Ibadan. In the ${SITE_EDITION} edition, twenty students compete: ten for Mr Unibadan and ten for Miss Unibadan, with the winners decided entirely by student votes.`,
  },
  {
    question: "How do I vote for Mr and Miss UI?",
    answer:
      "Enter your email address on the Mr & Miss Unibadan homepage, open the voting link you receive by email, select one Mr candidate and one Miss candidate, and submit your ballot. The full walkthrough is on the How to Vote page.",
  },
  {
    question: "Can I vote more than once?",
    answer:
      "No. One email address is entitled to one ballot. Each voting link works exactly once and is tied to a verified email, so duplicate votes are rejected by the system.",
  },
  {
    question: "I didn't receive my voting link. What should I do?",
    answer:
      "Check your spam or promotions folder first. If the link still hasn't arrived, request a new link with the same email on the homepage — if your previous link hasn't expired it is simply resent to you.",
  },
  {
    question: "My voting link expired. Can I still vote?",
    answer:
      "Yes. Voting links expire after a short window to keep ballots secure. Request a fresh link with the same email address and you'll receive a new one to complete your vote.",
  },
  {
    question: "Do I need to vote for both Mr and Miss?",
    answer:
      "Yes. Each ballot must include one Mr Unibadan candidate and one Miss Unibadan candidate before it can be submitted.",
  },
  {
    question: "When do the voting results update?",
    answer:
      "The live leaderboard updates as votes are confirmed. Head to the Leaderboard page to see how every Mr and Miss Unibadan candidate is ranked by votes.",
  },
  {
    question: "Can I change my vote after submitting?",
    answer:
      "No. Once a ballot is submitted it is recorded immediately and cannot be changed or withdrawn. Review your picks carefully before confirming.",
  },
  {
    question: "Who can vote?",
    answer:
      "Anyone with a valid, non-disposable email address can vote — students, alumni and supporters of the University of Ibadan alike. The people's choice crown belongs to the whole UI community.",
  },
  {
    question: "Is my vote anonymous?",
    answer:
      "Your vote is recorded anonymously. The platform stores a verified voter record to enforce one-vote-per-email, but no ballot is linked to your email address.",
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li aria-current="page">FAQ</li>
        </ol>
      </nav>

      <section className="seo-hero">
        <div className="seo-hero__inner">
          <p className="seo-kicker">Help centre</p>
          <h1 className="seo-title">
            Frequently asked <em>questions</em>
          </h1>
          <p className="seo-lead">
            Everything you need to know about voting for Mr &amp; Miss Unibadan {SITE_EDITION}
            — ballots, links, rules and the leaderboard.
          </p>
          <div className="seo-hero__actions">
            <a className="gold-button focus-ring" href="/vote">
              Vote now <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="/how-to-vote">
              Step-by-step guide <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="seo-section__head">
          <p className="eyebrow">Q &amp; A</p>
          <h2 className="seo-section__title">
            Voting, explained <em>simply</em>
          </h2>
        </div>
        <div className="seo-faq">
          {faqs.map((faq) => (
            <details key={faq.question} open={faqs.indexOf(faq) < 4}>
              <summary>{faq.question}</summary>
              <div className="seo-faq__answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
