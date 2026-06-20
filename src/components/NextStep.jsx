import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { partName } from '../lib/displayNames';

// Supabase parts row → local shape (matches GarageContext.addToGarage).
const normalizePart = (p) => ({
  id:         p.id,
  name:       p.name,
  name_en:    p.name_en ?? null,
  category:   p.categories?.slug ?? '',
  hpGain:     p.hp_gain        ?? 0,
  torqueGain: p.torque_gain_nm ?? 0,
  imageUrl:   p.image_url      ?? '',
  difficulty: p.difficulty     ?? '',
});

const DIFFICULTY = {
  easy:   { he: 'קל',     en: 'Easy',   color: 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/40' },
  medium: { he: 'בינוני', en: 'Medium', color: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/40' },
  expert: { he: 'מומחה',  en: 'Expert', color: 'bg-red-500/15 text-red-400 border-red-500/40' },
};

// Tuning categories grouped by what they actually do, so the recommendation
// engine can reason about the build instead of suggesting a random part.
const POWER_CATS  = ['engine', 'boost', 'intake', 'exhaust', 'software', 'cooling', 'fuel'];
const SAFETY_CATS = ['brakes', 'suspension'];

// One-sentence, language-aware justification for WHY a part is the next step.
const REASONS = {
  brakes: (lang, { powerAddedHp }) => lang === 'en'
    ? `You added ${powerAddedHp} hp but the brakes are still stock. Next step: upgrade the brakes to safely stop the new power.`
    : `הוספת ${powerAddedHp} כ״ס אבל הבלמים עדיין סטוק. הצעד הבא הוא שדרוג בלמים כדי לעצור בבטחה את הכוח החדש.`,
  suspension: (lang) => lang === 'en'
    ? `Power and brakes are handled — the suspension is now the weak link for putting that power down and staying planted in corners.`
    : `הכוח והבלמים מטופלים — המתלים הם כעת החוליה החלשה להעברת הכוח לכביש ולשליטה בפניות.`,
  firstStep: (lang) => lang === 'en'
    ? `A great first step — an affordable upgrade that frees up real power with minimal effort.`
    : `צעד ראשון מצוין — שדרוג זול שמשחרר כוח אמיתי במאמץ מינימלי.`,
  powerJump: (lang) => lang === 'en'
    ? `Brakes and suspension are covered — this is your next meaningful power jump toward the target.`
    : `הבלמים והמתלים מכוסים — זו קפיצת הכוח המשמעותית הבאה שלך לכיוון היעד.`,
  balance: (lang) => lang === 'en'
    ? `Rounds out your build with better control and balance.`
    : `משלים את ה-build שלך עם שליטה ואיזון טובים יותר.`,
  generic: (lang) => lang === 'en'
    ? `A solid next upgrade for your current build.`
    : `שדרוג סולידי להמשך ה-build הנוכחי שלך.`,
};

const T = {
  he: {
    title: '🚀 הצעד הבא המומלץ עבורך',
    basedOn: 'בהתבסס על הבנייה הנוכחית שלך',
    startAdding: 'התחל בהוספת חלף לגראז\' כדי לקבל המלצות מותאמות אישית',
    allOwned: '🏆 כל החלפים הזמינים כבר בגראז\' שלך — קטלוג חדש בקרוב!',
    addToPlan: 'הוסף לתכנון',
    viewDetails: 'צפה בפרטים',
  },
  en: {
    title: '🚀 Recommended next step for you',
    basedOn: 'Based on your current build',
    startAdding: 'Add a part to your garage to get personalized recommendations',
    allOwned: '🏆 All available parts are already in your garage — new catalog soon!',
    addToPlan: 'Add to Plan',
    viewDetails: 'View Details',
  },
};

/**
 * NextStep — "weakest link" recommendation engine. Instead of suggesting a
 * random part, it reads the current build and recommends the upgrade that best
 * balances it:
 *   1. Added power but stock brakes → brakes first (stop the new power safely).
 *   2. Power + brakes done, stock suspension → suspension (put power down).
 *   3. Brakes & suspension covered → the next power jump toward the target.
 *   4. Empty garage → a cheap, meaningful first step (intake/exhaust).
 * Power parts are still filtered by the remaining gap to the build target so we
 * never recommend overshooting it. Each card carries a one-line reason.
 */
export default function NextStep({ installedParts, ownedIds, addToGarage, currentHP = 0, baseHP = 0, vehicleId }) {
  const navigate = useNavigate();
  const { lang } = useTheme();
  const t = T[lang] || T.he;
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
    const owned         = new Set(ownedIds);
    const installedCats = new Set(installedParts.map(p => p.category));
    const powerAddedHp  = Math.max(0, Math.round(currentHP - baseHP));
    const hasPower      = powerAddedHp > 0 || [...installedCats].some(c => POWER_CATS.includes(c));
    const brakesDone    = installedCats.has('brakes');
    const suspDone      = installedCats.has('suspension');
    const garageEmpty   = ownedIds.length === 0;

    // Build target (gap) comes from TargetBuilder's per-vehicle localStorage key;
    // fall back to a sensible +100 HP goal.
    let buildTarget = currentHP + 100;
    try {
      const stored = Number(localStorage.getItem(`wrenchlogic_target_${vehicleId}`));
      if (stored && stored > currentHP) buildTarget = stored;
    } catch { /* ignore */ }
    const remaining = Math.max(0, buildTarget - currentHP);

    // Power parts that blow past the remaining gap are dropped so we never
    // recommend overshooting the target. Non-power parts always qualify.
    const withinGap = (p) =>
      !POWER_CATS.includes(p.category) ? true : (remaining > 0 && p.hpGain <= remaining * 1.3);

    const available = allParts.filter(p => !owned.has(p.id) && withinGap(p));

    // Higher score = recommended sooner. Encodes the tuning priority above.
    const priorityOf = (p) => {
      if (hasPower && !brakesDone && p.category === 'brakes')                 return 100;
      if (hasPower && brakesDone && !suspDone && p.category === 'suspension') return 95;
      if (garageEmpty && (p.category === 'intake' || p.category === 'exhaust')) return 90;
      if (POWER_CATS.includes(p.category))  return 60;
      if (SAFETY_CATS.includes(p.category)) return 50;
      return 30;
    };

    const reasonKeyOf = (p) => {
      if (hasPower && !brakesDone && p.category === 'brakes')                 return 'brakes';
      if (hasPower && brakesDone && !suspDone && p.category === 'suspension') return 'suspension';
      if (garageEmpty && (p.category === 'intake' || p.category === 'exhaust')) return 'firstStep';
      if (POWER_CATS.includes(p.category))  return 'powerJump';
      if (SAFETY_CATS.includes(p.category)) return 'balance';
      return 'generic';
    };

    return [...available]
      .sort((a, b) => {
        const pa = priorityOf(a), pb = priorityOf(b);
        if (pa !== pb) return pb - pa;          // priority first…
        return b.hpGain - a.hpGain;             // …then bigger gain.
      })
      .slice(0, 3)
      .map(p => ({ ...p, reason: REASONS[reasonKeyOf(p)](lang, { powerAddedHp }) }));
  }, [allParts, ownedIds, installedParts, currentHP, baseHP, vehicleId, lang]);

  const allOwned = loaded && allParts.length > 0 && recommendations.length === 0;

  return (
    <section className="space-y-md">
      <div className="border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container">{t.title}</h3>
        <p className="font-body-md text-body-md text-secondary mt-base">{t.basedOn}</p>
      </div>

      {allOwned ? (
        <div className="bg-[#1E1E1E] border border-[#00C853]/30 rounded-lg p-md md:p-lg text-center">
          <p className="font-h2 text-h2 text-[#00C853]">
            {t.allOwned}
          </p>
        </div>
      ) : !loaded ? (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-primary-container text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {recommendations.map(part => {
            const diffDef = DIFFICULTY[part.difficulty];
            const diffLabel = diffDef ? diffDef[lang] : (part.difficulty || '—');
            const diffColor = diffDef ? diffDef.color : 'bg-[#2D2D2D] text-secondary border-[#2D2D2D]';
            return (
              <div key={part.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-col gap-sm hover:border-primary-container transition-colors">
                {/* Name + category + difficulty + thumbnail */}
                <div className="flex items-start justify-between gap-sm">
                  <span className={`shrink-0 font-label-caps text-label-caps px-2 py-1 rounded-full border ${diffColor}`}>
                    {diffLabel}
                  </span>
                  <div className="flex items-center gap-sm min-w-0">
                    <div className="text-right min-w-0">
                      <h4 className="font-body-md text-body-md font-semibold text-on-surface truncate" dir={lang === 'he' ? 'rtl' : 'ltr'}>{partName(part, lang)}</h4>
                      <p className="font-mono-data text-[11px] text-secondary uppercase mt-1">{part.category}</p>
                    </div>
                    <img
                      src={part.imageUrl || '/images/parts/part.png'}
                      alt={partName(part, lang)}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/parts/part.png'; }}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />
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

                {/* Why this is the recommended next step */}
                {part.reason && (
                  <p
                    className="font-body-md text-[12px] leading-relaxed text-secondary border-s-2 border-s-primary-container/60 ps-2"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                  >
                    {part.reason}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-sm mt-auto pt-sm">
                  <button
                    onClick={() => addToGarage(part, 'planned')}
                    className="flex-1 flex items-center justify-center gap-xs bg-primary-container text-[#121212] font-label-caps text-label-caps py-2 rounded hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    {t.addToPlan}
                  </button>
                  <button
                    onClick={() => navigate(`/catalog/${part.id}`)}
                    className="flex-1 flex items-center justify-center gap-xs border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-2 rounded hover:bg-[#2D2D2D] hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    {t.viewDetails}
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
