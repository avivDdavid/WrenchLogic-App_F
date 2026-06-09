/* ============================================================
   WrenchLogic — interactive modules
   CarSelector · Catalog · Garage (tri-segment dyno)
   ============================================================ */

// ---------------- CAR SELECTOR ----------------
function CarSelector({ sel, setSel }) {
  const { t, lang } = useLang();
  const s = t.selector;
  const CARS = window.WL.CARS;

  const man = CARS.find((c) => c.id === sel.manId);
  const model = man?.models.find((m) => m.id === sel.modelId);
  const yearObj = model?.years.find((y) => y.y === sel.year);
  const engine = yearObj?.engines[0] || null;

  const Chev = () => <span className="chev"><Icon.chev /></span>;

  return (
    <div className="panel notch-tr">
      <div className="panel-head">
        <span className="ttl">// {s.head}</span>
        <div className="panel-dots">
          <i className={sel.manId ? "live" : ""}></i>
          <i className={sel.modelId ? "live" : ""}></i>
          <i className={sel.year ? "live" : ""}></i>
          <i className={engine ? "live" : ""}></i>
        </div>
      </div>
      <div className="selector">
        {/* Make */}
        <div className={`field ${sel.manId ? "done" : ""}`}>
          <label><span className="step">{sel.manId ? <Icon.check /> : "1"}</span>{s.manufacturer}</label>
          <div className={`select ${sel.manId ? "filled" : ""}`}>
            <select
              value={sel.manId || ""}
              onChange={(e) => setSel({ manId: e.target.value || null, modelId: null, year: null })}
            >
              <option value="">{s.ph_man}</option>
              {CARS.map((c) => (
                <option key={c.id} value={c.id}>{c[lang]}</option>
              ))}
            </select>
            <Chev />
          </div>
        </div>

        {/* Model */}
        <div className={`field ${sel.modelId ? "done" : ""}`}>
          <label><span className="step">{sel.modelId ? <Icon.check /> : "2"}</span>{s.model}</label>
          <div className={`select ${sel.modelId ? "filled" : ""}`}>
            <select
              value={sel.modelId || ""}
              disabled={!man}
              onChange={(e) => setSel({ ...sel, modelId: e.target.value || null, year: null })}
            >
              <option value="">{s.ph_model}</option>
              {man?.models.map((m) => (
                <option key={m.id} value={m.id}>{m[lang]}</option>
              ))}
            </select>
            <Chev />
          </div>
        </div>

        {/* Year */}
        <div className={`field ${sel.year ? "done" : ""}`}>
          <label><span className="step">{sel.year ? <Icon.check /> : "3"}</span>{s.year}</label>
          <div className={`select ${sel.year ? "filled" : ""}`}>
            <select
              value={sel.year || ""}
              disabled={!model}
              onChange={(e) => setSel({ ...sel, year: e.target.value ? +e.target.value : null })}
            >
              <option value="">{s.ph_year}</option>
              {model?.years.map((y) => (
                <option key={y.y} value={y.y}>{y.y}</option>
              ))}
            </select>
            <Chev />
          </div>
        </div>

        {/* Engine readout */}
        <div className={`engine-readout ${engine ? "" : "empty"}`}>
          <div>
            <div className="lab">{s.readoutLab}</div>
            <div className="code">{engine ? engine.code : s.emptyCode}</div>
          </div>
          <div className="bhp">
            <b>{engine ? engine.baseHp : "—"}</b>
            <span>{s.bhp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- CATALOG ----------------
function Catalog({ engine, garageIds, onAdd }) {
  const { t, lang } = useLang();
  const c = t.catalog;
  const PARTS = window.WL.PARTS;
  const CATS = window.WL.CATS;
  const [filter, setFilter] = useState("all");

  const list = PARTS.filter((p) => filter === "all" || p.cat === filter);

  return (
    <div>
      <div className="catalog-bar">
        <div className="filters">
          {CATS.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${filter === cat.id ? "on" : ""}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat[lang]}
            </button>
          ))}
        </div>
        <span className="catalog-note">
          {c.note_pre}<b>{engine ? engine.code : c.note_car}</b>
        </span>
      </div>

      <div className="cat-grid">
        {list.map((p) => {
          const added = garageIds.includes(p.id);
          return (
            <article className="part" key={p.id}>
              <div className="part-img" style={{ backgroundImage: "url('../images/part.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
                <span className={`tag cat-label`}>{CATS.find((x) => x.id === p.cat)?.[lang]}</span>
              </div>
              <div className="part-body">
                <h4>{p[lang].n}</h4>
                <p className="desc">{p[lang].d}</p>
                <div className="specs">
                  {p.hp > 0 && <span className="tag tag-hp"><Icon.bolt /> +{p.hp} HP</span>}
                  {p.tq > 0 && <span className="tag">+{p.tq} Nm</span>}
                  <span className={`tag ${p.legal ? "tag-legal" : "tag-illegal"}`}>
                    <span className="tag-dot"></span>{p.legal ? c.legal : c.illegal}
                  </span>
                </div>
              </div>
              <div className="part-foot">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="price">₪{fmt(p.price)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }} title={c.diffLab}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>{c.diffLab}</span>
                    <Difficulty level={p.diff} />
                  </span>
                </div>
                <button
                  className={`add-btn ${added ? "added" : ""}`}
                  onClick={() => onAdd(p.id)}
                  disabled={added}
                >
                  {added ? <><Icon.check /> {c.added}</> : <><Icon.plus /> {c.add}</>}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- GARAGE (visual mockup for concept 3 is the dyno) ----------------
function Garage({ engine, garage, target, setTarget, onRemove }) {
  const { t, lang } = useLang();
  const g = t.garage;
  const PARTS = window.WL.PARTS;
  const items = garage.map((id) => PARTS.find((p) => p.id === id)).filter(Boolean);
  const locked = !engine;

  const baseHp = engine ? engine.baseHp : 0;
  const gainHp = items.reduce((a, p) => a + p.hp, 0);
  const currentHp = baseHp + gainHp;
  const totalCost = items.reduce((a, p) => a + p.price, 0);

  const scaleMax = Math.max(currentHp, target, baseHp + 1) * 1.04;
  const pct = (v) => `${Math.min(100, (v / scaleMax) * 100)}%`;
  const stockPct = (baseHp / scaleMax) * 100;
  const gainPct = (gainHp / scaleMax) * 100;
  const targetPct = (target / scaleMax) * 100;

  const hit = currentHp >= target;
  const remain = Math.max(0, target - currentHp);

  return (
    <div className="dyno notch" style={{ position: "relative" }}>
      {locked && (
        <div className="locked-overlay">
          <span className="lk-ic">{g.lockedTitle}</span>
          <p>{g.lockedMsg}</p>
        </div>
      )}

      <div className="dyno-top">
        <div className="now">
          <div className="lab">{g.nowLab}</div>
          <b>{locked ? "—" : fmt(currentHp)}<small> {g.hpUnit}</small></b>
        </div>
        <div className="gain">
          <b>+{locked ? 0 : fmt(gainHp)}</b>
          <span>{g.gainLab}</span>
        </div>
      </div>

      {/* tri-segment bar */}
      <div className="tri">
        <div className="tri-track">
          <div className="tri-seg tri-stock" style={{ width: `${stockPct}%` }}></div>
          <div className="tri-seg tri-gain" style={{ width: `${gainPct}%` }}></div>
          <div className="tri-target-line" style={{ insetInlineStart: pct(target) }}></div>
          <div className="tri-target-flag" style={{ insetInlineStart: pct(target) }}>{fmt(target)}</div>
        </div>
        <div className="tri-legend">
          <span className="lg"><span className="sw stock"></span>{g.legendStock} {locked ? "" : fmt(baseHp)}</span>
          <span className="lg"><span className="sw gain"></span>{g.legendGain} +{locked ? 0 : fmt(gainHp)}</span>
          <span className="lg"><span className="sw target"></span>{g.legendTarget} {fmt(target)}</span>
        </div>
      </div>

      {/* target control */}
      <div className="target-ctrl">
        <div className="tc-head">
          <label>{g.targetLab}</label>
          <span className="val">{fmt(target)} <span style={{ fontSize: 12, color: "var(--text-3)" }}>{g.hpUnit}</span></span>
        </div>
        <input
          type="range"
          className="slider"
          min={baseHp || 100}
          max={(baseHp || 100) + 280}
          step={5}
          value={target}
          disabled={locked}
          onChange={(e) => setTarget(+e.target.value)}
        />
        <div className={`goal-status ${hit ? "hit" : "miss"}`}>
          <span className="ic">{hit ? <Icon.check /> : <Icon.gauge />}</span>
          <span>
            {hit
              ? <>{g.goalHit}<b>{fmt(currentHp)}</b> {g.goalHitB}</>
              : <>{g.goalMiss}<b>{fmt(remain)}</b> {g.goalMissB}</>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------- GARAGE LIST (the parts you've added) ----------------
function GarageList({ engine, garage, onRemove }) {
  const { t, lang } = useLang();
  const g = t.garage;
  const c = t.catalog;
  const PARTS = window.WL.PARTS;
  const CATS = window.WL.CATS;
  const items = garage.map((id) => PARTS.find((p) => p.id === id)).filter(Boolean);
  const totalCost = items.reduce((a, p) => a + p.price, 0);

  return (
    <div className="garage-list">
      <div className="gl-head">
        <span className="ttl"><Icon.gauge /> {g.head} <span className="count">{items.length} {g.parts}</span></span>
        {items.length > 0 && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>
            <span style={{ color: "var(--text-3)", fontSize: 11 }}>{g.totalCost} </span>₪{fmt(totalCost)}
          </span>
        )}
      </div>
      <div className="gl-items">
        {items.length === 0 ? (
          <div className="gl-empty">
            {g.empty}
            <span className="mono">{g.emptyHint}</span>
          </div>
        ) : (
          items.map((p) => (
            <div className="gl-row" key={p.id}>
              <Placeholder label="" ticks={false} className="gl-ph" />
              <div className="gl-info">
                <b>{p[lang].n}</b>
                <span>{CATS.find((x) => x.id === p.cat)?.[lang]} · ₪{fmt(p.price)}</span>
              </div>
              {p.hp > 0 && <span className="gl-hp">+{p.hp} HP</span>}
              <button className="rm" onClick={() => onRemove(p.id)} title={g.remove} aria-label={g.remove}>
                <Icon.x />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CarSelector, Catalog, Garage, GarageList });
