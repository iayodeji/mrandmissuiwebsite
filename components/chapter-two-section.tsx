const timelineItems = [
  { phase: "Begin", side: "left", step: "Phase 01", title: "The Nomination", body: "Your peers see something in you. A nomination is not just an invitation — it is a declaration that you already embody balance in their eyes." },
  { phase: "Rise", side: "right", step: "Phase 02", title: "The Selection", body: "A panel of judges. A room full of questions. This is where character is tested beyond academics — where your story is heard, not just read." },
  { phase: "Ignite", side: "left", step: "Phase 03", title: "The Campaign", body: "Ten finalists. One campus. The people vote. You inspire. This week transforms candidates into figures who move the university with their vision." },
  { phase: "Crown", side: "right", step: "Phase 04", title: "The Grand Night", body: "One evening. Gold light. A crown descending. The culmination of months of effort, reduced to a single, unforgettable moment." },
] as const;

export function ChapterTwoSection() {
  return (
    <section id="chapter-2">
      <div className="chapter-2-header">
        <p className="section-label reveal" style={{ justifyContent: "center" }}>Chapter Two</p>
        <h2 className="chapter-title reveal reveal-delay-1" style={{ textAlign: "center", fontSize: "clamp(2.5rem,5vw,5rem)" }}>
          The <em>Journey</em> to the Crown
        </h2>
        <p className="chapter-body reveal reveal-delay-2" style={{ textAlign: "center", fontSize: "1.1rem" }}>
          Every great story has a path. Here is yours.
        </p>
      </div>

      <div className="timeline">
        {timelineItems.map((item) => (
          <div className="timeline-item" key={item.step}>
            <div className="timeline-left" style={{ visibility: item.side === "left" ? "visible" : "hidden" }}>
              {item.side === "left" ? (
                <div className="timeline-card">
                  <p className="tl-step">{item.step}</p>
                  <h3 className="tl-title">{item.title}</h3>
                  <p className="tl-body">{item.body}</p>
                </div>
              ) : null}
            </div>
            <div className="timeline-center">
              <div className="timeline-dot" />
              <span className="timeline-phase">{item.phase}</span>
            </div>
            <div className="timeline-right" style={{ visibility: item.side === "right" ? "visible" : "hidden" }}>
              {item.side === "right" ? (
                <div className="timeline-card">
                  <p className="tl-step">{item.step}</p>
                  <h3 className="tl-title">{item.title}</h3>
                  <p className="tl-body">{item.body}</p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}