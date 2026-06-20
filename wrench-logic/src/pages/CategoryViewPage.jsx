import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useVehicle } from '../context/VehicleContext';
import { useTheme } from '../context/ThemeContext';
import { partName, partDesc } from '../lib/displayNames';
import { fetchInstallCounts, installLabel } from '../lib/installCounts';
import NewBadge from '../components/NewBadge';

const CATEGORY_ICONS = {
  induction: 'air', intake: 'air',
  ecu:       'memory',
  cooling:   'ac_unit',
  brakes:    'disc_full',
  engine:    'settings',
  exhaust:   'local_fire_department',
  body:      'directions_car',
};

// Bilingual category names, keyed by slug (DB rows are Hebrew-only).
const CATEGORY_NAMES = {
  engine:     { he: 'מנוע',          en: 'Engine' },
  intake:     { he: 'יניקה',         en: 'Intake' },
  exhaust:    { he: 'פליטה',         en: 'Exhaust' },
  brakes:     { he: 'בלמים',         en: 'Brakes' },
  suspension: { he: 'מתלים',         en: 'Suspension' },
  boost:      { he: 'בוסט',          en: 'Boost' },
  wheels:     { he: 'גלגלים וצמיגים', en: 'Wheels & Tires' },
  weight:     { he: 'הפחתת משקל',    en: 'Weight Reduction' },
  interior:   { he: 'פנים ואריזה',   en: 'Interior' },
  software:   { he: 'תוכנה',         en: 'Software' },
  cooling:    { he: 'צינון',         en: 'Cooling' },
  fuel:       { he: 'דלק',           en: 'Fuel' },
};
const categoryName = (slug, lang, fallback) =>
  CATEGORY_NAMES[slug]?.[lang] ?? fallback ?? slug;

// Short bilingual intro shown under the category title explaining what the
// category is and what parts can be found in it. Keyed by category slug.
const CATEGORY_INTRO = {
  boost: {
    he: 'מערכת ההזנה בלחץ (טורבו/סופרצ׳רג׳ר) דוחפת יותר אוויר למנוע ומגדילה משמעותית את ההספק. כאן תמצאו טורבו, אינטרקולרים ושדרוגי לחץ שמהווים את הקפיצה הגדולה ביותר בכוח.',
    en: 'Forced induction (turbo/supercharger) pushes more air into the engine for a major power increase. Here you will find turbos, intercoolers and boost upgrades that deliver the biggest power gains.'
  },
  brakes: {
    he: 'בלמים הם רכיב הבטיחות הקריטי ביותר בשדרוג רכב מהיר יותר. כאן תמצאו רפידות, דיסקיות וצינורות שמשפרים עצירה, עמידות בחום ותחושת דוושה.',
    en: 'Brakes are the most critical safety component when making a car faster. Here you will find pads, rotors and lines that improve stopping power, heat resistance and pedal feel.'
  },
  engine: {
    he: 'לב הרכב. שדרוגי מנוע פנימיים מחזקים את היכולת להחזיק הספק גבוה ולהעלות סל״ד בבטחה. כאן תמצאו גל זיזים, שסתומים ורכיבים מחוזקים.',
    en: 'The heart of the car. Internal engine upgrades strengthen its ability to hold high power and rev safely. Here you will find camshafts, valves and reinforced components.'
  },
  exhaust: {
    he: 'מערכת הפליטה משחררת את גזי השריפה ביעילות, משפרת נשימה, הספק וסאונד. כאן תמצאו מערכות פליטה, דאון-פייפים וסעפות.',
    en: 'The exhaust system releases combustion gases efficiently, improving breathing, power and sound. Here you will find exhaust systems, downpipes and manifolds.'
  },
  intake: {
    he: 'מערכת היניקה מספקת למנוע אוויר קר ונקי לשריפה יעילה יותר. כאן תמצאו כונסי אוויר, מסננים וסעפות יניקה שמשפרים תגובה והספק.',
    en: 'The intake system feeds the engine cool, clean air for more efficient combustion. Here you will find air intakes, filters and intake manifolds that improve response and power.'
  },
  interior: {
    he: 'הוסף טאצ׳ אישי לפנים הרכב. כאן תמצאו מושבים, הגאים, ידיות הילוכים ושדרוגים שהופכים את תא הנהג לנעים, ספורטיבי ואישי יותר.',
    en: 'Add a personal touch to your car interior. Here you will find seats, steering wheels, shifters and upgrades that make the cockpit more comfortable, sporty and personal.'
  },
  suspension: {
    he: 'מערכת המתלים קובעת כיצד הרכב נצמד לכביש ומתנהג בפניות. כאן תמצאו קפיצים, בולמים ומוטות מייצבים שמשפרים אחיזה ויציבות.',
    en: 'The suspension determines how the car grips the road and behaves in corners. Here you will find springs, dampers and sway bars that improve grip and stability.'
  },
  weight: {
    he: 'הפחתת משקל היא הדרך הזולה ביותר לשפר כל היבט בביצועים: האצה, בלימה וכניסה לפניות. כאן תמצאו רכיבים קלי משקל שמורידים קילוגרמים.',
    en: 'Weight reduction is the cheapest way to improve every aspect of performance: acceleration, braking and cornering. Here you will find lightweight components that shed kilos.'
  },
  wheels: {
    he: 'גלגלים וצמיגים הם נקודת המגע היחידה עם הכביש. כאן תמצאו חישוקים וצמיגים שמשפרים אחיזה, תגובה ומראה.',
    en: 'Wheels and tires are the only contact point with the road. Here you will find rims and tires that improve grip, response and looks.'
  }
};

const DIFFICULTY_OPTIONS = [
  { value: 'all',    he: 'הכל',     en: 'All' },
  { value: 'easy',   he: 'קל 🟢',   en: 'Easy 🟢' },
  { value: 'medium', he: 'בינוני 🟠', en: 'Medium 🟠' },
  { value: 'expert', he: 'מומחה 🔴', en: 'Expert 🔴' },
];

const SORT_OPTIONS = [
  { value: 'default',    he: 'ברירת מחדל',        en: 'Default' },
  { value: 'hp_desc',    he: 'הספק גבוה → נמוך',   en: 'Power: high → low' },
  { value: 'hp_asc',     he: 'הספק נמוך → גבוה',   en: 'Power: low → high' },
  { value: 'difficulty', he: 'קושי: קל → מומחה',   en: 'Difficulty: easy → expert' },
  { value: 'price_asc',  he: 'מחיר: נמוך → גבוה',  en: 'Price: low → high' },
  { value: 'price_desc', he: 'מחיר: גבוה → נמוך',  en: 'Price: high → low' },
  { value: 'newest',     he: 'חדש קודם',          en: 'Newest first' },
];

const DIFFICULTY_ORDER = { easy: 0, medium: 1, expert: 2 };

const T = {
  he: {
    notFound: 'הקטגוריה לא נמצאה',
    loadError: 'שגיאה בטעינת החלקים — ',
    backToCategories: 'חזרה לקטלוג',
    partsAvailable: (n) => `${n} חלקים זמינים`,
    difficulty: 'קושי:',
    legality: 'חוקיות:',
    all: 'הכל',
    legalOnly: 'חוקי בלבד ✓',
    sort: 'מיון:',
    showing: 'מציג',
    outOf: 'מתוך',
    partsWord: 'חלפים',
    clearFilters: 'נקה פילטרים ✕',
    noFitTitle: (m) => `אין חלפים מתאימים ל-${m} בקטגוריה זו`,
    noPartsTitle: 'אין חלקים בקטגוריה זו',
    noPartsSub: 'עדיין לא הוספנו חלקים מתאימים לקטגוריה זו. חזור בקרוב.',
    backToCatalog: 'חזור לקטלוג',
    noFilterTitle: 'לא נמצאו חלפים לפי הפילטר הנוכחי',
    noFilterSub: 'נסה לשנות את הפילטרים כדי לראות יותר תוצאות.',
    clearFiltersShort: 'נקה פילטרים',
    fits: 'מתאים לרכב שלך ✓',
    easy: 'קל 🟢', medium: 'בינוני 🟠', expert: 'מומחה 🔴',
    trackOnly: '⚠ למסלול בלבד',
    kg: 'ק"ג',
    kgVsStock: 'ק"ג ביחס לסטוק*',
    stockNote: '* סטוק = החלק המקורי שהגיע מהיצרן',
    priceOnRequest: 'מחיר לפי פנייה',
    viewDetails: 'צפה בפרטים',
    fitsMyCar: 'האם יתאים לרכב שלי?',
    disclaimer: '* חלפים המסומנים \'למסלול בלבד\' אינם מאושרים לשימוש בכביש ציבורי בישראל. WrenchLogic מציגה מידע טכני בלבד ואינה אחראית לשימוש, התקנה או חוקיות. תמיד בדוק עם טכנאי מוסמך לפני התקנה.',
  },
  en: {
    notFound: 'Category not found',
    loadError: 'Error loading parts — ',
    backToCategories: 'Back to Categories',
    partsAvailable: (n) => `${n} parts available`,
    difficulty: 'Difficulty:',
    legality: 'Legality:',
    all: 'All',
    legalOnly: 'Street legal ✓',
    sort: 'Sort:',
    showing: 'Showing',
    outOf: 'of',
    partsWord: 'parts',
    clearFilters: 'Clear filters ✕',
    noFitTitle: (m) => `No compatible parts for ${m} in this category`,
    noPartsTitle: 'No parts in this category',
    noPartsSub: 'We haven\'t added matching parts to this category yet. Check back soon.',
    backToCatalog: 'Back to Catalog',
    noFilterTitle: 'No parts match the current filter',
    noFilterSub: 'Try changing the filters to see more results.',
    clearFiltersShort: 'Clear filters',
    fits: 'Fits your car ✓',
    easy: 'Easy 🟢', medium: 'Medium 🟠', expert: 'Expert 🔴',
    trackOnly: '⚠ Track only',
    kg: 'kg',
    kgVsStock: 'kg vs stock*',
    stockNote: '* Stock = the original factory part',
    priceOnRequest: 'Price on request',
    viewDetails: 'View Details',
    fitsMyCar: 'Will it fit my car?',
    disclaimer: '* Parts marked \'track only\' are not approved for use on public roads in Israel. WrenchLogic provides technical information only and is not responsible for use, installation or legality. Always consult a certified technician before installation.',
  },
};

// Normalize Supabase part row → local shape
const normalizePart = (p) => ({
  id:          p.id,
  name:        p.name,
  name_en:     p.name_en ?? null,
  hpGain:      p.hp_gain      ?? 0,
  torqueGain:  p.torque_gain_nm ?? 0,
  weightChange: p.weight_change_kg ?? 0,
  imageUrl:    p.image_url    ?? '',
  description: p.description  ?? '',
  description_en: p.description_en ?? null,
  difficulty:  p.difficulty,
  isLegal:     p.is_legal,
  createdAt:   p.created_at,
  priceIls:    p.price_ils ?? null,
  compatibleModels: p.compatible_models ?? null, // null = universal
});

export default function CategoryViewPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams(); // this is the slug
  const { selectedVehicle } = useVehicle();
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';
  const modelId = selectedVehicle?.modelId ?? null;

  // Format an ILS price → "₪3,200" or fallback text when missing.
  const formatPrice = (price) =>
    price == null ? t.priceOnRequest : `₪${price.toLocaleString('en-US')}`;

  // A part fits the selected model if it's universal (null) or lists the model.
  const fitsVehicle = (part) =>
    !modelId || part.compatibleModels == null || part.compatibleModels.includes(modelId);
  // Exact fit = a model-specific part that explicitly lists the selected model.
  const isExactFit = (part) =>
    !!modelId && Array.isArray(part.compatibleModels) && part.compatibleModels.includes(modelId);

  const [category, setCategory] = useState(null);
  const [parts,    setParts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [installCounts, setInstallCounts] = useState({});

  // Filter / sort state (local only)
  const [difficultyFilter, setDifficultyFilter] = useState(['all']); // multi-select
  const [legalOnly, setLegalOnly]               = useState(false);
  const [sortBy,    setSortBy]                  = useState('default');

  // Social proof — ONE read on page load for all parts' install counts.
  useEffect(() => { fetchInstallCounts().then(setInstallCounts); }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1. Get category by slug
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .eq('slug', categoryId)
        .single();

      if (catErr || !catData) {
        setError(T[lang]?.notFound || T.he.notFound);
        setLoading(false);
        return;
      }
      setCategory(catData);

      // 2. Get parts for this category
      const { data: partsData, error: partsErr } = await supabase
        .from('parts')
        .select('*')
        .eq('category_id', catData.id);

      if (partsErr) {
        setError((T[lang]?.loadError || T.he.loadError) + partsErr.message);
      } else {
        setParts((partsData ?? []).map(normalizePart));
      }
      setLoading(false);
    };

    fetchData();
  }, [categoryId, lang]);

  const categoryIcon = CATEGORY_ICONS[categoryId] ?? 'build';

  // When a vehicle is selected, hide model-specific parts that don't fit it.
  const vehicleFilteredParts = parts.filter(fitsVehicle);

  // Apply difficulty filter, legality filter, and sort
  const displayedParts = useMemo(() => {
    let result = [...vehicleFilteredParts];

    // Difficulty filter
    if (!difficultyFilter.includes('all') && difficultyFilter.length > 0) {
      result = result.filter(p => difficultyFilter.includes(p.difficulty));
    }

    // Legality filter
    if (legalOnly) {
      result = result.filter(p => p.isLegal === true);
    }

    // Sort
    switch (sortBy) {
      case 'hp_desc':
        result.sort((a, b) => b.hpGain - a.hpGain);
        break;
      case 'hp_asc':
        result.sort((a, b) => a.hpGain - b.hpGain);
        break;
      case 'difficulty':
        result.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99));
        break;
      case 'price_asc':
        // Parts without a price sort to the end.
        result.sort((a, b) => (a.priceIls ?? Infinity) - (b.priceIls ?? Infinity));
        break;
      case 'price_desc':
        // Parts without a price sort to the end.
        result.sort((a, b) => (b.priceIls ?? -Infinity) - (a.priceIls ?? -Infinity));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return result;
  }, [vehicleFilteredParts, difficultyFilter, legalOnly, sortBy]);

  // Toggle a difficulty chip (supports multi-select; "All" clears others)
  const toggleDifficulty = (value) => {
    if (value === 'all') {
      setDifficultyFilter(['all']);
      return;
    }
    setDifficultyFilter(prev => {
      const without = prev.filter(v => v !== 'all');
      if (without.includes(value)) {
        const next = without.filter(v => v !== value);
        return next.length === 0 ? ['all'] : next;
      }
      return [...without, value];
    });
  };

  // ── Loading ──
  if (loading) return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined text-primary-container text-[56px] animate-spin">progress_activity</span>
    </main>
  );

  // ── Error ──
  if (error) return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-md">
        <span className="material-symbols-outlined text-[56px] text-red-500">cloud_off</span>
        <p className="font-h2 text-h2 text-on-surface">{error}</p>
        <button onClick={() => navigate('/catalog')} className="border border-primary-container text-primary-container font-label-caps text-label-caps px-6 py-3 rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
          {t.backToCatalog}
        </button>
      </div>
    </main>
  );

  const hasActiveFilters = !difficultyFilter.includes('all') || legalOnly;

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-5xl mx-auto space-y-lg">

        {/* Back + Header */}
        <div>
          <button onClick={() => navigate('/catalog')} className="inline-flex items-center gap-2 mb-md font-label-caps text-label-caps border border-[#FF6B00] text-[#FF6B00] px-4 py-2.5 rounded hover:bg-[#FF6B00] hover:text-white transition-colors duration-200">
            <span>{isHe ? '←' : '→'}</span>
            {t.backToCategories}
          </button>

          <div className="flex flex-row-reverse items-center gap-md border-b border-[#2D2D2D] pb-md">
            <span className="material-symbols-outlined text-primary-container text-[32px]">{categoryIcon}</span>
            <div className="text-right">
              <h1 className="font-h1 text-h1 text-on-surface">{categoryName(category.slug, lang, category.name)}</h1>
              <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
                {t.partsAvailable(parts.length)}
              </p>
            </div>
          </div>

          {/* Category intro — short explanation card with an orange accent bar.
              Direction + alignment follow the active language (LTR for EN). */}
          {CATEGORY_INTRO[category.slug]?.[lang] && (
            <div
              dir={isHe ? 'rtl' : 'ltr'}
              style={{ borderInlineStartWidth: '4px', borderInlineStartColor: '#FF6B00' }}
              className={`bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-md max-w-3xl mt-md ${isHe ? 'text-right' : 'text-left'}`}
            >
              <p className="font-body-md text-[14px] leading-relaxed text-secondary">
                {CATEGORY_INTRO[category.slug][lang]}
              </p>
            </div>
          )}
        </div>

        {/* ── Filter & Sort Bar ── */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-md space-y-md" dir={isHe ? 'rtl' : 'ltr'}>

          {/* Row 1: Difficulty chips + Legal toggle */}
          <div className="flex flex-wrap items-center gap-sm justify-between">

            {/* Difficulty multi-select */}
            <div className="flex flex-wrap items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary ml-xs">{t.difficulty}</span>
              {DIFFICULTY_OPTIONS.map(opt => {
                const active = difficultyFilter.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleDifficulty(opt.value)}
                    className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                      active
                        ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                        : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                    }`}
                  >
                    {opt[lang]}
                  </button>
                );
              })}
            </div>

            {/* Legality toggle */}
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary">{t.legality}</span>
              <button
                onClick={() => setLegalOnly(false)}
                className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                  !legalOnly
                    ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                    : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setLegalOnly(true)}
                className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                  legalOnly
                    ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                    : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                }`}
              >
                {t.legalOnly}
              </button>
            </div>
          </div>

          {/* Row 2: Sort + count */}
          <div className="flex flex-wrap items-center justify-between gap-sm">

            {/* Sort dropdown */}
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary">{t.sort}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#2D2D2D] border border-[#3D3D3D] text-on-surface font-label-caps text-[11px] px-3 py-1.5 rounded focus:border-primary-container focus:outline-none cursor-pointer"
                dir={isHe ? 'rtl' : 'ltr'}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt[lang]}</option>
                ))}
              </select>
            </div>

            {/* Count + reset */}
            <div className="flex items-center gap-sm">
              <span className="font-mono-data text-[11px] text-secondary">
                {t.showing}{' '}
                <span className={displayedParts.length < vehicleFilteredParts.length ? 'text-primary-container font-semibold' : 'text-on-surface'}>
                  {displayedParts.length}
                </span>
                {' '}{t.outOf}{' '}
                <span className="text-on-surface">{vehicleFilteredParts.length}</span>
                {' '}{t.partsWord}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={() => { setDifficultyFilter(['all']); setLegalOnly(false); }}
                  className="font-label-caps text-[11px] text-secondary hover:text-primary-container transition-colors border border-[#3D3D3D] hover:border-primary-container px-2 py-1 rounded"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Parts */}
        {vehicleFilteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-md">
            <span className="material-symbols-outlined text-[72px] text-[#2D2D2D]">inventory_2</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">
                {selectedVehicle ? t.noFitTitle(selectedVehicle.modelName) : t.noPartsTitle}
              </h2>
              <p className="font-body-md text-body-md text-secondary">{t.noPartsSub}</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
              {t.backToCatalog}
            </button>
          </div>
        ) : displayedParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-md">
            <span className="material-symbols-outlined text-[72px] text-[#2D2D2D]">filter_alt_off</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">{t.noFilterTitle}</h2>
              <p className="font-body-md text-body-md text-secondary">{t.noFilterSub}</p>
            </div>
            <button
              onClick={() => { setDifficultyFilter(['all']); setLegalOnly(false); }}
              className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors"
            >
              {t.clearFiltersShort}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {displayedParts.map(part => (
              <div key={part.id} onClick={() => navigate(`/catalog/${part.id}`)} style={{ cursor: 'pointer' }} className="relative bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden hover:border-primary-container transition-colors group">
                {/* Social proof badge — hidden when nobody installed yet */}
                {(installCounts[part.id] ?? 0) > 0 && (
                  <span className="absolute top-2 right-2 z-10 bg-[#1E1E1E]/85 backdrop-blur-sm border border-[#2D2D2D] text-[#C8C6C5] text-xs px-2 py-1 rounded-full">
                    {installLabel(installCounts[part.id], lang)}
                  </span>
                )}
                {/* "New" badge — top-left corner */}
                <NewBadge createdAt={part.createdAt} className="absolute top-2 left-2 z-10" />
                <div className="h-40 overflow-hidden bg-[#121212]">
                  <img src={part.imageUrl || '/images/parts/part.png'} alt={partName(part, lang)} onError={(e) => { e.target.onerror = null; e.target.src = '/images/parts/part.png'; }} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
                </div>
                <div className="p-md space-y-sm">
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-xs">
                    {isExactFit(part) && (
                      <span className="inline-flex items-center gap-1 bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/40 font-label-caps text-[11px] px-2 py-1 rounded-full">
                        {t.fits}
                      </span>
                    )}
                    {part.difficulty === 'easy'   && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-700/40">{t.easy}</span>}
                    {part.difficulty === 'medium' && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400 border border-orange-700/40">{t.medium}</span>}
                    {part.difficulty === 'expert' && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">{t.expert}</span>}
                    {part.isLegal === false && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-[#7F1D1D] text-white">{t.trackOnly}</span>}
                  </div>
                  <div className="text-right">
                    <h3 className="font-h2 text-h2 text-on-surface" dir={isHe ? 'rtl' : 'ltr'}>{partName(part, lang)}</h3>
                    <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">{category.slug.toUpperCase()}</p>
                    {partDesc(part, lang) && (
                      <p className="font-body-md text-[13px] text-[#c8c6c5] leading-snug mt-2 line-clamp-2" dir={isHe ? 'rtl' : 'ltr'}>
                        {partDesc(part, lang)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-row-reverse items-center justify-between gap-sm">
                    <div className="flex flex-row-reverse gap-sm">
                      <span className="font-mono-data text-sm bg-primary-container/10 text-primary-container border border-primary-container/30 px-sm py-base rounded">
                        {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                      </span>
                      <span className="font-mono-data text-sm bg-[#2D2D2D] text-secondary px-sm py-base rounded">
                        {part.torqueGain > 0 ? `+${part.torqueGain} Nm` : '—'}
                      </span>
                      {part.weightChange < 0 && (
                        <span className="font-mono-data text-sm bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-sm py-base rounded whitespace-nowrap">
                          {part.weightChange} {t.kgVsStock}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono-data ${part.priceIls == null ? 'text-[12px] text-secondary' : 'text-sm text-white font-medium'}`} dir="ltr">
                      {formatPrice(part.priceIls)}
                    </span>
                  </div>
                  <Link to={`/catalog/${part.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-xs w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-sm rounded hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    {t.viewDetails}
                  </Link>
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
              </div>
            ))}
          </div>
        )}

        {/* Stock footnote — shown once when a weight-reduction part is displayed */}
        {displayedParts.some(p => p.weightChange < 0) && (
          <p className="font-mono-data text-[11px] text-[#6B6B6B] text-center" dir={isHe ? 'rtl' : 'ltr'}>
            {t.stockNote}
          </p>
        )}

        {/* Legal disclaimer footer */}
        <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed text-center border-t border-[#2D2D2D] pt-md mt-lg" dir={isHe ? 'rtl' : 'ltr'}>
          {t.disclaimer}
        </p>

      </div>
    </main>
  );
}
