import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import carsData from '../data/cars.json';
import HelpHint from '../components/HelpHint';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { displayMfr } from '../lib/displayNames';
import {
  fetchRecentVehicles,
  saveRecentVehicle,
  rowToVehicle,
} from '../lib/recentVehicles';

// Local model photos (downloaded from Wikimedia Commons → public/images/vehicles/),
// keyed by model id in cars.json. Served from the app root by Vite.
// Exported so other pages (e.g. MyGaragePage hero) can reuse the same map.
export const MODEL_IMAGES = {
  'golf-gti':     '/images/vehicles/golf-gti.jpg',
  'golf-r':       '/images/vehicles/golf-r.jpg',
  'leon-cupra':   '/images/vehicles/leon-cupra.jpg',
  'civic-type-r': '/images/vehicles/civic-type-r.jpg',
  'civic-si':     '/images/vehicles/civic-si.jpg',
  'veloster-n':   '/images/vehicles/veloster-n.jpg',
  'i30':          '/images/vehicles/i30.jpg',
};

// Manufacturer logos, keyed by the exact (Hebrew) `make` value in cars.json.
// Files live directly under public/images/.
const BRAND_LOGOS = {
  'פולקסווגן': '/images/Volkswagen.png',
  'הונדה':     '/images/honda.png',
  'סיאט':      '/images/seat.png',
  'יונדאי':    '/images/hyundai.png',
};

const T = {
  he: {
    engineHelp:
`איפה מוצאים את קוד המנוע?
📄 בתעודת הרכב — שדה 'סוג מנוע'
🔧 על גבי המנוע עצמו — מדבקה או חריטה
💻 באתר משרד התחבורה — חיפוש לפי מספר רכב
לדוגמה: EA888, K20C1, G4KH`,
    yearHelp:
`שנת ייצור vs. שנת רכישה
📅 שנת הייצור היא השנה שבה הרכב יוצר במפעל
🚗 שנת הרכישה יכולה להיות שנה מאוחרת יותר
📄 מצא בתעודת הרכב — שדה 'שנת ייצור'
⚠️ לא שנת הרישום!`,
    introTitle: 'בחר את הרכב שלך',
    introSub: 'WrenchLogic מותאמת אישית לפי הרכב שלך — בחר יצרן, דגם ושנה כדי לראות רק חלפים שמתאימים לך.',
    headerTitle: 'בחירת רכב',
    headerSub: 'בחר את נתוני הרכב כדי להציג חלפים ושיפורים שמתאימים במדויק לדגם שלך.',
    configTarget: 'הגדרת יעד',
    tabManual: 'הזנה ידנית ✓',
    tabPlate: 'לוחית רישוי 🚧',
    plateLabel: 'מספר לוחית רישוי',
    search: 'חפש',
    plateSoon: 'חיפוש לפי לוחית רישוי יהיה זמין בקרוב',
    manualAvailable: '* הזנה ידנית זמינה כעת',
    stepMake: 'יצרן', stepModel: 'דגם', stepYear: 'שנה', stepEngine: 'מנוע',
    makeLabel: 'יצרן', modelLabel: 'דגם', yearLabel: 'שנה', engineLabel: 'קוד מנוע',
    selectMake: 'בחר יצרן', selectModel: 'בחר דגם', selectYear: 'בחר שנה', selectEngine: 'בחר מנוע',
    yearHelpLabel: 'עזרה: שנת ייצור',
    engineHelpLabel: 'עזרה: קוד מנוע',
    hp: 'כ"ס',
    continue: 'המשך לקטלוג',
    notSure: 'לא בטוח לגבי פרטי הרכב?',
    govLink: '🔍 חפש את הרכב שלך באתר משרד התחבורה',
  },
  en: {
    engineHelp:
`Where do you find the engine code?
📄 On the vehicle license — 'engine type' field
🔧 On the engine itself — sticker or engraving
💻 On the Ministry of Transport site — search by plate
e.g. EA888, K20C1, G4KH`,
    yearHelp:
`Model year vs. purchase year
📅 The model year is the year the car was built at the factory
🚗 The purchase year may be later
📄 Find it on the vehicle license — 'year of manufacture'
⚠️ Not the registration year!`,
    introTitle: 'Select Your Car',
    introSub: 'WrenchLogic is personalized to your car — pick a make, model and year to see only the parts that fit you.',
    headerTitle: 'Vehicle Selection',
    headerSub: 'Choose your vehicle details to show parts and upgrades that fit your model exactly.',
    configTarget: 'Configure Target',
    tabManual: 'Manual entry ✓',
    tabPlate: 'License plate 🚧',
    plateLabel: 'License plate number',
    search: 'Search',
    plateSoon: 'License plate lookup will be available soon',
    manualAvailable: '* Manual entry is available now',
    stepMake: 'Manufacturer', stepModel: 'Model', stepYear: 'Year', stepEngine: 'Engine',
    makeLabel: 'Manufacturer', modelLabel: 'Model', yearLabel: 'Year', engineLabel: 'Engine Code',
    selectMake: 'Select Manufacturer', selectModel: 'Select Model', selectYear: 'Select Year', selectEngine: 'Select Engine',
    yearHelpLabel: 'Help: model year',
    engineHelpLabel: 'Help: engine code',
    hp: 'HP',
    continue: 'Continue to Catalog',
    notSure: 'Not sure about your vehicle details?',
    govLink: '🔍 Look up your vehicle on the Ministry of Transport site',
  },
};

export default function VehicleSelectionPage() {
  const navigate = useNavigate();
  const { selectedVehicle, setSelectedVehicle } = useVehicle();
  const { clearGarage } = useGarage();
  const { user } = useAuth();
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

  // Entry tabs: 'manual' (default — what the user sees first) | 'plate'
  const [entryTab, setEntryTab] = useState('manual');

  // Custom manufacturer dropdown (native <select> can't render logos in options).
  const [makeOpen, setMakeOpen] = useState(false);
  const makeRef = useRef(null);

  // Close the manufacturer dropdown on outside click.
  useEffect(() => {
    if (!makeOpen) return;
    const onDown = (e) => { if (makeRef.current && !makeRef.current.contains(e.target)) setMakeOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [makeOpen]);

  // Auto-select the user's default vehicle on entry (signed-in users only).
  const [autoSelected, setAutoSelected] = useState(false);

  const loadRecent = useCallback(async () => {
    if (!user) return [];
    return await fetchRecentVehicles(user.id);
  }, [user]);

  // On entering the page (signed in): load history and auto-select the default.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const rows = await loadRecent();
      if (!active) return;
      const def = rows[0]; // no is_default column — newest by created_at is the default
      if (def && !autoSelected && !selectedVehicle) {
        setSelectedVehicle(rowToVehicle(def));
        setAutoSelected(true);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadRecent]);

  const [selectedMake,   setSelectedMake]   = useState('');
  const [selectedModel,  setSelectedModel]  = useState('');
  const [selectedYear,   setSelectedYear]   = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  const currentMake      = carsData.find(m => m.id === selectedMake);
  const availableModels  = currentMake?.models ?? [];
  const currentModel     = availableModels.find(m => m.id === selectedModel);
  const availableYears   = currentModel?.years ?? [];
  const currentYear      = availableYears.find(y => y.year === Number(selectedYear));
  const availableEngines = currentYear?.engines ?? [];

  const chooseMake = (id) => {
    setSelectedMake(id);
    setSelectedModel('');
    setSelectedYear('');
    setSelectedEngine('');
    setMakeOpen(false);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setSelectedEngine('');
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedEngine('');
  };

  const isFormComplete = selectedMake && selectedModel && selectedYear && selectedEngine;

  const handleContinue = async () => {
    const engine     = availableEngines.find(e => e.id === selectedEngine);
    const isNewVehicle = !selectedVehicle ||
      selectedVehicle.engine.id !== engine.id;

    if (isNewVehicle) clearGarage();

    const vehicle = {
      makeId:    currentMake.id,
      makeName:  currentMake.make,
      modelId:   currentModel.id,
      modelName: currentModel.name,
      year:      Number(selectedYear),
      engine,
    };
    // Save to the DB for signed-in users and capture the row's UUID. That UUID
    // becomes garage_entries.vehicle_id (guests stay null). Non-blocking.
    if (user) {
      try {
        const dbId = await saveRecentVehicle(user.id, vehicle);
        if (dbId) vehicle.id = dbId;
      } catch { /* ignore */ }
    }
    setSelectedVehicle(vehicle);
    navigate('/catalog');
  };

  const selectClass =
    'w-full bg-[#121212] border border-[#2D2D2D] rounded text-[#E0E0E0] p-3 font-body-md text-body-md appearance-none focus:border-primary-container focus:ring-0 cursor-pointer pl-10 disabled:opacity-40 disabled:cursor-not-allowed';

  const tabClass = (active) =>
    `flex items-center gap-2 px-4 py-2 rounded-t font-label-caps text-label-caps transition-colors border-b-2 ` +
    (active
      ? 'border-primary-container text-primary-container'
      : 'border-transparent text-secondary hover:text-on-surface');

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen relative">

      {/* Background Engine Image */}
      <div
        className="absolute inset-0 z-0 opacity-10 mix-blend-luminosity bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBurEgOH3jmw4eP2CFysB37rBzR1e4jguvbCXMmSgXy_LdyIj0Dt_4LflY0ZcbQ0nRomlIvMXFZ4bPCtz4SZ38MQj-1c_qeUmZATwJ8dY7uD-CB0iA11TPi2k_ug22YT7VK54m_28VUg2davlnVadi5crMA3P57aIiiT5H4tWe5tNHxBK1zvkhJHC4467uzSrInD9VO1VTO9AYe9cICqc3W8s6tP8Mm8cFIFmZBSilUSwMIX3iZbmvqwhBR6EioeMI43dCkoG72YTw')" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-lg">

        {/* Intro block */}
        <div className="text-center space-y-2 mb-lg">
          <h1 className="font-h1 text-h1 font-bold text-white">{t.introTitle}</h1>
          <p className="font-body-lg text-body-lg text-[#C8C6C5] max-w-2xl mx-auto">
            {t.introSub}
          </p>
        </div>

        {/* Page Header */}
        <header className="mb-xl text-right">
          <div className="flex items-center gap-2 justify-end mb-2">
            <span className="font-h1 text-h1 text-primary-container">{t.headerTitle}</span>
            {isHe && <span className="font-h2 text-h2 text-[#474747] opacity-60">(VEHICLE SELECTION)</span>}
          </div>
          <p className="font-body-lg text-body-lg text-secondary">
            {t.headerSub}
          </p>
        </header>

        {/* Vehicle Entry Panel */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md shadow-[0_2px_4px_rgba(0,0,0,0.5)]">

          {/* Panel header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary-container">tune</span>
            <div>
              <h2 className="font-h2 text-h2 text-primary-container">{t.configTarget}</h2>
              {isHe && <span className="font-label-caps text-label-caps text-[#474747]">(CONFIGURE TARGET)</span>}
            </div>
          </div>

          {/* Tabs — manual first (default), license plate second */}
          <div className="flex flex-row-reverse gap-2 mb-6 border-b border-[#2D2D2D]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={entryTab === 'manual'}
              onClick={() => setEntryTab('manual')}
              className={tabClass(entryTab === 'manual')}
            >
              <span className="material-symbols-outlined text-sm">keyboard</span>
              {t.tabManual}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={entryTab === 'plate'}
              onClick={() => setEntryTab('plate')}
              className={tabClass(entryTab === 'plate')}
            >
              <span className="material-symbols-outlined text-sm">pin</span>
              {t.tabPlate}
            </button>
          </div>

          {/* ── Tab A: License Plate (disabled — feature under construction) ── */}
          {entryTab === 'plate' && (
            <div className="flex flex-col items-center gap-5 py-6">
              <label className="font-label-caps text-label-caps text-secondary self-end">
                {t.plateLabel}
              </label>
              <input
                type="text"
                dir="ltr"
                disabled
                readOnly
                aria-disabled="true"
                placeholder="342-74-632"
                className="w-full max-w-sm text-center font-mono-data text-[34px] md:text-[44px] font-bold tracking-widest bg-[#F5C518] text-black border-[5px] border-black rounded-md py-3 px-4 placeholder-black/40 opacity-60 cursor-not-allowed focus:outline-none"
              />
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full max-w-sm bg-primary-container text-[#121212] font-bold py-4 rounded font-label-caps text-label-caps flex items-center justify-center gap-2 opacity-40 cursor-not-allowed shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              >
                <span className="material-symbols-outlined">search</span>
                {t.search}
              </button>
              <div role="status" className="w-full max-w-sm flex items-center justify-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/40 text-[#FF6B00] rounded-md py-3 px-4 font-body-md text-body-md text-center">
                {t.plateSoon}
              </div>
              <p className="text-xs text-secondary text-center">{t.manualAvailable}</p>
            </div>
          )}

          {/* ── Tab B: Vehicle Details (existing form) ──────── */}
          {entryTab === 'manual' && (
            <>
              {/* 4-step progress bar — updates live as the user selects */}
              {(() => {
                const steps = [
                  { label: t.stepMake,   done: !!selectedMake },
                  { label: t.stepModel,  done: !!selectedModel },
                  { label: t.stepYear,   done: !!selectedYear },
                  { label: t.stepEngine, done: !!selectedEngine },
                ];
                const currentIdx = steps.findIndex(s => !s.done);
                return (
                  <div className="flex flex-row-reverse items-center justify-between mb-8 px-1">
                    {steps.map((s, i) => {
                      const isCurrent = i === currentIdx;
                      return (
                        <Fragment key={s.label}>
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                              s.done
                                ? 'bg-primary-container border-primary-container text-[#121212]'
                                : isCurrent
                                  ? 'border-primary-container text-primary-container bg-transparent'
                                  : 'border-[#2D2D2D] text-secondary bg-transparent'
                            }`}>
                              {s.done ? '✓' : i + 1}
                            </div>
                            <span className={`font-label-caps text-[11px] ${s.done || isCurrent ? 'text-primary-container' : 'text-secondary'}`}>
                              {s.label}
                            </span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${s.done ? 'bg-primary-container' : 'bg-[#2D2D2D]'}`} />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                );
              })()}

              {/* 4-Step Cascading Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                {/* 1 – Make (custom dropdown with brand logos — native <select> can't show images) */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-secondary">{t.makeLabel}</label>
                  <div className="relative" ref={makeRef}>
                    <button
                      type="button"
                      onClick={() => setMakeOpen(o => !o)}
                      aria-haspopup="listbox"
                      aria-expanded={makeOpen}
                      dir={isHe ? 'rtl' : 'ltr'}
                      className={`w-full bg-[#121212] border rounded text-[#E0E0E0] p-3 font-body-md text-body-md cursor-pointer flex items-center justify-between gap-2 focus:outline-none transition-colors ${makeOpen ? 'border-primary-container' : 'border-[#2D2D2D]'}`}
                    >
                      <span className="flex items-center min-w-0">
                        {currentMake && (
                          <img
                            src={BRAND_LOGOS[currentMake.make]}
                            alt={displayMfr(currentMake.make, lang)}
                            style={{ width: '24px', height: '24px', objectFit: 'contain', marginInlineEnd: '10px' }}
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        )}
                        <span className={`truncate ${currentMake ? '' : 'text-[#6B6B6B]'}`}>
                          {currentMake ? displayMfr(currentMake.make, lang) : t.selectMake}
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-secondary shrink-0">arrow_drop_down</span>
                    </button>
                    {makeOpen && (
                      <ul
                        role="listbox"
                        dir={isHe ? 'rtl' : 'ltr'}
                        className="absolute z-30 mt-1 w-full bg-[#121212] border border-[#2D2D2D] rounded shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden"
                      >
                        {carsData.map(make => (
                          <li key={make.id} role="option" aria-selected={selectedMake === make.id}>
                            <button
                              type="button"
                              onClick={() => chooseMake(make.id)}
                              className={`w-full flex items-center p-3 font-body-md text-body-md text-start hover:bg-[#1E1E1E] hover:text-primary-container transition-colors ${selectedMake === make.id ? 'text-primary-container bg-[#1E1E1E]' : 'text-[#E0E0E0]'}`}
                            >
                              <img
                                src={BRAND_LOGOS[make.make]}
                                alt={displayMfr(make.make, lang)}
                                style={{ width: '24px', height: '24px', objectFit: 'contain', marginInlineEnd: '10px' }}
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                              />
                              <span className="truncate">{displayMfr(make.make, lang)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 2 – Model */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-secondary">{t.modelLabel}</label>
                  <div className="relative">
                    <select className={selectClass} dir={isHe ? 'rtl' : 'ltr'} value={selectedModel} onChange={handleModelChange} disabled={!selectedMake}>
                      <option value="" disabled>{t.selectModel}</option>
                      {availableModels.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                  </div>
                </div>

                {/* 3 – Year */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <label className="font-label-caps text-label-caps text-secondary">{t.yearLabel}</label>
                    <HelpHint text={t.yearHelp} label={t.yearHelpLabel} />
                  </div>
                  <div className="relative">
                    <select className={selectClass} dir={isHe ? 'rtl' : 'ltr'} value={selectedYear} onChange={handleYearChange} disabled={!selectedModel}>
                      <option value="" disabled>{t.selectYear}</option>
                      {availableYears.map(y => (
                        <option key={y.year} value={y.year}>{y.year}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                  </div>
                </div>

                {/* 4 – Engine */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <label className="font-label-caps text-label-caps text-secondary">{t.engineLabel}</label>
                    <HelpHint text={t.engineHelp} label={t.engineHelpLabel} />
                  </div>
                  <div className="relative">
                    <select className={selectClass} dir={isHe ? 'rtl' : 'ltr'} value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value)} disabled={!selectedYear}>
                      <option value="" disabled>{t.selectEngine}</option>
                      {availableEngines.map(engine => (
                        <option key={engine.id} value={engine.id}>
                          {`${engine.code} — ${engine.displacement} (${engine.stockHp} ${t.hp})`}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                  </div>
                </div>

              </div>

              {/* Selected Model Preview */}
              {currentModel && (
                <div className="mb-8 flex items-center gap-md bg-[#121212] border border-[#2D2D2D] rounded-lg overflow-hidden">
                  <div className="w-32 h-24 shrink-0 bg-[#0A0A0A] flex items-center justify-center overflow-hidden relative">
                    {/* Fallback icon — visible when no image, or if it fails to load */}
                    <span className="material-symbols-outlined text-[40px] text-[#474747]">directions_car</span>
                    {MODEL_IMAGES[currentModel.id] && (
                      <img
                        src={MODEL_IMAGES[currentModel.id]}
                        alt={`${displayMfr(currentMake.make, lang)} ${currentModel.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="text-right pr-1">
                    <p className="font-label-caps text-label-caps text-secondary uppercase">{displayMfr(currentMake.make, lang)}</p>
                    <h3 className="font-h2 text-h2 text-on-surface" dir="ltr">{currentModel.name}</h3>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleContinue}
                disabled={!isFormComplete}
                className="w-full bg-primary-container text-[#121212] font-bold py-4 rounded font-label-caps text-label-caps flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">power_settings_new</span>
                {t.continue}
              </button>

              {/* Bottom help message */}
              <p className="mt-4 text-center font-body-md text-[13px] text-secondary leading-relaxed">
                {t.notSure}{' '}
                <a
                  href="https://www.gov.il/he/service/vehicle_license_info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-container hover:underline"
                >
                  {t.govLink}
                </a>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
