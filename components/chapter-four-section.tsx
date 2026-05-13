const eventDetails = [
  { label: "Event", value: "Mr and Miss Unibadan 2026" },
  { label: "Venue", value: "University of Ibadan, Nigeria" },
  { label: "Year", value: "2026" },
  { label: "Dress Code", value: "Black Tie · Gold Accents" },
] as const;

const barcodeHeights = [30, 20, 35, 25, 30, 15, 35, 28, 22, 32] as const;

export function ChapterFourSection() {
  return (
    <section id="chapter-4">
      <div className="night-left">
        <p className="section-label reveal">Chapter Four</p>
        <h2 className="chapter-title reveal reveal-delay-1">
          The <em>Grand</em>
          <br />Night
        </h2>
        <p className="chapter-body reveal reveal-delay-2">
          One evening at the University of Ibadan where everything converges — fashion, talent, tension, and triumph. This is not a pageant. This is a cultural moment.
        </p>

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
        <div className="ticket reveal">
          <div className="ticket-header">
            <span className="ticket-title">Admission · Grand Gala Night</span>
            <div className="ticket-name">
              Uni <em>Balance</em>
              <br />2026
            </div>
          </div>
          <div className="ticket-body">
            <div className="ticket-field">
              <span className="tf-label">Institution</span>
              <span className="tf-value">Univ. of Ibadan</span>
            </div>
            <div className="ticket-field">
              <span className="tf-label">Edition</span>
              <span className="tf-value">2026</span>
            </div>
            <div className="ticket-field">
              <span className="tf-label">Dress</span>
              <span className="tf-value">Black Tie</span>
            </div>
            <div className="ticket-field">
              <span className="tf-label">Category</span>
              <span className="tf-value">General</span>
            </div>
          </div>
          <div className="ticket-footer">
            <span className="ticket-footer-text">MR AND MISS UNIBADAN</span>
            <div className="ticket-barcode" aria-hidden="true">
              {barcodeHeights.map((height, index) => (
                <div className="bar" style={{ height: `${height}px` }} key={`${height}-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}