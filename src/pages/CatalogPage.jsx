import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CategoryCard from '../components/CategoryCard';

// Category cards use the local AI-generated PNGs (public/images/parts/).
const CATEGORY_IMAGES = {
  engine:     '/images/parts/engine.jpg',
  intake:     '/images/parts/intake.jpg',
  exhaust:    '/images/parts/exhaust.jpg',
  brakes:     '/images/parts/brakes.jpg',
  suspension: '/images/parts/suspension.jpg',
  boost:      '/images/parts/boost.jpg',
};

const DEFAULT_IMG = CATEGORY_IMAGES.engine;

// Fixed, known catalog. Used as a fallback when the Supabase `categories`
// query comes back empty — e.g. a guest (not signed in) hits the
// authenticated-only RLS and gets `[]`. Ensures the 6 categories always
// render. Real DB rows take precedence when available.
const FALLBACK_CATEGORIES = [
  { id: 'engine',     name: 'מנוע',   slug: 'engine',     description: 'שדרוגי מנוע וביצועים' },
  { id: 'intake',     name: 'יניקה',  slug: 'intake',     description: 'מערכות יניקת אוויר' },
  { id: 'exhaust',    name: 'פליטה',  slug: 'exhaust',    description: 'מערכות פליטה וזרימה' },
  { id: 'brakes',     name: 'בלמים',  slug: 'brakes',     description: 'שיפור מערכת הבלימה' },
  { id: 'suspension', name: 'מתלים',  slug: 'suspension', description: 'כיוון וחיזוק המתלה' },
  { id: 'boost',      name: 'בוסט',   slug: 'boost',      description: 'שיפורי לחץ טורבו' },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [compatCounts, setCompatCounts] = useState(null); // { slug: count } when a vehicle is selected
  const [popular, setPopular] = useState([]); // top-3 most-added parts

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

  // Most-popular parts — count garage_entries by part_id, take the top 3,
  // then resolve names/images/categories. Hidden entirely when there's no data.
  useEffect(() => {
    let active = true;
    const fetchPopular = async () => {
      const { data: entries, error: entErr } = await supabase
        .from('garage_entries')
        .select('part_id');
      if (entErr || !active || !Array.isArray(entries) || entries.length === 0) {
        if (active) setPopular([]);
        return;
      }

      // Count occurrences per part_id (client-side GROUP BY).
      const counts = {};
      entries.forEach(e => { if (e.part_id) counts[e.part_id] = (counts[e.part_id] ?? 0) + 1; });
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      if (top.length === 0) { if (active) setPopular([]); return; }

      const topIds = top.map(([id]) => id);
      const { data: partsData } = await supabase
        .from('parts')
        .select('id, name, image_url, categories(name, slug)')
        .in('id', topIds);
      if (!active || !Array.isArray(partsData)) return;

      const byId = Object.fromEntries(partsData.map(p => [p.id, p]));
      const merged = top
        .map(([id, count]) => {
          const p = byId[id];
          if (!p) return null;
          return {
            id,
            count,
            name: p.name,
            imageUrl: p.image_url ?? '',
            categoryName: p.categories?.name ?? '',
          };
        })
        .filter(Boolean);
      setPopular(merged);
    };
    fetchPopular();
    return () => { active = false; };
  }, []);

  // Count parts compatible with the selected vehicle, grouped by category slug.
  useEffect(() => {
    if (!selectedVehicle) { setCompatCounts(null); return; }
    let active = true;
    supabase
      .from('parts')
      .select('compatible_models, categories(slug)')
      .then(({ data }) => {
        if (!active || !Array.isArray(data)) return;
        const modelId = selectedVehicle.modelId;
        const counts = {};
        data.forEach(p => {
          const slug = p.categories?.slug;
          if (!slug) return;
          const fits = p.compatible_models == null || p.compatible_models.includes(modelId);
          if (fits) counts[slug] = (counts[slug] ?? 0) + 1;
        });
        setCompatCounts(counts);
      });
    return () => { active = false; };
  }, [selectedVehicle]);

  return (
    <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">

        {/* Landing intro — energetic hero */}
        <section className="mb-[16px] text-right bg-[#1A1A1A] border-l-4 border-[#FF6B00] rounded-lg p-6 md:p-8">
          <h1 className="font-h1 text-h1 font-black text-[#FF6B00] leading-tight m-0">
            WrenchLogic — כי הרכב שלך לא נולד להיות stock 🔥
          </h1>
          <p className="font-h2 text-h2 text-on-background m-0">
            מצא את השדרוג הבא שלך. השווה חלקים. תכנן את הבנייה.
          </p>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mr-auto m-0">
            נתונים טכניים קשיחים, בלי ניחושים, בלי בולשיט.
          </p>
          {!user && (
            <p className="font-body-md text-body-md text-tertiary-container mt-md">
              💾 התחבר כדי לשמור את הגראז&apos; שלך ולחזור אליו מכל מכשיר.
            </p>
          )}
        </section>

        {/* Vehicle Context Banner — only when a vehicle is selected */}
        {selectedVehicle ? (
          <div className="mb-lg flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md">
            <span className="material-symbols-outlined text-primary-container">directions_car</span>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-secondary uppercase">פלטפורמה פעילה</p>
              <p className="font-mono-data text-mono-data text-on-surface" dir="ltr">
                {selectedVehicle.year} {selectedVehicle.makeName} {selectedVehicle.modelName} &nbsp;|&nbsp; {selectedVehicle.engine.code} {selectedVehicle.engine.displacement} &nbsp;|&nbsp; {selectedVehicle.engine.stockHp} כ&quot;ס / {selectedVehicle.engine.stockTorque} Nm
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="mb-lg w-full flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-dashed border-primary-container/50 rounded p-md text-right hover:border-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-primary-container">directions_car</span>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-primary-container uppercase">בחר רכב</p>
              <p className="font-body-md text-body-md text-secondary">
                בחר את הרכב שלך כדי לראות התאמה מדויקת ומדדי ביצועים. ניתן לדפדף בקטגוריות גם בלי לבחור רכב.
              </p>
            </div>
          </button>
        )}

        {/* Most-popular parts — hidden when no garage data exists */}
        {popular.length > 0 && (
          <section className="mb-xl">
            <div className="text-right mb-md">
              <h2 className="font-h2 text-h2 text-on-background">🔥 הכי פופולרי</h2>
              <p className="font-body-md text-body-md text-secondary mt-xs">החלפים שהכי הרבה טיונרים מוסיפים לגראז&apos;</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {popular.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/catalog/${p.id}`)}
                  className="flex flex-row-reverse items-center gap-md bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg p-md text-right hover:border-[#FF6B00] hover:bg-[#252525] transition-colors"
                >
                  <img
                    src={p.imageUrl}
                    alt={`תמונת ${p.name}`}
                    className="w-14 h-14 shrink-0 rounded-full object-cover bg-[#121212] border border-[#2D2D2D]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body-md text-body-md font-bold text-on-surface truncate" dir="ltr">{p.name}</h3>
                    <p className="font-mono-data text-[11px] text-secondary">{p.categoryName}</p>
                  </div>
                  <span className="shrink-0 font-mono-data text-[11px] text-[#FF6B00] whitespace-nowrap">🔧 {p.count} טיונרים מתקינים</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Page Header */}
        <header className="mb-lg text-right">
          <h2 className="font-h1 text-h1 text-on-background">קטגוריות שיפורים</h2>
          <p className="font-body-lg text-body-lg text-tertiary-container mt-xs">
            בחר מערכת לשדרוגי ביצועים ונתוני דיאגנוסטיקה.
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
              נסה שוב
            </button>
          </div>
        )}

        {/* Category Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                title={cat.name}
                subtitle={cat.slug.toUpperCase()}
                itemCount={
                  selectedVehicle && compatCounts
                    ? `${compatCounts[cat.slug] ?? 0} חלפים מתאימים ל-${selectedVehicle.modelName}`
                    : cat.description
                }
                imageSrc={CATEGORY_IMAGES[cat.slug] ?? DEFAULT_IMG}
                onClick={() => navigate(`/catalog/category/${cat.slug}`)}
              />
            ))}
          </div>
        )}

        {/* Legal disclaimer footer */}
        <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed text-center border-t border-[#2D2D2D] pt-md mt-xl" dir="rtl">
          * חלפים המסומנים &apos;למסלול בלבד&apos; אינם מאושרים לשימוש בכביש ציבורי בישראל.
          WrenchLogic מציגה מידע טכני בלבד ואינה אחראית לשימוש, התקנה או חוקיות.
          תמיד בדוק עם טכנאי מוסמך לפני התקנה.
        </p>

      </div>
    </main>
  );
}