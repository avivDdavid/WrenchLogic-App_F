/* ============================================================
   WrenchLogic — layout sections (nav, hero, banner, concept, footer)
   ============================================================ */

// ---------------- NAV ----------------
function Nav({ lang, setLang }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a className="logo" href="#top">
        <img src="../images/Logo.png" alt="WrenchLogic" style={{ height: "40px", width: "auto", filter: "brightness(0) invert(1)" }} />
      </a>
      <div className="nav-right">
        <div className="nav-links">
          <a href="#how">{t.nav.how}</a>
          <a href="/catalog">{t.nav.catalog}</a>
          <a href="/garage">{t.nav.garage}</a>
        </div>
        <div className="lang" role="group" aria-label="language">
          <button className={lang === "he" ? "on" : ""} onClick={() => setLang("he")}>HE</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="btn btn-primary nav-cta" onClick={() => goLogin()}>{t.nav.login}</button>
      </div>
    </nav>
  );
}

function goLogin() {
  window.location.href = '/catalog';
}

// ---------------- HERO ----------------
function Hero() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-bg">
        <div className="hero-photo">
          <img src="../images/GTR.png" alt="WrenchLogic hero car" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        </div>
      </div>
      <div className="wrap">
        <div className="hero-inner">
          <span className="eyebrow" data-reveal>
            {t.hero.sub_a} <b style={{ color: "var(--text)" }}>{t.hero.sub_b}</b>
          </span>
          <h1 data-reveal className="reveal d1">
            {t.hero.h1a} <span className="hl">{t.hero.h1b}</span>
            <br />
            {t.hero.h1c}
          </h1>
          <p className="sub reveal d2" data-reveal>
            {t.hero.sub_a} <b>{t.hero.sub_b}</b>
          </p>
          <div className="hero-actions reveal d3" data-reveal>
            <button className="btn btn-primary" onClick={() => scrollToId("how")}>
              {t.hero.cta} <span className="arrow"><Icon.arrow /></span>
            </button>
            <button className="btn btn-ghost" onClick={() => scrollToId("catalog")}>
              {t.hero.cta2}
            </button>
          </div>
        </div>
      </div>

      <div className="hero-stats">
        {t.hero.stats.map(([n, l], i) => (
          <div className="st" key={i}>
            <b>{n}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <div className="scroll-hint">
        <span>{t.hero.scroll}</span>
        <span className="bar"></span>
      </div>
    </header>
  );
}

// reveal hero items immediately (above the fold) after mount
function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView?.({ behavior: "smooth" });
}

// ---------------- BANNER (section 2) ----------------
function Banner() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section className="banner" ref={ref}>
      <div className="stripes"></div>
      <div className="wrap">
        <div className="b-eyebrow reveal" data-reveal>
          <span className="eyebrow">{t.banner.eyebrow}</span>
        </div>
        <h2 className="reveal d1" data-reveal>
          {t.banner.a} <span className="hl">{t.banner.hl}</span>
        </h2>
      </div>
    </section>
  );
}

// ---------------- CONCEPT SECTION (Z-shape layout) ----------------
function Concept({ data, num, flip, visual, anchorId }) {
  const ref = useReveal();
  return (
    <section className={`concept ${flip ? "flip" : ""}`} ref={ref} id={anchorId}>
      <div className="wrap concept-grid">
        <div className="concept-text">
          <div className="concept-num reveal" data-reveal>
            <span className="big">{num}</span>
            <span>{data.num}</span>
          </div>
          <h3 className="reveal d1" data-reveal>{data.h}</h3>
          <p className="lead reveal d1" data-reveal>{data.p}</p>
          <ul className="mini-feats">
            {data.feats.map((f, i) => (
              <li key={i} className={`reveal d${Math.min(i + 1, 3)}`} data-reveal>
                <span className="mk"><Icon.bolt /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="concept-visual reveal clip d1" data-reveal>
          {visual}
        </div>
      </div>
    </section>
  );
}

// ---------------- FOOTER CTA + SITE FOOT ----------------
function FooterCTA() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <>
      <section className="footer-cta" id="footer-cta" ref={ref}>
        <div className="bg-grid" style={{ position: "absolute" }}></div>
        <div className="wrap" style={{ position: "relative" }}>
          <div className="fc-eyebrow reveal" data-reveal>
            <span className="eyebrow">{t.footer.eyebrow}</span>
          </div>
          <h2 className="reveal d1" data-reveal>{t.footer.h}</h2>
          <div className="reveal d2" data-reveal>
            <button className="btn btn-primary" style={{ fontSize: 19, padding: "22px 56px" }} onClick={() => window.location.href = '/catalog'}>
              {t.footer.cta} <span className="arrow"><Icon.arrow /></span>
            </button>
          </div>
        </div>
      </section>
      <footer className="site-foot">
        <div className="wrap">
          <span className="sig">{t.footer.sig}</span>
          <div className="foot-links">
            {t.footer.links.map((l, i) => (
              <a href="#" key={i} onClick={(e) => e.preventDefault()}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

Object.assign(window, { Nav, Hero, Banner, Concept, FooterCTA, scrollToId });
