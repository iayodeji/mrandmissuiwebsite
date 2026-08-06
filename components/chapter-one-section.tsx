export function ChapterOneSection() {
  return (
    <section className="section intro-section" id="calling" aria-labelledby="calling-title">
      <div className="intro-grid">
        <div>
          <p className="eyebrow">01 / The calling</p>
          <h2 className="section-title" id="calling-title">
            A platform
            <br />
            <em>with purpose.</em>
          </h2>
        </div>

        <div className="intro-copy">
          <p className="intro-lead">
            For over 15 years, Mr. &amp; Miss UI has stood as one of the most celebrated pageantry platforms within the University of Ibadan community.
          </p>
          <p className="intro-body">
            More than a beauty pageant, it is a platform for discovering students who embody excellence, confidence, intelligence, creativity, leadership, and social influence. Your vote gives that story a visible place.
          </p>
          <div className="stat-ribbon" aria-label="Platform milestones">
            <div className="stat">
              <div className="metric-value">01</div>
              <div className="metric-label">University</div>
            </div>
            <div className="stat">
              <div className="metric-value">03</div>
              <div className="metric-label">Crowns</div>
            </div>
            <div className="stat">
              <div className="metric-value">15</div>
              <div className="metric-label">Years of legacy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
