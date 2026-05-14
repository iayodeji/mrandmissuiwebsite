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