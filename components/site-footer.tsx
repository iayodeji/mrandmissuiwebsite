import Image from "next/image";

const exploreLinks = [
  { label: "Contestants", href: "#contestants" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "About the platform", href: "#about" },
  { label: "The Grand Night", href: "#the-night" },
] as const;

const contactLinks = [
  {
    label: "TikTok / @mrandmissunibadan_",
    href: "https://www.tiktok.com/@mrandmissunibadan_?_r=1&_t=ZS-98em0vYtP9w",
  },
  {
    label: "Instagram / @mrandmissui_pageants",
    href: "https://www.instagram.com/mrandmissui_pageants?igsh=MWtlZWd2cmdtd3hnNw==",
  },
  {
    label: "Join WhatsApp group",
    href: "https://chat.whatsapp.com/BpuMFNuIVk8BBZZ6y59Y2L?s=cl&p=i&mlu=4",
  },
] as const;

const sponsors = [
  { name: "PrintWave", src: "/Sponsors/printwave.jpeg", alt: "PrintWave sponsor logo" },
  { name: "Laffy's Fruitti", src: "/Sponsors/laffy.jpeg", alt: "Laffy's Fruitti sponsor logo" },
  { name: "Soro", src: "/Sponsors/soro-logo.webp", alt: "Soro sponsor logo" },
] as const;

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand">
              Unibadan <span>/ 2026</span>
            </span>
            <p className="footer-tagline">Where the brilliant find their balance.</p>
            <p className="footer-copy">
              A ceremonial voting platform for the students carrying the identity and excellence of UI forward.
            </p>
          </div>

          <div>
            <h2 className="footer-title">Explore</h2>
            <div className="footer-links">
              {exploreLinks.map((item) => (
                <a className="focus-ring" href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="footer-title">Contact</h2>
            <div className="footer-links">
              {contactLinks.map((item) => (
                <a
                  className="focus-ring"
                  href={item.href}
                  key={item.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="footer-sponsors" aria-labelledby="footer-sponsors-title">
          <div className="footer-sponsors__head">
            <div>
              <p className="footer-kicker">06 / With thanks</p>
              <h2 className="sponsors-title" id="footer-sponsors-title">
                With thanks
                <br />
                <em>to our partners.</em>
              </h2>
            </div>
            <p className="footer-sponsors__copy">
              A quiet line of support behind the 2026 edition.
            </p>
          </div>

          <div className="sponsor-band" aria-label="2026 edition sponsors">
            {sponsors.map((sponsor) => (
              <figure className="sponsor-lockup" key={sponsor.src}>
                <div className="sponsor-logo-frame">
                  <Image
                    className="sponsor-logo"
                    src={sponsor.src}
                    alt={sponsor.alt}
                    width={360}
                    height={112}
                    sizes="(max-width: 580px) 42vw, (max-width: 920px) 28vw, 26vw"
                  />
                </div>
                <figcaption className="sponsor-name mono">{sponsor.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className="footer-bottom">
          <span>© 2026 Mr &amp; Miss Unibadan / University of Ibadan</span>
          <span>People&apos;s choice voting edition</span>
        </div>
      </div>
    </footer>
  );
}
