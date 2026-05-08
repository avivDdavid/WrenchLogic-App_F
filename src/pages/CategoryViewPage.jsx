import { useNavigate, useParams, Link } from 'react-router-dom';
import partsData from '../data/parts.json';

const CATEGORY_LABELS = {
  induction: 'נשימה — Induction',
  ecu:       'תוכנה — ECU Tuning',
  cooling:   'קירור — Cooling',
  brakes:    'בלמים — Braking',
  engine:    'מנוע — Engine',
  body:      'גוף — Body / Aero',
};

const CATEGORY_ICONS = {
  induction: 'air',
  ecu:       'memory',
  cooling:   'ac_unit',
  brakes:    'disc_full',
  engine:    'settings',
  body:      'directions_car',
};

export default function CategoryViewPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const parts = partsData.filter(p => p.category === categoryId);
  const categoryLabel = CATEGORY_LABELS[categoryId] ?? categoryId;
  const categoryIcon  = CATEGORY_ICONS[categoryId]  ?? 'build';

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-5xl mx-auto space-y-lg">

        {/* Back + Header */}
        <div>
          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-xs text-secondary hover:text-primary-container transition-colors mb-md font-label-caps text-label-caps"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            חזרה לקטלוג
          </button>

          <div className="flex flex-row-reverse items-center gap-md border-b border-[#2D2D2D] pb-md">
            <span className="material-symbols-outlined text-primary-container text-[32px]">{categoryIcon}</span>
            <div className="text-right">
              <h1 className="font-h1 text-h1 text-on-surface">{categoryLabel}</h1>
              <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
                {parts.length} חלקים זמינים
              </p>
            </div>
          </div>
        </div>

        {/* Parts List */}
        {parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-md">
            <span className="material-symbols-outlined text-[72px] text-[#2D2D2D]">inventory_2</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">אין חלקים בקטגוריה זו</h2>
              <p className="font-body-md text-body-md text-secondary">
                עדיין לא הוספנו חלקים לקטגוריה זו. חזור בקרוב.
              </p>
            </div>
            <button
              onClick={() => navigate('/catalog')}
              className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors"
            >
              חזור לקטלוג
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {parts.map(part => (
              <div
                key={part.id}
                className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden hover:border-primary-container transition-colors group"
              >
                {/* Part Image */}
                <div className="h-40 overflow-hidden bg-[#121212]">
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Part Info */}
                <div className="p-md space-y-sm">
                  <div className="text-right">
                    <h3 className="font-h2 text-h2 text-on-surface" dir="ltr">{part.name}</h3>
                    <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">
                      {categoryLabel.split(' — ')[1] ?? categoryLabel}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-row-reverse gap-sm">
                    <span className="font-mono-data text-sm bg-primary-container/10 text-primary-container border border-primary-container/30 px-sm py-base rounded">
                      {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                    </span>
                    <span className="font-mono-data text-sm bg-[#2D2D2D] text-secondary px-sm py-base rounded">
                      {part.torqueGain > 0 ? `+${part.torqueGain} Nm` : '—'}
                    </span>
                  </div>

                  <Link
                    to={`/catalog/${part.id}`}
                    className="flex items-center justify-center gap-xs w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-sm rounded hover:opacity-90 transition-opacity"
                  >
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