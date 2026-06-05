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

  return (
    <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">

        {/* Landing intro — energetic hero */}
        <section className="mb-xl text-right bg-[#1A1A1A] border-l-4 border-[#FF6B00] rounded-lg p-6 md:p-8">
          <h1 className="font-h1 text-h1 font-black text-[#FF6B00] leading-tight">
            WrenchLogic — כי הרכב שלך לא נולד להיות stock 🔥
          </h1>
          <p className="font-h2 text-h2 text-on-background mt-sm">
            מצא את השדרוג הבא שלך. השווה חלקים. תכנן את הבנייה.
          </p>
          <p className="font-body-lg text-body-lg text-secondary mt-md max-w-3xl mr-auto">
            בין אם אתה על Golf GTI, Civic Type R או i30 N — כאן תמצא את כל מה שצריך כדי לדחוף
            את הרכב שלך לשלב הבא. בלי בולשיט, בלי ניחושים — רק נתונים.
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
                itemCount={cat.description}
                imageSrc={CATEGORY_IMAGES[cat.slug] ?? DEFAULT_IMG}
                onClick={() => navigate(`/catalog/category/${cat.slug}`)}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}