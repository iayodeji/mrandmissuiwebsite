export function ChapterOneSection() {
  return (
    <section id="chapter-1">
      <div className="chapter-left">
        <div className="big-number">I</div>
        <div className="chapter-content">
          <p className="section-label reveal">Chapter One</p>
          <h2 className="chapter-title reveal reveal-delay-1">
            The <em>Calling</em>
            <br />of Balance
          </h2>
          <p className="chapter-body reveal reveal-delay-2">
            University life is a crucible. Lectures at dawn, deadlines at midnight,
            friendships forged under pressure. Yet some students do more than survive —
            they thrive with a quiet, extraordinary grace.
          </p>
          <div className="pull-quote reveal reveal-delay-3">
            &quot;Balance is not found. It is built — one decision at a time.&quot;
          </div>
          <p className="chapter-body reveal reveal-delay-4">
            Mr and Miss Unibadan exists to find those students. To put a crown where
            it belongs — not on perfection, but on excellence lived honestly.
          </p>

          <div className="stats-grid reveal">
            <div className="stat-cell">
              <span className="stat-num">1</span>
              <span className="stat-label">University</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">2</span>
              <span className="stat-label">Crowns</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">'26</span>
              <span className="stat-label">Edition</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chapter-visual">
        <span className="float-tag">Academic</span>
        <span className="float-tag">Leadership</span>
        <span className="float-tag">Grace</span>
        <span className="float-tag">Ambition</span>
        <div className="diamond-frame" />
        <div className="diamond-frame-2" />
        <div className="diamond-center">
          <span className="diamond-glyph">B</span>
        </div>
      </div>
    </section>
  );
}