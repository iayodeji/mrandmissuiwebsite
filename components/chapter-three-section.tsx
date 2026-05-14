import Image from "next/image";

const hallOfFame = [
  { src: "/image1.png" },
  { src: "/image2.png" },
  { src: "/image3.png" },
  { src: "/image4.png" },
  { src: "/image5.png" },
  { src: "/image6.png" },
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

      <div className="hall-of-fame-container">
        <div className="hall-of-fame-header">
          <h2 className="chapter-title reveal" style={{ textAlign: "center", fontSize: "clamp(2.5rem,5vw,5rem)", marginBottom: "0.5rem" }}>
            Hall of Fame
          </h2>
          <p className="section-label reveal" style={{ justifyContent: "center", fontSize: "0.95rem", fontStyle: "italic" }}>Legacy of Excellence</p>
        </div>

        <div className="hall-of-fame-content reveal reveal-delay-1">
          <div className="hof-intro">
            <p className="chapter-body">
              The Hall of Fame is a dedicated space within Mr. &amp; Mrs. UI that celebrates individuals who have gone beyond the crown to define what true excellence in pageantry represents within and beyond the University of Ibadan community.
            </p>
          </div>

          <div className="hof-section">
            <p className="chapter-body">
              This section honors past kings, queens, and outstanding figures who have not only excelled during their reign but have also carried the UI identity onto larger stages — representing the institution at external pageants, cultural platforms, leadership spaces, and creative industries with distinction.
            </p>
          </div>

          <div className="hof-section">
            <p className="chapter-body">
              The Hall of Fame is reserved for individuals whose impact extends beyond competition — those who have shown consistency, influence, growth, and excellence in the pageantry space. It reflects a legacy of individuals who turned their titles into platforms of representation, advocacy, and achievement.
            </p>
          </div>

          <div className="hof-section">
            <p className="chapter-body">
              More than recognition, this space serves as a reminder of what is possible. It highlights the journey of those who have worn the crown and continued to shine, reinforcing the standard of excellence that Mr. &amp; Mrs. UI stands for.
            </p>
          </div>

          <div className="hof-closing">
            <p className="chapter-body" style={{ fontStyle: "italic", fontWeight: "500" }}>
              It is not just a record of winners — it is a celebration of legacy, influence, and the enduring mark of UI royalty.
            </p>
          </div>
        </div>
      </div>

      <div className="hall-of-fame reveal">
        {hallOfFame.map((portrait, index) => (
          <div className="portrait-frame" key={`portrait-${index}`}>
            <div className="portrait-wrapper">
              <Image
                src={portrait.src}
                alt={`Hall of Fame Portrait ${index + 1}`}
                fill
                sizes="(max-width: 600px) 80vw, (max-width: 900px) 45vw, 280px"
                className="portrait-image"
                priority={index < 2}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}