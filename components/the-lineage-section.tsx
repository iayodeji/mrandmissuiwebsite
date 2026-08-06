import { PILLARS } from "./editorial-data";

export function TheLineageSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-grid">
          <div>
            <p className="eyebrow dark-eyebrow">04 / The platform</p>
            <h2 className="section-title about-title" id="about-title">
              Beyond
              <br />
              <em>the crown.</em>
            </h2>
          </div>
          <div>
            <p className="about-copy">
              Mr &amp; Miss Unibadan is a ceremonial platform for students who carry excellence beyond the stage. It celebrates confidence, creativity, leadership, and the responsibility of representing the University of Ibadan with distinction.
            </p>
            <div className="pillars">
              {PILLARS.map((pillar) => (
                <div className="pillar" key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
