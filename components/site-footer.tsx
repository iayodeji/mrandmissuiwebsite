export function SiteFooter() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">Unibadan</div>
          <p className="footer-tagline">&quot;Where the brilliant find their balance, and the balanced find their crown.&quot;</p>
        </div>
        <div className="sponsor-badge">
          <span className="sponsor-label">Proudly Sponsored by</span>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", color: "var(--gold)" }}> Inioluwa Ayodeji</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(250,248,245,0.3)", letterSpacing: "0.1em", marginTop: "0.25rem" }}>edbox.app</div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Mr and Miss Unibadan. University of Ibadan.</span>
        <span>Elegance. Balance. Crown.</span>
      </div>
    </footer>
  );
}