import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { partName } from '../lib/displayNames';

// Supabase parts row → local part shape (matches GarageContext.addToGarage).
const normalizePart = (p) => ({
  id:         p.id,
  name:       p.name,
  name_en:    p.name_en ?? null,
  category:   p.categories?.slug ?? '',
  hpGain:     p.hp_gain        ?? 0,
  torqueGain: p.torque_gain_nm ?? 0,
  imageUrl:   p.image_url      ?? '',
});

const SLIDER_RANGE = 400; // user can target up to currentHP + 400

const T = {
  he: {
    title: 'יעד ה-Build שלי',
    aria: 'יעד כוח סוס',
    reached: (hp) => `🏆 הגעת ליעד! הרכב שלך ב-${hp} HP`,
    gap: (hpGap, nmGap) => (
      <>חסרים לך <span className="text-primary-container font-bold">{hpGap} HP</span> ו-<span className="text-primary-container font-bold">{nmGap} Nm</span> כדי להגיע ליעד</>
    ),
    recommended: 'חלקים מומלצים להשלמת היעד',
    smallestAvail: 'השדרוג הקטן ביותר הזמין (כל השאר גדולים מהפער)',
    none: 'אין כרגע חלקים זמינים להמלצה.',
    addToPlan: 'הוסף לתכנון',
  },
  en: {
    title: 'My Build Target',
    aria: 'Horsepower target',
    reached: (hp) => `🏆 Target reached! Your car is at ${hp} HP`,
    gap: (hpGap, nmGap) => (
      <>You need <span className="text-primary-container font-bold">{hpGap} HP</span> and <span className="text-primary-container font-bold">{nmGap} Nm</span> to reach your target</>
    ),
    recommended: 'Recommended parts to complete your target',
    smallestAvail: 'Smallest available upgrade (everything else exceeds the gap)',
    none: 'No parts available to recommend right now.',
    addToPlan: 'Add to Plan',
  },
};

/**
 * Target Builder — the user sets an HP goal; we show the gap and recommend
 * parts that help close it WITHOUT overshooting by much. The target is
 * persisted per-vehicle in localStorage so it survives reloads.
 */
export default function TargetBuilder({
  currentHP, currentTorque, baseHP, baseTorque, vehicleId, ownedIds, addToGarage,
}) {
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

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

  // Recommendations driven by the REMAINING gap, not raw HP.
  // Prefer parts that don't overshoot the gap by much (hp_gain <= gap * 1.3),
  // ranked by closeness to the gap. If everything overshoots, suggest the
  // single smallest available upgrade.
  const { recommendations, onlySmallest } = useMemo(() => {
    if (reached) return { recommendations: [], onlySmallest: false };
    const remaining = target - currentHP; // > 0 here
    const owned = new Set(ownedIds);
    const available = allParts.filter(p => p.hpGain > 0 && !owned.has(p.id));
    if (available.length === 0) return { recommendations: [], onlySmallest: false };

    const fitting = available.filter(p => p.hpGain <= remaining * 1.3);
    if (fitting.length > 0) {
      const sorted = [...fitting]
        .sort((a, b) => Math.abs(a.hpGain - remaining) - Math.abs(b.hpGain - remaining))
        .slice(0, 3);
      return { recommendations: sorted, onlySmallest: false };
    }
    // All available parts overshoot the gap → smallest one only.
    const smallest = [...available].sort((a, b) => a.hpGain - b.hpGain).slice(0, 1);
    return { recommendations: smallest, onlySmallest: true };
  }, [allParts, ownedIds, reached, target, currentHP]);

  return (
    <section className="space-y-md">
      <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container uppercase">{t.title}</h3>
        {isHe && <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">TARGET BUILDER</span>}
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
            aria-label={t.aria}
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
            {t.reached(currentHP)}
          </div>
        ) : (
          <>
            <p className="font-body-lg text-body-lg text-on-surface text-center">
              {t.gap(hpGap, nmGap)}
            </p>

            {/* Recommendations */}
            <div className="pt-sm border-t border-[#2D2D2D] space-y-sm">
              <h4 className={`font-label-caps text-label-caps text-secondary tracking-widest ${isHe ? 'text-right' : 'text-left'}`}>
                {onlySmallest ? t.smallestAvail : t.recommended}
              </h4>
              {recommendations.length === 0 ? (
                <p className="font-body-md text-body-md text-secondary text-center py-4">
                  {t.none}
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
                      <img
                        src={part.imageUrl || '/images/parts/part.png'}
                        alt={partName(part, lang)}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/parts/part.png'; }}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                      />
                      <h5 className="font-body-md text-body-md font-semibold text-on-surface truncate" dir={isHe ? 'rtl' : 'ltr'}>{partName(part, lang)}</h5>
                      <button
                        onClick={() => addToGarage(part, 'planned')}
                        className="shrink-0 flex items-center gap-xs bg-primary-container/10 border border-primary-container/40 text-primary-container font-label-caps text-label-caps px-3 py-2 rounded hover:bg-primary-container hover:text-[#121212] transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        {t.addToPlan}
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
