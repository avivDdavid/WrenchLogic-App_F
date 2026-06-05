import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Supabase parts row → local shape (matches GarageContext.addToGarage).
const normalizePart = (p) => ({
  id:         p.id,
  name:       p.name,
  category:   p.categories?.slug ?? '',
  hpGain:     p.hp_gain        ?? 0,
  torqueGain: p.torque_gain_nm ?? 0,
  imageUrl:   p.image_url      ?? '',
  difficulty: p.difficulty     ?? '',
});

const DIFFICULTY = {
  easy:   { label: 'קל',     color: 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/40' },
  medium: { label: 'בינוני', color: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/40' },
  expert: { label: 'מומחה',  color: 'bg-red-500/15 text-red-400 border-red-500/40' },
};

/**
 * NextStep — "🚀 הצעד הבא המומלץ עבורך"
 * Recommends up to 3 parts not yet in the garage, prioritising the same
 * categories as the user's INSTALLED parts, then sorted by hp_gain DESC.
 */
export default function NextStep({ installedParts, ownedIds, addToGarage }) {
  const navigate = useNavigate();
  const [allParts, setAllParts] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  // One read on page load — all parts, ready for recommendations.
  useEffect(() => {
    let active = true;
    supabase
      .from('parts')
      .select('*, categories(slug)')
      .order('hp_gain', { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        if (Array.isArray(data)) setAllParts(data.map(normalizePart));
        setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  const recommendations = useMemo(() => {
    const owned = new Set(ownedIds);
    const installedCats = new Set(installedParts.map(p => p.category));
    return allParts
      .filter(p => !owned.has(p.id))
      .sort((a, b) => {
        // Same category as something installed first…
        const aPri = installedCats.has(a.category) ? 1 : 0;
        const bPri = installedCats.has(b.category) ? 1 : 0;
        if (aPri !== bPri) return bPri - aPri;
        // …then by power gain.
        return b.hpGain - a.hpGain;
      })
      .slice(0, 3);
  }, [allParts, ownedIds, installedParts]);

  const garageEmpty = ownedIds.length === 0;
  const allOwned    = loaded && allParts.length > 0 && recommendations.length === 0;

  return (
    <section className="space-y-md">
      <div className="border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container">🚀 הצעד הבא המומלץ עבורך</h3>
        <p className="font-body-md text-body-md text-secondary mt-base">בהתבסס על הבנייה הנוכחית שלך</p>
      </div>

      {garageEmpty ? (
        <div className="bg-[#1E1E1E] border border-dashed border-[#2D2D2D] rounded-lg p-md md:p-lg text-center">
          <p className="font-body-lg text-body-lg text-secondary">
            התחל בהוספת חלף לגראז&apos; כדי לקבל המלצות מותאמות אישית
          </p>
        </div>
      ) : allOwned ? (
        <div className="bg-[#1E1E1E] border border-[#00C853]/30 rounded-lg p-md md:p-lg text-center">
          <p className="font-h2 text-h2 text-[#00C853]">
            🏆 כל החלפים הזמינים כבר בגראז&apos; שלך — קטלוג חדש בקרוב!
          </p>
        </div>
      ) : !loaded ? (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-primary-container text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {recommendations.map(part => {
            const diff = DIFFICULTY[part.difficulty] ?? { label: part.difficulty || '—', color: 'bg-[#2D2D2D] text-secondary border-[#2D2D2D]' };
            return (
              <div key={part.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-col gap-sm hover:border-primary-container transition-colors">
                {/* Name + category + difficulty */}
                <div className="flex items-start justify-between gap-sm">
                  <span className={`shrink-0 font-label-caps text-label-caps px-2 py-1 rounded-full border ${diff.color}`}>
                    {diff.label}
                  </span>
                  <div className="text-right min-w-0">
                    <h4 className="font-body-md text-body-md font-semibold text-on-surface truncate" dir="ltr">{part.name}</h4>
                    <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">{part.category}</p>
                  </div>
                </div>

                {/* Gains */}
                <div className="flex flex-row-reverse gap-sm">
                  <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded whitespace-nowrap">
                    +{part.hpGain} HP
                  </span>
                  <span className="font-mono-data text-sm text-secondary bg-[#2D2D2D] px-2 py-1 rounded whitespace-nowrap">
                    +{part.torqueGain} Nm
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-sm mt-auto pt-sm">
                  <button
                    onClick={() => addToGarage(part, 'planned')}
                    className="flex-1 flex items-center justify-center gap-xs bg-primary-container text-[#121212] font-label-caps text-label-caps py-2 rounded hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    הוסף לתכנון
                  </button>
                  <button
                    onClick={() => navigate(`/catalog/${part.id}`)}
                    className="flex-1 flex items-center justify-center gap-xs border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-2 rounded hover:bg-[#2D2D2D] hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    צפה בפרטים
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
