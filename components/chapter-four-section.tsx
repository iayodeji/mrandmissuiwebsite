import { EVENT_DETAILS } from "./editorial-data";

export function ChapterFourSection() {
  return (
    <section className="section grand-night-section" id="the-night" aria-labelledby="grand-night-title">
      <div className="night-panel">
        <div className="night-details">
          <p className="eyebrow">The legacy edition</p>
          <h2 className="section-title" id="grand-night-title">
            The Grand
            <br />
            <em>Night.</em>
          </h2>
          <p className="night-copy">
            The 2026 edition marks another chapter of excellence, influence, elegance, and unforgettable legacy within the University of Ibadan community.
          </p>

          <div className="event-details">
            {EVENT_DETAILS.map((detail, index) => (
              <div className={`detail-row${index < EVENT_DETAILS.length - 1 ? " detail-row--bordered" : ""}`} key={detail.label}>
                <span className="mono detail-label">{detail.label}</span>
                <span className="display detail-value">{detail.value}</span>
              </div>
            ))}
          </div>

          <a className="gold-button focus-ring" href="#top">
            Stay informed <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
