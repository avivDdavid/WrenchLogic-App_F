import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Supabase parts row → local part shape (matches GarageContext.addToGarage).
const normalizePart = (p) => ({
  id:         p.id,
  name:       p.name,
  category:   p.categories?.slug ?? '',
  hpGain:     p.hp_gain        ?? 0,
  torqueGain: p.torque_gain_nm ?? 0,
  imageUrl:   p.image_url      ?? '',
});

const SLIDER_RANGE = 400; // user can target up to currentHP + 400

/**
 * Target Builder — the user sets an HP goal; we show the gap and recommend
 * parts (sorted by hp_gain DESC, max 3) that help close it. The target is
 * persisted per-vehicle in localStorage so it survives reloads.
 */
export default function TargetBuilder({
  currentHP, currentTorque, baseHP, baseTorque, vehicleId, ownedIds, addToGarage,
}) {
  const storageKey = `wrenchlogic_target_${vehicleId}`;
  const sliderMin = currentHP;
  const sliderMax = currentHP + SLIDER_RANGE;

  // Load saved target (clamped), else default to a meaningful +100 HP goal.
  const [target, setTarget] = useState(() => {
    const stored = Number(localStorage.getItem(storageKey));
    if (stored && stored >= sliderMin) return Math.min(stored, sliderMax);
    return Math.min(currentHP + 100, sliderMax);
  });

  // Persist whenever the target changes.
  useEffect(() => {
    localStorage.setItem(storageKey, String(target));
  }, [storageKey, target]);

  // One read on page load — all parts, ready for recommendations.
  const [allParts, setAllParts] = useState([]);
  useEffect(() => {
    let active = true;
    supabase
      .from('parts')
      .select('*, categories(slug)')
      .order('hp_gain', { ascending: false })
      .then(({ data }) => { if (active && Array.isArray(data)) setAllParts(data.map(normalizePart)); });
    return () => { active = false; };
  }, []);

  // Slider position is always within the live range (currentHP can rise as
  // parts get installed); the trophy state covers target already met.
  const sliderValue = Math.min(Math.max(target, sliderMin), sliderMax);
  const reached  = currentHP >= target;
  const hpGap    = Math.max(0, target - currentHP);
  // Torque goal estimated from the engine's stock HP→Nm character.
  const torqueTarget = Math.round(target * (baseTorque / baseHP));
  const nmGap    = Math.max(0, torqueTarget - currentTorque);

  const recommendations = useMemo(() => {
    if (reached) return [];
    const owned = new Set(ownedIds);
    return allParts
      .filter(p => p.hpGain > 0 && !owned.has(p.id))
      .sort((a, b) => b.hpGain - a.hpGain)
      .slice(0, 3);
  }, [allParts, ownedIds, reached]);

  return (
    <section className="space-y-md">
      <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container uppercase">יעד ה-Build שלי</h3>
        <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">TARGET BUILDER</span>
      </div>

      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg space-y-md">

        {/* Slider + value */}
        <div className="flex items-center gap-md">
          <span className="font-mono-data text-h2 text-primary-container min-w-[90px] text-center whitespace-nowrap" dir="ltr">
            {sliderValue} HP
          </span>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={5}
            value={sliderValue}
            onChange={(e) => setTarget(Number(e.target.value))}
            aria-label="יעד כוח סוס"
            className="flex-1 h-2 accent-[#FF6B00] cursor-pointer"
          />
        </div>
        <div className="flex justify-between font-mono-data text-[11px] text-[#474746]" dir="ltr">
          <span>{sliderMin} HP</span>
          <span>{sliderMax} HP</span>
        </div>

        {/* Gap / trophy */}
        {reached ? (
          <div className="flex items-center justify-center gap-2 bg-[#00C853]/10 border border-[#00C853]/40 text-[#00C853] rounded-md py-3 px-4 font-h2 text-h2 text-center">
            🏆 הגעת ליעד! הרכב שלך ב-{currentHP} HP
          </div>
        ) : (
          <>
            <p className="font-body-lg text-body-lg text-on-surface text-center">
              חסרים לך <span className="text-primary-container font-bold">{hpGap} HP</span> ו-
              <span className="text-primary-container font-bold">{nmGap} Nm</span> כדי להגיע ליעד
            </p>

            {/* Recommendations */}
            <div className="pt-sm border-t border-[#2D2D2D] space-y-sm">
              <h4 className="font-label-caps text-label-caps text-secondary tracking-widest text-right">
                חלקים מומלצים להשלמת היעד
              </h4>
              {recommendations.length === 0 ? (
                <p className="font-body-md text-body-md text-secondary text-center py-4">
                  אין כרגע חלקים זמינים להמלצה.
                </p>
              ) : (
                recommendations.map(part => (
                  <div key={part.id} className="bg-[#121212] border border-[#2D2D2D] rounded-lg p-md flex items-center justify-between gap-md">
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded whitespace-nowrap">
                        +{part.hpGain} HP
                      </span>
                      <span className="font-mono-data text-sm text-secondary bg-[#2D2D2D] px-2 py-1 rounded whitespace-nowrap">
                        +{part.torqueGain} Nm
                      </span>
                    </div>
                    <div className="flex items-center gap-md min-w-0 flex-row-reverse text-right">
                      <h5 className="font-body-md text-body-md font-semibold text-on-surface truncate" dir="ltr">{part.name}</h5>
                      <button
                        onClick={() => addToGarage(part, 'planned')}
                        className="shrink-0 flex items-center gap-xs bg-primary-container/10 border border-primary-container/40 text-primary-container font-label-caps text-label-caps px-3 py-2 rounded hover:bg-primary-container hover:text-[#121212] transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        הוסף לתכנון
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
