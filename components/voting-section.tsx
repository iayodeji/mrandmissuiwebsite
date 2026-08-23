import { VotingEmailForm } from "./voting-email-form";

export function VotingSection() {
  return (
    <section
      className="section voting-section"
      id="vote"
      aria-labelledby="vote-title"
    >
      <div className="voting-head">
        <div>
          <p className="eyebrow">The vote</p>
          <h2 className="section-title" id="vote-title">
            Cast your
            <br />
            <em>vote.</em>
          </h2>
        </div>
        <p className="voting-intro">
          One email, one vote. Enter your email below and we&apos;ll send you a
          secure voting link — it expires in 10 minutes, and once submitted
          your vote cannot be changed.
        </p>
      </div>

      <div className="voting-form-wrap">
        <VotingEmailForm />
      </div>
    </section>
  );
}
