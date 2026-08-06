import { LEADERBOARD, formatVotes, getInitials } from "./editorial-data";

export function ChapterThreeSection() {
  return (
    <section className="section leaderboard-section" id="leaderboard" aria-labelledby="leaderboard-title">
      <div className="leaderboard-head">
        <div>
          <p className="eyebrow">03 / The pulse</p>
          <h2 className="section-title" id="leaderboard-title">
            Live
            <br />
            <em>leaderboard.</em>
          </h2>
        </div>
        <p className="leaderboard-intro">
          The numbers move as the community votes. Return often, support your candidate, and watch the race for the crown unfold in real time.
        </p>
      </div>

      <div className="leaderboard-list" role="list" aria-label="Current vote rankings">
        {LEADERBOARD.map((entry) => (
          <div className="leader-row" role="listitem" key={entry.id}>
            <span className="leader-rank">#{entry.rank}</span>
            <span
              className="leader-thumb leader-placeholder"
              aria-label={`Portrait placeholder for ${entry.name}`}
              role="img"
            >
              {getInitials(entry.name)}
            </span>
            <div>
              <div className="leader-name">{entry.name}</div>
              <div className="leader-sub">{entry.subline}</div>
            </div>
            <div className="leader-votes">
              {formatVotes(entry.voteCount).replace(" votes", "")}
              <span>votes</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
