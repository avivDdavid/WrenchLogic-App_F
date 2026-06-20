import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import CategoryCard from '../components/CategoryCard';
import { displayMfr, partName } from '../lib/displayNames';

// Bilingual category names + short descriptions, keyed by slug. Used to render
// category titles/descriptions in the active language (DB rows are Hebrew-only).
const CATEGORY_NAMES = {
  engine:     { he: 'מנוע',          en: 'Engine',          dHe: 'שדרוגי מנוע וביצועים',   dEn: 'Engine & performance upgrades' },
  intake:     { he: 'יניקה',         en: 'Intake',          dHe: 'מערכות יניקת אוויר',      dEn: 'Air intake systems' },
  exhaust:    { he: 'פליטה',         en: 'Exhaust',         dHe: 'מערכות פליטה וזרימה',     dEn: 'Exhaust & flow systems' },
  brakes:     { he: 'בלמים',         en: 'Brakes',          dHe: 'שיפור מערכת הבלימה',      dEn: 'Braking system upgrades' },
  suspension: { he: 'מתלים',         en: 'Suspension',      dHe: 'כיוון וחיזוק המתלה',       dEn: 'Suspension tuning & bracing' },
  boost:      { he: 'בוסט',          en: 'Boost',           dHe: 'שיפורי לחץ טורבו',         dEn: 'Turbo boost upgrades' },
  wheels:     { he: 'גלגלים וצמיגים', en: 'Wheels & Tires', dHe: 'חישוקים קלים ואחיזה',     dEn: 'Lightweight wheels & grip' },
  weight:     { he: 'הפחתת משקל',    en: 'Weight Reduction', dHe: 'הפחתת משקל וביצועים',    dEn: 'Weight reduction & performance' },
  interior:   { he: 'פנים ואריזה',   en: 'Interior',        dHe: 'מושבים, הגה ושיפורי תא נהג', dEn: 'Seats, wheel & cockpit upgrades' },
  software:   { he: 'תוכנה',         en: 'Software',        dHe: 'מיפוי ושדרוגי ECU',        dEn: 'ECU mapping & tuning' },
  cooling:    { he: 'צינון',         en: 'Cooling',         dHe: 'מערכות צינון וקירור',       dEn: 'Cooling systems' },
  fuel:       { he: 'דלק',           en: 'Fuel',            dHe: 'מערכות הזנת דלק',          dEn: 'Fuel delivery systems' },
};

// Localized category name with graceful fallback to the DB value.
const categoryName = (slug, lang, fallback) =>
  CATEGORY_NAMES[slug]?.[lang] ?? fallback ?? slug;
// Localized category description with graceful fallback to the DB value.
const categoryDesc = (slug, lang, fallback) =>
  CATEGORY_NAMES[slug]?.[lang === 'he' ? 'dHe' : 'dEn'] ?? fallback ?? '';

// Category cards use the local AI-generated PNGs (public/images/parts/).
const CATEGORY_IMAGES = {
  engine:     '/images/parts/engine.png',
  intake:     '/images/parts/intake.png',
  exhaust:    '/images/parts/exhaust.png',
  brakes:     '/images/parts/brakes.png',
  suspension: '/images/parts/suspension.png',
  boost:      '/images/parts/boost.png',
  wheels:     '/images/parts/wheels.png',
  weight:     '/images/parts/weight.png',
  software:   '/images/parts/engine.png',
  cooling:    '/images/parts/fmic.png',
  fuel:       '/images/parts/hpfp.png',
  braking:    '/images/parts/brakes.png',
  interior:   '/images/parts/bucket-seats.png',
};

const DEFAULT_IMG = CATEGORY_IMAGES.engine;

// Page text in both languages.
const T = {
  he: {
    heroTitle: 'WrenchLogic — כי הרכב שלך לא נולד להיות stock 🔥',
    heroSub1: 'מצא את השדרוג הבא שלך. השווה חלקים. תכנן את הבנייה.',
    heroSub2: 'נתונים טכניים קשיחים, בלי ניחושים, בלי בולשיט.',
    loginHint: '💾 התחבר כדי לשמור את הגראז\' שלך ולחזור אליו מכל מכשיר.',
    activePlatform: 'פלטפורמה פעילה',
    chooseVehicle: 'בחר רכב',
    chooseVehicleSub: 'בחר את הרכב שלך כדי לראות התאמה מדויקת ומדדי ביצועים. ניתן לדפדף בקטגוריות גם בלי לבחור רכב.',
    popularTitle: '🔥 הכי פופולרי',
    popularSub: 'החלפים שהכי הרבה טיונרים מוסיפים לגראז\'',
    tunersInstalling: 'טיונרים מתקינים',
    fitsMyCar: 'האם יתאים לרכב שלי?',
    title: 'קטגוריות שיפורים',
    subtitle: 'בחר מערכת לשדרוגי ביצועים ונתוני דיאגנוסטיקה.',
    retry: 'נסה שוב',
    hp: 'כ"ס',
    disclaimer: '* חלפים המסומנים \'למסלול בלבד\' אינם מאושרים לשימוש בכביש ציבורי בישראל. WrenchLogic מציגה מידע טכני בלבד ואינה אחראית לשימוש, התקנה או חוקיות. תמיד בדוק עם טכנאי מוסמך לפני התקנה.',
  },
  en: {
    heroTitle: 'WrenchLogic — because your car wasn\'t born to stay stock 🔥',
    heroSub1: 'Find your next upgrade. Compare parts. Plan your build.',
    heroSub2: 'Hard technical data — no guessing, no BS.',
    loginHint: '💾 Sign in to save your garage and access it from any device.',
    activePlatform: 'Active Platform',
    chooseVehicle: 'Select a vehicle',
    chooseVehicleSub: 'Select your car to see exact fitment and performance metrics. You can browse categories without selecting a car.',
    popularTitle: '🔥 Most Popular',
    popularSub: 'The parts most tuners add to their garage',
    tunersInstalling: 'tuners installing',
    fitsMyCar: 'Will it fit my car?',
    title: 'Upgrade Categories',
    subtitle: 'Select a system for performance upgrades and diagnostic data.',
    retry: 'Try again',
    hp: 'HP',
    disclaimer: '* Parts marked \'track only\' are not approved for use on public roads in Israel. WrenchLogic provides technical information only and is not responsible for use, installation or legality. Always consult a certified technician before installation.',
  },
};

// Fixed, known catalog. Used as a fallback when the Supabase `categories`
// query comes back empty — e.g. a guest (not signed in) hits the
// authenticated-only RLS and gets `[]`. Ensures the categories always
// render. Real DB rows take precedence when available.
const FALLBACK_CATEGORIES = [
  { id: 'engine',     name: 'מנוע',   slug: 'engine',     description: 'שדרוגי מנוע וביצועים' },
  { id: 'intake',     name: 'יניקה',  slug: 'intake',     description: 'מערכות יניקת אוויר' },
  { id: 'exhaust',    name: 'פליטה',  slug: 'exhaust',    description: 'מערכות פליטה וזרימה' },
  { id: 'brakes',     name: 'בלמים',  slug: 'brakes',     description: 'שיפור מערכת הבלימה' },
  { id: 'suspension', name: 'מתלים',  slug: 'suspension', description: 'כיוון וחיזוק המתלה' },
  { id: 'boost',      name: 'בוסט',   slug: 'boost',      description: 'שיפורי לחץ טורבו' },
  { id: 'wheels',     name: 'חישוקים', slug: 'wheels',    description: 'חישוקים קלים ואחיזה' },
  { id: 'weight',     name: 'הפחתת משקל', slug: 'weight', description: 'הפחתת משקל וביצועים' },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { user } = useAuth();
  const { lang } = useTheme();
  const t = T[lang] || T.he;

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [popular, setPopular] = useState([]); // top-3 most-added parts
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .order('name');

      if (!sbError && data && data.length > 0) {
        setCategories(data);
      } else {
        // Empty (guest blocked by RLS) or unreachable → show the known catalog
        // so the page is never blank. (Logged-in users get the live DB rows.)
        setCategories(FALLBACK_CATEGORIES);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // Most-popular parts — top 3 by install count. Reads the public aggregate
  // view `part_install_counts` first (readable by GUESTS, bypasses garage_entries
  // RLS); falls back to counting the signed-in user's own garage_entries if that
  // view hasn't been created yet. Then resolves names/images/categories.
  useEffect(() => {
    let active = true;
    const fetchPopular = async () => {
      setPopularLoading(true);

      // 1. Try the public aggregate view (works for everyone, incl. guests).
      let top = [];
      const { data: viewData, error: viewErr } = await supabase
        .from('part_install_counts')
        .select('part_id, install_count')
        .order('install_count', { ascending: false })
        .limit(3);

      if (!viewErr && Array.isArray(viewData) && viewData.length > 0) {
        top = viewData.map(r => [r.part_id, r.install_count]);
      } else {
        // 2. Fallback: count the current user's own garage_entries (guests get []).
        const { data: entries } = await supabase.from('garage_entries').select('part_id');
        if (Array.isArray(entries) && entries.length > 0) {
          const counts = {};
          entries.forEach(e => { if (e.part_id) counts[e.part_id] = (counts[e.part_id] ?? 0) + 1; });
          top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        }
      }

      if (!active) return;
      if (top.length === 0) { setPopular([]); setPopularLoading(false); return; }

      const topIds = top.map(([id]) => id);
      const { data: partsData } = await supabase
        .from('parts')
        .select('id, name, name_en, image_url, categories(name, slug)')
        .in('id', topIds);
      if (!active) return;
      if (!Array.isArray(partsData)) { setPopular([]); setPopularLoading(false); return; }

      const byId = Object.fromEntries(partsData.map(p => [p.id, p]));
      const merged = top
        .map(([id, count]) => {
          const p = byId[id];
          if (!p) return null;
          return {
            id,
            count,
            name: p.name,
            name_en: p.name_en ?? null,
            imageUrl: p.image_url ?? '',
            categorySlug: p.categories?.slug ?? '',
            categoryName: p.categories?.name ?? '',
          };
        })
        .filter(Boolean);
      setPopular(merged);
      setPopularLoading(false);
    };
    fetchPopular();
    return () => { active = false; };
  }, []);

  return (
    <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">

        {/* Landing intro — energetic hero */}
        <section className="mb-[16px] text-right bg-[#1A1A1A] border-l-4 border-[#FF6B00] rounded-lg p-6 md:p-8">
          <h1 className="font-h1 text-h1 font-black text-[#FF6B00] leading-tight m-0">
            {t.heroTitle}
          </h1>
          <p className="font-h2 text-h2 text-on-background m-0">
            {t.heroSub1}
          </p>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mr-auto m-0">
            {t.heroSub2}
          </p>
          {!user && (
            <p className="font-body-md text-body-md text-tertiary-container mt-md">
              {t.loginHint}
            </p>
          )}
        </section>

        {/* Most-popular parts — rendered first (for guests too). A fixed
            min-height + skeletons keep the categories below from jumping while
            it loads. Collapses only if there's genuinely no data after loading. */}
        {(popularLoading || popular.length > 0) && (
          <section className="mb-xl min-h-[180px]">
            <div className="text-right mb-md">
              <h2 className="font-h2 text-h2 text-on-background">{t.popularTitle}</h2>
              <p className="font-body-md text-body-md text-secondary mt-xs">{t.popularSub}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {popularLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-[108px] rounded-lg bg-[#1E1E1E] border border-[#2D2D2D] animate-pulse" />
                  ))
                : popular.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/catalog/${p.id}`)}
                  className="bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg p-md text-right hover:border-[#FF6B00] hover:bg-[#252525] transition-colors cursor-pointer space-y-sm"
                >
                  <div className="flex flex-row-reverse items-center gap-md">
                    <img
                      src={p.imageUrl || '/images/parts/part.png'}
                      alt={partName(p, lang)}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/parts/part.png'; }}
                      className="w-14 h-14 shrink-0 rounded-full object-cover bg-[#121212] border border-[#2D2D2D]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body-md text-body-md font-bold text-on-surface truncate" dir={lang === 'he' ? 'rtl' : 'ltr'}>{partName(p, lang)}</h3>
                      <p className="font-mono-data text-[11px] text-secondary">{categoryName(p.categorySlug, lang, p.categoryName)}</p>
                    </div>
                    <span className="shrink-0 font-mono-data text-[11px] text-[#FF6B00] whitespace-nowrap">🔧 {p.count} {t.tunersInstalling}</span>
                  </div>
                  {!selectedVehicle && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/vehicle-selection'); }}
                      className="w-full flex items-center justify-center gap-1 border border-[#FF6B00]/50 text-[#FF6B00] font-label-caps text-[11px] py-1.5 rounded hover:bg-[#FF6B00] hover:text-[#121212] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">directions_car</span>
                      {t.fitsMyCar}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vehicle Context Banner — only when a vehicle is selected */}
        {selectedVehicle ? (
          <div className="mb-lg flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md">
            <span className="material-symbols-outlined text-primary-container">directions_car</span>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-secondary uppercase">{t.activePlatform}</p>
              <p className="font-mono-data text-mono-data text-on-surface" dir="ltr">
                {selectedVehicle.year} {displayMfr(selectedVehicle.makeName, lang)} {selectedVehicle.modelName} &nbsp;|&nbsp; {selectedVehicle.engine.code} {selectedVehicle.engine.displacement} &nbsp;|&nbsp; {selectedVehicle.engine.stockHp} {t.hp} / {selectedVehicle.engine.stockTorque} Nm
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/vehicle-selection')}
            className="mb-lg w-full flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-dashed border-primary-container/50 rounded p-md text-right hover:border-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-primary-container">directions_car</span>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-primary-container uppercase">{t.chooseVehicle}</p>
              <p className="font-body-md text-body-md text-secondary">
                {t.chooseVehicleSub}
              </p>
            </div>
          </button>
        )}

        {/* Page Header */}
        <header className="mb-lg text-right">
          <h2 className="font-h1 text-h1 text-on-background">{t.title}</h2>
          <p className="font-body-lg text-body-lg text-tertiary-container mt-xs">
            {t.subtitle}
          </p>
        </header>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-lg bg-[#1E1E1E] border border-[#2D2D2D] animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-md">
            <span className="material-symbols-outlined text-[56px] text-red-500">cloud_off</span>
            <p className="font-h2 text-h2 text-on-surface">{error}</p>
            <button onClick={() => window.location.reload()} className="border border-primary-container text-primary-container font-label-caps text-label-caps px-6 py-3 rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
              {t.retry}
            </button>
          </div>
        )}

        {/* Category Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                title={categoryName(cat.slug, lang, cat.name)}
                itemCount={categoryDesc(cat.slug, lang, cat.description)}
                imageSrc={CATEGORY_IMAGES[cat.slug] ?? DEFAULT_IMG}
                onClick={() => navigate(`/catalog/category/${cat.slug}`)}
              />
            ))}
          </div>
        )}

        {/* Legal disclaimer footer */}
        <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed text-center border-t border-[#2D2D2D] pt-md mt-xl" dir={lang === 'he' ? 'rtl' : 'ltr'}>
          {t.disclaimer}
        </p>

      </div>
    </main>
  );
}
