/* ============================================================
   WrenchLogic — shared components & hooks
   ============================================================ */
const { useState, useEffect, useRef, useContext, createContext, useCallback } = React;

// ---- Language context ----
const LangCtx = createContext({ lang: "he", t: window.WL.T.he });
const useLang = () => useContext(LangCtx);

// ---- Minimal sharp-line icons (no decorative SVG drawing) ----
const Icon = {
  arrow: (p) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}>
      <path d="M3 9h11M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  chev: (p) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  check: (p) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M2 7.5L6 11l6-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square"/>
    </svg>
  ),
  plus: (p) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  x: (p) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" {...p}>
      <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  bolt: (p) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M9 1L3 9h4l-1 6 7-9H9l1-5z" fill="currentColor"/>
    </svg>
  ),
  gauge: (p) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}>
      <path d="M2 13a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 13l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
};

// ---- Image placeholder (striped + mono label) ----
function Placeholder({ label, className = "", ticks = true, style }) {
  return (
    <div
      className={`ph ${ticks ? "ticks" : ""} ${className}`}
      data-label={label}
      style={style}
    ></div>
  );
}

// ---- Scroll reveal hook (sharp / fast) ----
// IntersectionObserver as enhancement + a getBoundingClientRect scroll
// fallback so content reliably appears even where IO doesn't fire (e.g.
// offscreen iframes), plus a safety timer that reveals everything.
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nodes = el.hasAttribute("data-reveal")
      ? [el]
      : Array.from(el.querySelectorAll("[data-reveal]"));
    const reveal = (n) => n.classList.add("in");
    const check = () => {
      const vh = window.innerHeight || 800;
      nodes.forEach((n) => {
        if (n.classList.contains("in")) return;
        const r = n.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) reveal(n);
      });
    };

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      nodes.forEach((n) => io.observe(n));
    }

    const onScroll = () => check();
    check();
    requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const safety = setTimeout(() => nodes.forEach(reveal), 1500);

    return () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(safety);
    };
  }, []);
  return ref;
}

// ---- Difficulty pips ----
function Difficulty({ level }) {
  return (
    <span className="diff" title={`difficulty ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= level ? "on" : ""}></i>
      ))}
    </span>
  );
}

// ---- Toast (single, controlled by parent) ----
function Toast({ msg, show }) {
  return (
    <div className={`toast ${show ? "show" : ""}`}>
      <span className="ti"><Icon.check /></span>
      {msg}
    </div>
  );
}

// number formatting
const fmt = (n) => Math.round(n).toLocaleString("en-US");

Object.assign(window, {
  useState, useEffect, useRef, useContext, createContext, useCallback,
  LangCtx, useLang, Icon, Placeholder, useReveal, Difficulty, Toast, fmt,
});
