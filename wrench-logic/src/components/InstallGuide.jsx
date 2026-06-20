import { useTheme } from '../context/ThemeContext';

// Estimated install effort by difficulty, per language.
const TIME_BY_DIFFICULTY = {
  he: {
    easy:   '~30 דקות | כלים בסיסיים בלבד',
    medium: '~2-3 שעות | דורש ידע טכני',
    expert: '~יום עבודה | חובה מוסך מקצועי',
  },
  en: {
    easy:   '~30 min | basic tools only',
    medium: '~2-3 hours | technical knowledge required',
    expert: '~a full day | professional shop required',
  },
};

// Visual difficulty — 3 circles.
const CIRCLES_BY_DIFFICULTY = {
  easy:   '🟢⚪⚪',
  medium: '🟠🟠⚪',
  expert: '🔴🔴🔴',
};

const LABEL_BY_DIFFICULTY = {
  he: { easy: 'קל', medium: 'בינוני', expert: 'מומחה' },
  en: { easy: 'Easy', medium: 'Medium', expert: 'Expert' },
};

const T = {
  he: {
    timeUnknown: 'זמן התקנה לא ידוע',
    estTime: 'זמן התקנה משוער',
    difficulty: 'רמת קושי',
    difficultyAria: (d) => `רמת קושי: ${d}`,
    tutorial: 'סרטון הדרכה',
    videoTitle: 'סרטון התקנה',
    videoSoon: 'וידאו התקנה בקרוב',
    trackOnlyWarn: 'חלף זה מיועד לשימוש במסלול בלבד — לא חוקי לכביש',
    findTech: 'מצא טכנאי מומלץ באזורך →',
    mapsQuery: 'מוסך ספורט',
  },
  en: {
    timeUnknown: 'Install time unknown',
    estTime: 'Estimated install time',
    difficulty: 'Difficulty',
    difficultyAria: (d) => `Difficulty: ${d}`,
    tutorial: 'Tutorial video',
    videoTitle: 'Install video',
    videoSoon: 'Install video coming soon',
    trackOnlyWarn: 'This part is for track use only — not street legal',
    findTech: 'Find a recommended technician near you →',
    mapsQuery: 'performance auto shop',
  },
};

// Real YouTube install videos. Looked up by specific part id FIRST (so every
// part gets its own unique video), then falls back to the part's category slug.
// Each id maps to a single YouTube video id.
const VIDEOS_BY_ID = {
  // Brakes / cockpit (the "brk" category mixes brakes + interior parts)
  'wl-brk-001': 'bIGDhqY6KpE', // Flat-Bottom Racing Steering Wheel
  'wl-brk-002': '6RQ9UabOIPg', // Drilled Brake Rotors
  'wl-brk-003': 'cYjaxVMkMk0', // Short Shifter
  'wl-brk-004': 'UlbFFq60Tec', // EBC Sport Brake Pads

  // Boost
  'wl-bst-001': 'OL11Etw7ZSg', // Forge Electronic Boost Controller
  'wl-bst-002': '7CA2S_PzZe8', // Garrett GTX3076R Turbo
  'wl-bst-003': 'NoHXMjfDnq4', // HKS SSQV Blow-Off Valve
  'wl-bst-004': 'SsfR_B5udeA', // Stage 3 Hybrid Turbocharger

  // Engine
  'wl-eng-002': 'v6QdSXr3GJY', // ARP Reinforced Camshaft
  'wl-eng-003': 'XmSxjidMIG0', // Ferrea Performance Valves
  'wl-eng-004': 'mDIlwbx0B-s', // High-Pressure Fuel Pump (HPFP)

  // Exhaust
  'wl-exh-001': 'BitTWV8kkV8', // Milltek Exhaust
  'wl-exh-002': '_0iwi2jGg3c', // Akrapovic Slip-On Exhaust
  'wl-exh-003': 'v-s4ZCsC1oY', // Scorpion Full Exhaust System

  // Intake
  'wl-int-001': 'T0P3ZHdPnwg', // Cold Air Intake
  'wl-int-002': '0-oQEi0UOhA', // K&N Ram Air Intake
  'wl-int-003': '0huAd-CusBo', // Forged Aluminum Intake Manifold
  'wl-int-004': 'AucVffht18s', // Enlarged Turbo Inlet
  'wl-int-005': 'YI_Lbkrnj70', // Electric Radiator Fan (→ dashboard fan)

  // Suspension
  'wl-sus-001': 'Kn2YXm7wIJ8', // H&R Sport Springs
  'wl-sus-002': 'jdP2cyH3IQE', // KW Variant 3 Coilovers
  'wl-sus-003': 'P_CmdP8Arak', // Whiteline Sway Bars
  'wl-sus-004': 'RDgW5tSr6Ss', // Polyurethane Bushings

  // Turbo
  'wl-tur-001': 'ZK_2yeAEubM', // IS38 Hybrid Turbocharger

  // Wheels & tires
  'wl-whl-002': 'p4yOSp1NbXQ', // Michelin PS4S Performance Tires
  'wl-whl-001': '_HIaE1MyDiw', // Lightweight Forged Wheels 18" (not in update list — kept)

  // Weight reduction (not in update list — kept as-is)
  'wl-wgt-001': 'bzGFSSgkQYM',
  'wl-wgt-002': 'sfr51IPk3X4',
  'wl-wgt-003': 'MCiNGmwopx4',
  'wl-wgt-004': 'lSP3ajzp5XM',
};

const VIDEOS_BY_SLUG = {
  'software': '-Tx92alwbW0',
  'exhaust': 'g5c14htdKS4',
  'cooling': 'qBeZAd_HJvU',
  'induction': 'DoFGrq76zGA',
  'fuel': '9qFuzgN3APY',
  'wheels': '_HIaE1MyDiw',
  'weight': 'MCiNGmwopx4',
  'braking': 'QcWELyTbdP4',
};

export default function InstallGuide({ part }) {
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

  const difficulty   = part?.difficulty;
  const isLegal      = part?.isLegal;
  const timeEstimate = TIME_BY_DIFFICULTY[lang]?.[difficulty] ?? t.timeUnknown;
  const circles      = CIRCLES_BY_DIFFICULTY[difficulty] ?? '⚪⚪⚪';
  const diffLabel    = LABEL_BY_DIFFICULTY[lang]?.[difficulty] ?? (difficulty || '—');
  const videoId =
    VIDEOS_BY_ID[part?.id] ||
    VIDEOS_BY_SLUG[part?.categories?.slug] ||
    VIDEOS_BY_SLUG[part?.cat] ||
    null;

  return (
    <div className="flex flex-col gap-lg">

      {/* 1. Estimated time */}
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-row-reverse items-center gap-md text-right">
        <span className="material-symbols-outlined text-primary-container text-[28px]">schedule</span>
        <div>
          <p className="font-label-caps text-label-caps text-surface-variant uppercase">{t.estTime}</p>
          <p className="font-body-lg text-body-lg text-on-surface mt-1" dir={isHe ? 'rtl' : 'ltr'}>{timeEstimate}</p>
        </div>
      </div>

      {/* 2. Visual difficulty */}
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-row-reverse items-center justify-between gap-md">
        <div className="text-right">
          <p className="font-label-caps text-label-caps text-surface-variant uppercase">{t.difficulty}</p>
          <p className="font-body-lg text-body-lg text-on-surface mt-1">{diffLabel}</p>
        </div>
        <span className="text-[28px] tracking-widest" aria-label={t.difficultyAria(diffLabel)}>{circles}</span>
      </div>

      {/* 3. Responsive 16:9 YouTube embed (or fallback when no video yet) */}
      <div>
        <p className="font-label-caps text-label-caps text-surface-variant uppercase mb-sm text-right">{t.tutorial}</p>
        {videoId ? (
          <iframe
            width="100%"
            style={{aspectRatio:'16/9', border:'none', borderRadius:'8px'}}
            src={`https://www.youtube.com/embed/${videoId}`}
            title={t.videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={{aspectRatio:'16/9', background:'#1E1E1E', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', color:'#666'}}>
            {t.videoSoon}
          </div>
        )}
      </div>

      {/* 4. Track-only legal warning */}
      {isLegal === false && (
        <div className="bg-[#FEE2E2] border border-[#991B1B]/30 rounded-lg p-md flex flex-row-reverse items-center gap-3 text-right">
          <span className="text-[22px]">⚠️</span>
          <p className="font-body-md text-body-md font-semibold text-[#991B1B]" dir={isHe ? 'rtl' : 'ltr'}>
            {t.trackOnlyWarn}
          </p>
        </div>
      )}

      {/* 5. Find a technician */}
      <a
        href={`https://www.google.com/maps/search/${encodeURIComponent(t.mapsQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        <span className="material-symbols-outlined text-[18px]">location_on</span>
        {t.findTech}
      </a>
    </div>
  );
}
