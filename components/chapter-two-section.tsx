import { CONTESTANTS, formatVotes, getInitials, type Contestant } from "./editorial-data";

function ContestantCard({ contestant }: { contestant: Contestant }) {
  const isProfile = contestant.action === "profile";

  return (
    <article className="contestant-card">
      <div
        className="contestant-image-wrap contestant-placeholder"
        role="img"
        aria-label={`Portrait placeholder for ${contestant.name}`}
      >
        <span className="number-badge" aria-label={`Contestant ${contestant.number}`}>
          {contestant.number}
        </span>
        <div className="placeholder-art" aria-hidden="true">
          <span className="placeholder-orbit" />
          <span className="placeholder-monogram">{getInitials(contestant.name)}</span>
          <span className="placeholder-caption mono">Portrait study / 2026</span>
        </div>
      </div>
      <div className="contestant-info">
        <h3 className="contestant-name">{contestant.name}</h3>
        <div className="contestant-field">
          <span>{contestant.discipline}</span>
          <span>{contestant.reign}</span>
        </div>
        <p className="contestant-quote">“{contestant.quote}”</p>
        <div className="vote-row">
          <span className="vote-count">{formatVotes(contestant.voteCount)}</span>
          <a
            className="vote-button focus-ring"
            href={isProfile ? "#top" : "#vote"}
            aria-label={`${contestant.actionLabel} for ${contestant.name}`}
          >
            {contestant.actionLabel} <span aria-hidden="true">{isProfile ? "↗" : "♥"}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function ChapterTwoSection() {
  return (
    <section className="contestants-section" id="contestants" aria-labelledby="contestants-title">
      <div className="contestants-inner">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow dark-eyebrow">02 / The candidates</p>
            <h2 className="section-title" id="contestants-title">
              Meet the
              <br />
              <em>contenders.</em>
            </h2>
          </div>
          <p className="contestants-summary">
            Every portrait carries a different discipline, story, and kind of presence. Choose the candidate whose journey deserves your vote.
          </p>
        </div>

        <div className="contestant-grid">
          {CONTESTANTS.map((contestant) => (
            <ContestantCard contestant={contestant} key={contestant.id} />
          ))}
        </div>

        <div className="all-contestants">
          <a className="ghost-button wine-outline focus-ring" href="#contestants">
            View all contestants <span aria-hidden="true">⌄</span>
          </a>
        </div>
      </div>
    </section>
  );
}
