const navigation = [
  { label: "Contestants", href: "#contestants" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "About", href: "#about" },
  { label: "The Night", href: "#the-night" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand focus-ring" href="#top" aria-label="Mr and Miss Unibadan 2026 home">
          Mr &amp; Miss UI <span>/ 2026</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a className="focus-ring" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <nav className="mobile-rail" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <a className="focus-ring" href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
