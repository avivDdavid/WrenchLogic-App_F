import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

// Normalize Supabase part row → local shape
const normalizePart = (p) => ({
  id:          p.id,
  name:        p.name,
  hpGain:      p.hp_gain      ?? 0,
  torqueGain:  p.torque_gain_nm ?? 0,
  imageUrl:    p.image_url    ?? '',
  difficulty:  p.difficulty,
  isLegal:     p.is_legal,
  createdAt:   p.created_at,
});

export default function CategoryViewPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams(); // this is the slug

  const [category, setCategory] = useState(null);
  const [parts,    setParts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [installCounts, setInstallCounts] = useState({});

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

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-5xl mx-auto space-y-lg">

        {/* Back + Header */}
        <div>
          <button onClick={() => navigate('/catalog')} className="flex items-center gap-xs text-secondary hover:text-primary-container transition-colors mb-md font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            חזרה לקטלוג
          </button>

          <div className="flex flex-row-reverse items-center gap-md border-b border-[#2D2D2D] pb-md">
            <span className="material-symbols-outlined text-primary-container text-[32px]">{categoryIcon}</span>
            <div className="text-right">
              <h1 className="font-h1 text-h1 text-on-surface">{category.name}</h1>
              <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
                {parts.length} חלקים זמינים
              </p>
            </div>
          </div>
        </div>

        {/* Parts */}
        {parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-md">
            <span className="material-symbols-outlined text-[72px] text-[#2D2D2D]">inventory_2</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">אין חלקים בקטגוריה זו</h2>
              <p className="font-body-md text-body-md text-secondary">עדיין לא הוספנו חלקים לקטגוריה זו. חזור בקרוב.</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
              חזור לקטלוג
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {parts.map(part => (
              <div key={part.id} className="relative bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden hover:border-primary-container transition-colors group">
                {/* Social proof badge */}
                <span className="absolute top-2 right-2 z-10 bg-[#1E1E1E]/85 backdrop-blur-sm border border-[#2D2D2D] text-[#C8C6C5] text-xs px-2 py-1 rounded-full">
                  {installLabel(installCounts[part.id] ?? 0)}
                </span>
                {/* "New" badge — top-left corner */}
                <NewBadge createdAt={part.createdAt} className="absolute top-2 left-2 z-10" />
                <div className="h-40 overflow-hidden bg-[#121212]">
                  <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
                </div>
                <div className="p-md space-y-sm">
                  <div className="text-right">
                    <h3 className="font-h2 text-h2 text-on-surface" dir="ltr">{part.name}</h3>
                    <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">{category.slug.toUpperCase()}</p>
                  </div>
                  <div className="flex flex-row-reverse gap-sm">
                    <span className="font-mono-data text-sm bg-primary-container/10 text-primary-container border border-primary-container/30 px-sm py-base rounded">
                      {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                    </span>
                    <span className="font-mono-data text-sm bg-[#2D2D2D] text-secondary px-sm py-base rounded">
                      {part.torqueGain > 0 ? `+${part.torqueGain} Nm` : '—'}
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

      </div>
    </main>
  );
}