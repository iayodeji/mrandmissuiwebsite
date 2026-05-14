export function ChapterTwoSection() {
  return (
    <section id="chapter-2">
      <div className="chapter-2-header">
        <p className="section-label reveal" style={{ justifyContent: "center" }}>Vision &amp; Mission</p>
        <h2 className="chapter-title reveal reveal-delay-1" style={{ textAlign: "center", fontSize: "clamp(2.5rem,5vw,5rem)" }}>
          Our <em>Purpose</em>
        </h2>
      </div>

      <div className="vision-mission-container">
        <input id="vm-vision" className="vm-input" type="radio" name="vm" defaultChecked />
        <input id="vm-mission" className="vm-input" type="radio" name="vm" />

        <div className="vm-tabs" role="tablist" aria-label="Vision and Mission">
          <label htmlFor="vm-vision" className="vm-tab" role="tab">Vision</label>
          <label htmlFor="vm-mission" className="vm-tab" role="tab">Mission</label>
        </div>

        <div className="vm-panels">
          <div className="vm-panel vision-section reveal reveal-delay-2" role="tabpanel" aria-labelledby="vm-vision">
            <h3 className="section-subheading">Vision</h3>
            <p className="chapter-body">
              To build a prestigious platform that empowers students to become symbols of excellence, leadership, creativity, and positive influence within the university community and beyond.
            </p>
          </div>

          <div className="vm-panel mission-section reveal reveal-delay-3" role="tabpanel" aria-labelledby="vm-mission">
            <h3 className="section-subheading">Mission</h3>
            <ul className="mission-list">
              <li className="mission-item">To promote confidence, intelligence, talent, and leadership among students.</li>
              <li className="mission-item">To provide opportunities for self-expression, personal growth, and visibility.</li>
              <li className="mission-item">To celebrate beauty, culture, creativity, and individuality in a meaningful way.</li>
              <li className="mission-item">To uphold a legacy of excellence and impactful representation within the University of Ibadan community.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}