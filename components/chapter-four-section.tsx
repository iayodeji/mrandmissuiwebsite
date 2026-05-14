const eventDetails = [
  { label: "Event", value: "Mr and Miss Unibadan 2026" },
  { label: "Venue", value: "University of Ibadan, Nigeria" },
  { label: "Year", value: "2026" },
] as const;

import Image from "next/image";

const highlightImages = [
  "/Images-Carousels/IMG_4757.PNG",
  "/Images-Carousels/IMG_4752.PNG",
  "/Images-Carousels/IMG_4759.PNG",
  "/Images-Carousels/IMG_4742.PNG",
  "/Images-Carousels/IMG_4740.PNG",
  "/image8.jpg",
  "/image9.jpg",
] as const;

export function ChapterFourSection() {
  return (
    <section id="chapter-4">
      <div className="night-left">
        <p className="section-label reveal">Chapter Four</p>
        <h2 className="chapter-title reveal reveal-delay-1">
          The <em>Legacy</em>
          <br />Edition
        </h2>
        <div className="chapter-body reveal reveal-delay-2">
          <p className="legacy-kicker">The Legacy Edition — 15 Years of Crystal Excellence</p>

          <p className="legacy-lead">
            The 2026 edition of Mr. &amp; Mrs. UI marks a historic milestone as the platform celebrates 15 years of excellence, influence, elegance, and unforgettable legacy within the University of Ibadan community.
          </p>

          <p className="legacy-paragraph">
            Tagged "The Legacy Edition: 15 Years of Crystal Excellence," this year&apos;s experience is designed to honor the journey, growth, and impact of a platform that has consistently showcased brilliance, confidence, leadership, and creativity over the years.
          </p>

          <p className="legacy-paragraph">
            Inspired by the beauty and strength of crystal, this edition represents clarity, prestige, resilience, and timeless value — qualities that reflect both the platform and the individuals it has produced through the years.
          </p>

          <blockquote className="legacy-quote">
            More than a celebration, The Legacy Edition is a statement of evolution. It is a tribute to past kings and queens, the memories created, the standards established, and the future being shaped for a new generation of royalty.
          </blockquote>

          <p className="legacy-closing">
            With elevated experiences, refined storytelling, and a renewed vision, Mr. &amp; Mrs. UI 2026 promises an edition that is bold, memorable, and worthy of fifteen years of crystal excellence.
          </p>
        </div>

        {eventDetails.map((detail, index) => (
          <div className={`event-detail reveal ${index < 2 ? "reveal-delay-3" : "reveal-delay-4"}`} key={detail.label}>
            <span className="detail-label">{detail.label}</span>
            <span className="detail-value">{detail.value}</span>
          </div>
        ))}

        <div className="reveal" style={{ marginTop: "3rem" }}>
          <a className="btn-gold" href="#hero">Stay Informed</a>
        </div>
      </div>

      <div className="night-right">
        <div className="gala-image-frame reveal">
          <Image
            src="/Images-Carousels/IMG_4695.PNG"
            alt="Grand Gala Night"
            width={450}
            height={680}
            className="gala-image"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      <div className="night-right">
        <div className="highlight-showcase reveal reveal-delay-3" aria-label="Premium highlights slideshow">
          <div className="highlight-showcase-header">
            <span className="highlight-kicker">Premium Highlights</span>
            <span className="highlight-subtitle">Legacy Moments</span>
          </div>

          <div className="highlight-slides" aria-hidden="true">
            {highlightImages.map((src, index) => (
              <div className="highlight-slide" key={src}>
                <Image
                  src={src}
                  alt={`Legacy highlight ${index + 1}`}
                  fill
                  sizes="(max-width: 900px) 92vw, 400px"
                  className="highlight-image"
                />
              </div>
            ))}
          </div>

          <div className="highlight-indicators" aria-hidden="true">
            {highlightImages.map((src) => (
              <span className="highlight-dot" key={`${src}-dot`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}