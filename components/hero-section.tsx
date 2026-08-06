import Image from "next/image";

const metrics = [
  { value: "21", label: "Contestants" },
  { value: "15", label: "Days left" },
  { value: "01", label: "Crown night" },
] as const;

export function HeroSection() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker">People&apos;s choice · voting edition</span>
          <h1 className="hero-title" id="hero-title">
            Mr &amp;
            <br />
            <em>Miss</em>
            <br />
            Unibadan.
          </h1>
          <p className="hero-lead">
            Where brilliance meets grace — cast your vote for the students carrying the identity of UI forward.
          </p>

          <div className="hero-meta" aria-label="Voting information">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <a className="gold-button focus-ring" href="#contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
            </a>
            <a className="ghost-button focus-ring" href="#leaderboard">
              View live votes <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <figure className="hero-art">
          <Image
            className="hero-art-image"
            src="/logo_normal.jpg"
            alt="Mr and Miss Unibadan logo"
            fill
            priority
            sizes="(max-width: 920px) 100vw, 52vw"
          />
          <figcaption className="hero-caption">
            <div>
              <p className="caption-label">A ceremony of becoming</p>
              <p className="caption-title">Vote for the story you believe in.</p>
            </div>
            <span className="vertical-note">Edition 01 / 2026</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
