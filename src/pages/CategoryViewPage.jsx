import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useVehicle } from '../context/VehicleContext';
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

const DIFFICULTY_OPTIONS = [
  { value: 'all',    label: 'הכל' },
  { value: 'easy',   label: 'קל 🟢' },
  { value: 'medium', label: 'בינוני 🟠' },
  { value: 'expert', label: 'מומחה 🔴' },
];

const SORT_OPTIONS = [
  { value: 'default',      label: 'ברירת מחדל' },
  { value: 'hp_desc',      label: 'הספק גבוה → נמוך' },
  { value: 'hp_asc',       label: 'הספק נמוך → גבוה' },
  { value: 'difficulty',   label: 'קושי: קל → מומחה' },
  { value: 'price_asc',    label: 'מחיר: נמוך → גבוה' },
  { value: 'price_desc',   label: 'מחיר: גבוה → נמוך' },
  { value: 'newest',       label: 'חדש קודם' },
];

const DIFFICULTY_ORDER = { easy: 0, medium: 1, expert: 2 };

// Normalize Supabase part row → local shape
const normalizePart = (p) => ({
  id:          p.id,
  name:        p.name,
  hpGain:      p.hp_gain      ?? 0,
  torqueGain:  p.torque_gain_nm ?? 0,
  imageUrl:    p.image_url    ?? '',
  description: p.description  ?? '',
  difficulty:  p.difficulty,
  isLegal:     p.is_legal,
  createdAt:   p.created_at,
  priceIls:    p.price_ils ?? null,
  compatibleModels: p.compatible_models ?? null, // null = universal
});

// Format an ILS price → "₪3,200" or fallback text when missing.
const formatPrice = (price) =>
  price == null ? 'מחיר לפי פנייה' : `₪${price.toLocaleString('en-US')}`;

export default function CategoryViewPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams(); // this is the slug
  const { selectedVehicle } = useVehicle();
  const modelId = selectedVehicle?.modelId ?? null;

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
        setError('הקטגוריה לא נמצאה');
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
        setError('שגיאה בטעינת החלקים — ' + partsErr.message);
      } else {
        setParts((partsData ?? []).map(normalizePart));
      }
      setLoading(false);
    };

    fetchData();
  }, [categoryId]);

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

  // Toggle a difficulty chip (supports multi-select; "הכל" clears others)
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
          חזור לקטלוג
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
            <span>←</span>
            חזרה לקטלוג
          </button>

          <div className="flex flex-row-reverse items-center gap-md border-b border-[#2D2D2D] pb-md">
            <span className="material-symbols-outlined text-primary-container text-[32px]">{categoryIcon}</span>
            <div className="text-right">
              <h1 className="font-h1 text-h1 text-on-surface">{category.name}</h1>
              <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
                {selectedVehicle
                  ? `${vehicleFilteredParts.length} חלפים מתאימים ל-${selectedVehicle.modelName}`
                  : `${parts.length} חלקים זמינים`}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle-fit summary — only when a vehicle is selected */}
        {selectedVehicle && (
          <p className="font-mono-data text-[12px] text-[#FF6B00] text-right" dir="rtl">
            ✓ {vehicleFilteredParts.length} חלפים מתאימים ל-{selectedVehicle.modelName} מתוך {parts.length} חלפים בקטגוריה
          </p>
        )}

        {/* ── Filter & Sort Bar ── */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-md space-y-md" dir="rtl">

          {/* Row 1: Difficulty chips + Legal toggle */}
          <div className="flex flex-wrap items-center gap-sm justify-between">

            {/* Difficulty multi-select */}
            <div className="flex flex-wrap items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary ml-xs">קושי:</span>
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
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Legality toggle */}
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary">חוקיות:</span>
              <button
                onClick={() => setLegalOnly(false)}
                className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                  !legalOnly
                    ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                    : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                }`}
              >
                הכל
              </button>
              <button
                onClick={() => setLegalOnly(true)}
                className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                  legalOnly
                    ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                    : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                }`}
              >
                חוקי בלבד ✓
              </button>
            </div>
          </div>

          {/* Row 2: Sort + count */}
          <div className="flex flex-wrap items-center justify-between gap-sm">

            {/* Sort dropdown */}
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary">מיון:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#2D2D2D] border border-[#3D3D3D] text-on-surface font-label-caps text-[11px] px-3 py-1.5 rounded focus:border-primary-container focus:outline-none cursor-pointer"
                dir="rtl"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Count + reset */}
            <div className="flex items-center gap-sm">
              <span className="font-mono-data text-[11px] text-secondary">
                מציג{' '}
                <span className={displayedParts.length < vehicleFilteredParts.length ? 'text-primary-container font-semibold' : 'text-on-surface'}>
                  {displayedParts.length}
                </span>
                {' '}מתוך{' '}
                <span className="text-on-surface">{vehicleFilteredParts.length}</span>
                {' '}חלפים
              </span>
              {hasActiveFilters && (
                <button
                  onClick={() => { setDifficultyFilter(['all']); setLegalOnly(false); }}
                  className="font-label-caps text-[11px] text-secondary hover:text-primary-container transition-colors border border-[#3D3D3D] hover:border-primary-container px-2 py-1 rounded"
                >
                  נקה פילטרים ✕
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
                {selectedVehicle ? `אין חלפים מתאימים ל-${selectedVehicle.modelName} בקטגוריה זו` : 'אין חלקים בקטגוריה זו'}
              </h2>
              <p className="font-body-md text-body-md text-secondary">עדיין לא הוספנו חלקים מתאימים לקטגוריה זו. חזור בקרוב.</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
              חזור לקטלוג
            </button>
          </div>
        ) : displayedParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-md">
            <span className="material-symbols-outlined text-[72px] text-[#2D2D2D]">filter_alt_off</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">לא נמצאו חלפים לפי הפילטר הנוכחי</h2>
              <p className="font-body-md text-body-md text-secondary">נסה לשנות את הפילטרים כדי לראות יותר תוצאות.</p>
            </div>
            <button
              onClick={() => { setDifficultyFilter(['all']); setLegalOnly(false); }}
              className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors"
            >
              נקה פילטרים
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {displayedParts.map(part => (
              <div key={part.id} className="relative bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden hover:border-primary-container transition-colors group">
                {/* Social proof badge */}
                <span className="absolute top-2 right-2 z-10 bg-[#1E1E1E]/85 backdrop-blur-sm border border-[#2D2D2D] text-[#C8C6C5] text-xs px-2 py-1 rounded-full">
                  {installLabel(installCounts[part.id] ?? 0)}
                </span>
                {/* "New" badge — top-left corner */}
                <NewBadge createdAt={part.createdAt} className="absolute top-2 left-2 z-10" />
                <div className="h-40 overflow-hidden bg-[#121212]">
                  <img src={part.imageUrl} alt={`תמונת ${part.name}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
                </div>
                <div className="p-md space-y-sm">
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-xs">
                    {isExactFit(part) && (
                      <span className="inline-flex items-center gap-1 bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/40 font-label-caps text-[11px] px-2 py-1 rounded-full">
                        מתאים לרכב שלך ✓
                      </span>
                    )}
                    {part.difficulty === 'easy'   && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-700/40">קל 🟢</span>}
                    {part.difficulty === 'medium' && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400 border border-orange-700/40">בינוני 🟠</span>}
                    {part.difficulty === 'expert' && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">מומחה 🔴</span>}
                    {part.isLegal === false && <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-[#7F1D1D] text-white">⚠ למסלול בלבד</span>}
                  </div>
                  <div className="text-right">
                    <h3 className="font-h2 text-h2 text-on-surface" dir="ltr">{part.name}</h3>
                    <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">{category.slug.toUpperCase()}</p>
                    {part.description && (
                      <p className="font-body-md text-[13px] text-[#c8c6c5] leading-snug mt-2 line-clamp-2" dir="rtl">
                        {part.description}
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
                    </div>
                    <span className={`font-mono-data ${part.priceIls == null ? 'text-[12px] text-secondary' : 'text-sm text-white font-medium'}`} dir="ltr">
                      {formatPrice(part.priceIls)}
                    </span>
                  </div>
                  <Link to={`/catalog/${part.id}`} className="flex items-center justify-center gap-xs w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-sm rounded hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    צפה בפרטים
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legal disclaimer footer */}
        <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed text-center border-t border-[#2D2D2D] pt-md mt-lg" dir="rtl">
          * חלפים המסומנים &apos;למסלול בלבד&apos; אינם מאושרים לשימוש בכביש ציבורי בישראל.
          WrenchLogic מציגה מידע טכני בלבד ואינה אחראית לשימוש, התקנה או חוקיות.
          תמיד בדוק עם טכנאי מוסמך לפני התקנה.
        </p>

      </div>
    </main>
  );
}
