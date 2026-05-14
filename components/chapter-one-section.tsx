export function ChapterOneSection() {
  return (
    <section id="chapter-1">
      <div className="chapter-left">
        <div className="big-number">I</div>
        <div className="chapter-content">
          <p className="section-label reveal">Introduction</p>
          <h2 className="chapter-title reveal reveal-delay-1">Introduction</h2>

          <p className="chapter-body reveal reveal-delay-2">
            For over 15 years, Mr. &amp; Mrs. UI has stood as one of the most prestigious and culturally celebrated pageantry platforms within the University of Ibadan community. More than a beauty pageant, it is a platform dedicated to discovering and showcasing students who embody excellence, confidence, intelligence, creativity, leadership, and social influence.
          </p>

          <p className="chapter-body reveal reveal-delay-3">
            Over the years, the platform has produced remarkable kings and queens who have gone on to inspire their communities, represent the university proudly, and leave lasting impacts both within and beyond campus.
          </p>

          <p className="chapter-body reveal reveal-delay-4">
            Mr. &amp; Mrs. UI continues to evolve as a symbol of class, purpose, talent, and youthful expression — creating unforgettable experiences while celebrating the identity, diversity, and brilliance of UI students.
          </p>

          <div className="stats-grid reveal">
            <div className="stat-cell">
              <span className="stat-num">1</span>
              <span className="stat-label">University</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">3</span>
              <span className="stat-label">Crowns</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">15</span>
              <span className="stat-label">Year Anniversary</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chapter-visual">
        <div
          className="chapter-visual-image"
          role="img"
          aria-label="Chapter visual"
          style={{ backgroundImage: `url('/Images-Carousels/IMG_4740.PNG')` }}
        />
      </div>
    </section>
  );
}