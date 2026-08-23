import Image from "next/image";

const metrics = [
  { value: "20", label: "Contestants" },
  { value: "19", label: "September" },
] as const;

export function HeroSection() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title" id="hero-title">
            Mr &amp;
            <br />
            <em>Miss</em>
            <br />
            Unibadan.
          </h1>
          <p className="hero-lead">
            The votes are in. The truth has been revealed. The leaderboard stands as a testament to who UI truly believes in.
          </p>

          <div className="hero-announcement" style={{
            border: '1px solid rgba(197, 161, 91, 0.62)',
            padding: '28px 32px',
            marginTop: '34px',
            marginBottom: '8px',
          }}>
            <span className="eyebrow" style={{ marginBottom: '12px' }}>
              Voting has closed
            </span>
            <p style={{
              marginTop: '14px',
              color: 'var(--cream)',
              font: '500 20px / 1.4 var(--font-display)',
            }}>
              These are your <strong style={{ color: 'var(--gold-light)' }}> contestants</strong> — the ones UI has chosen to carry the crown. Watch them shine at the <strong style={{ color: 'var(--gold-light)' }}>Grand Finale on the 19th of September</strong>.
            </p>
          </div>

          <div className="hero-meta" aria-label="Event information">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <a className="gold-button focus-ring" href="#leaderboard">
              See the final standings <span aria-hidden="true">↗</span>
            </a>
            <a className="ghost-button focus-ring" href="#contestants">
              Meet the contestants <span aria-hidden="true">↘</span>
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
              <p className="caption-title">The truth has been revealed.</p>
            </div>
            <span className="vertical-note">Edition 01 / 2026</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
