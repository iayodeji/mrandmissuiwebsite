const virtues = [
  { icon: "𝓐", name: "Academic Grace", desc: "The mind sharpened by years of discipline. Performance not as performance — but as dedication made visible." },
  { icon: "𝓛", name: "Leadership", desc: "The quiet force that moves rooms. Influence built through action, not announcement. People follow what they feel, not what they hear." },
  { icon: "𝓒", name: "Character", desc: "Who you are when no one watches. The crown sees through performance. It seeks the person beneath the presentation." },
] as const;

const marqueeItems = [
  "Academic Excellence",
  "Cultural Identity",
  "Emotional Intelligence",
  "Community Impact",
  "Personal Grace",
  "Leadership Vision",
  "Authentic Presence",
  "Resilient Spirit",
] as const;

export function ChapterThreeSection() {
  return (
    <section id="chapter-3">
      <p className="section-label reveal" style={{ position: "relative", zIndex: 2 }}>Chapter Three</p>
      <h2 className="chapter-title reveal reveal-delay-1" style={{ fontSize: "clamp(2.5rem,5vw,5rem)", position: "relative", zIndex: 2 }}>
        What the <em>Crown</em> Demands
      </h2>
      <p className="chapter-body reveal reveal-delay-2" style={{ maxWidth: "600px", textAlign: "center", position: "relative", zIndex: 2 }}>
        Not beauty alone. Not grades alone. The crown bends toward those who hold all things at once.
      </p>

      <div className="marquee-container">
        <div className="marquee-track" id="marquee">
          {marqueeItems.concat(marqueeItems).map((item, index) => (
            <span className="marquee-item" key={`${item}-${index}`}>
              {item} <span className="dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="chapter-3-grid reveal">
        {virtues.map((virtue) => (
          <div className="virtue-card" key={virtue.name}>
            <span className="virtue-icon">{virtue.icon}</span>
            <span className="virtue-name">{virtue.name}</span>
            <p className="virtue-desc">{virtue.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}