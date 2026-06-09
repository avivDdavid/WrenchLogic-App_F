/* ============================================================
   WrenchLogic — App (state, persistence, language, composition)
   ============================================================ */

const LS = {
  get(k, fb) { try { const v = localStorage.getItem("wl_" + k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
  set(k, v) { try { localStorage.setItem("wl_" + k, JSON.stringify(v)); } catch {} },
};

function App() {
  const [lang, setLangState] = useState(() => LS.get("lang", "he"));
  const [sel, setSel] = useState(() => LS.get("sel", { manId: null, modelId: null, year: null }));
  const [garage, setGarage] = useState(() => LS.get("garage", []));
  const [target, setTarget] = useState(() => LS.get("target", 0));
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(null);

  const t = window.WL.T[lang];

  // derive engine
  const CARS = window.WL.CARS;
  const man = CARS.find((c) => c.id === sel.manId);
  const model = man?.models.find((m) => m.id === sel.modelId);
  const yearObj = model?.years.find((y) => y.y === sel.year);
  const engine = yearObj?.engines[0] || null;

  // persist
  useEffect(() => LS.set("lang", lang), [lang]);
  useEffect(() => LS.set("sel", sel), [sel]);
  useEffect(() => LS.set("garage", garage), [garage]);
  useEffect(() => LS.set("target", target), [target]);

  // apply document direction / lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  // when engine changes, keep target in a sensible range
  useEffect(() => {
    if (!engine) return;
    const base = engine.baseHp;
    const min = base, max = base + 280;
    setTarget((prev) => (prev < min || prev > max || prev === 0 ? base + 120 : prev));
  }, [engine && engine.code, engine && engine.baseHp]);

  const setLang = (l) => setLangState(l);

  const addPart = useCallback((id) => {
    setGarage((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const p = window.WL.PARTS.find((x) => x.id === id);
    const name = p ? p[lang].n : "";
    setToast({ msg: `${t.catalog.addedToast} — ${name}`, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((s) => ({ ...s, show: false })), 1900);
  }, [lang, t.catalog.addedToast]);

  const removePart = useCallback((id) => {
    setGarage((prev) => prev.filter((x) => x !== id));
  }, []);

  const garageIds = garage;

  return (
    <LangCtx.Provider value={{ lang, t }}>
      <div className="bg-carbon"></div>
      <div className="bg-grid"></div>

      <Nav lang={lang} setLang={setLang} />
      <Hero />
      <Banner />

      <div id="how"></div>

      {/* Concept 1 — Pick your car (Z-shape: text + selector) */}
      <Concept
        data={t.c1}
        num="01"
        flip={false}
        anchorId="pick"
        visual={<CarSelector sel={sel} setSel={setSel} />}
      />

      {/* Concept 2 — Catalog (header + full-width grid) */}
      <WideConcept data={t.c2} num="02" anchorId="catalog">
        <Catalog engine={engine} garageIds={garageIds} onAdd={addPart} />
      </WideConcept>

      {/* Concept 3 — Build your garage (header + garage two-col) */}
      <WideConcept data={t.c3} num="03" anchorId="garage">
        <div className="garage-grid">
          <GarageList engine={engine} garage={garage} onRemove={removePart} />
          <Garage engine={engine} garage={garage} target={target} setTarget={setTarget} onRemove={removePart} />
        </div>
      </WideConcept>

      <FooterCTA />

      <Toast msg={toast.msg} show={toast.show} />
    </LangCtx.Provider>
  );
}

// Wide concept = centered header + full width interactive content
function WideConcept({ data, num, anchorId, children }) {
  const ref = useReveal();
  return (
    <section className="concept" ref={ref} id={anchorId} style={{ paddingBlock: "clamp(70px,11vh,130px)" }}>
      <div className="wrap">
        <div style={{ maxWidth: 720, marginBottom: 44 }}>
          <div className="concept-num reveal" data-reveal>
            <span className="big">{num}</span>
            <span>{data.num}</span>
          </div>
          <h3 className="reveal d1" data-reveal>{data.h}</h3>
          <p className="lead reveal d1" data-reveal style={{ maxWidth: "60ch" }}>{data.p}</p>
        </div>
        <div className="reveal d2" data-reveal>
          {children}
        </div>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

Object.assign(window, { App, WideConcept });
