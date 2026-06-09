import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';
import { useAuth } from '../context/AuthContext';
import { MODEL_IMAGES } from './VehicleSelectionPage';
import TriSegmentProgressBar from '../components/TriSegmentProgressBar';
import TargetBuilder from '../components/TargetBuilder';
import GarageBenchmark from '../components/GarageBenchmark';
import NextStep from '../components/NextStep';

const CATEGORY_ICONS = { induction:'air', intake:'air', ecu:'memory', cooling:'ac_unit', brakes:'disc_full', engine:'settings', exhaust:'local_fire_department', body:'directions_car' };
const CATEGORY_LABELS = { induction:'Induction', intake:'Intake', ecu:'ECU Tuning', cooling:'Cooling', brakes:'Braking', engine:'Engine', exhaust:'Exhaust', body:'Body / Aero' };

// Generic fallback hero used when the selected model has no local photo.
const DEFAULT_HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBTNKJtqXm4BmDK1Bn1MtL37J71yKGKFCWlx73fjc7R5Ki3vm3XkGFfJC1fRmQvcie65gx6uqwNmcSZbVJIVF4SuUoeTEf41goag77qhP9_Ndw3yoB27xrrnFyhU1RRbBPQX0JKiYRspElHYOOLKqSnFgoS3QB-WR7Pl8PXDhdGLy0jvUbZ5jWG3Wu0O78QfF2hWx36QKoU_H75CwxON7GgbOxFgBA_yUejmXs0H_2baLCT6WHncMar1ggzqumzC3RDZK1Fw-4NR8';

const sum = (arr, key) => arr.reduce((acc, p) => acc + (p[key] ?? 0), 0);
const scaleMax = (value) => Math.ceil((value * 1.4) / 100) * 100;

// Approximate kerb weight (kg) per model — used for the 0-100 estimate.
const MODEL_WEIGHTS = {
  'Golf GTI':      1450,
  'Golf R':        1500,
  'Leon Cupra':    1420,
  'Civic Type R':  1390,
  'Civic Si':      1350,
  'i30':           1280,
  'Veloster N':    1430,
};
const DEFAULT_WEIGHT = 1400;

// Theoretical 0-100 km/h estimate from power-to-weight (sport-car approximation).
const estimate0to100 = (hp, weight) => Math.pow(weight / (hp * 4.5), 0.65) * 10;

export default function MyGaragePage() {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { user }  = useAuth();
  const { userParts, addToGarage, updatePartStatus, removeFromGarage, refreshFromSupabase } = useGarage();

  const [loading, setLoading] = useState(!!user);

  // The garage is loaded from Supabase (garage_entries) by GarageContext.
  // Refresh it on mount so this page always reflects the latest saved data.
  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      await refreshFromSupabase();
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [user, refreshFromSupabase]);

  // No vehicle selected — stay on /garage but prompt the user to pick one
  // (don't bounce back to home, which made the garage feel unreachable).
  if (!selectedVehicle) {
    return (
      <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-lg max-w-sm">
          <span className="material-symbols-outlined text-[80px] text-[#2D2D2D]">directions_car</span>
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-xs">בחר רכב כדי לראות את הגראז&apos;</h2>
            <p className="font-body-md text-body-md text-secondary">
              הגראז&apos; מציג מדדי ביצועים והתאמות לפי הרכב שלך. בחר רכב כדי להתחיל.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-4 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined">directions_car</span>
            בחר רכב
          </button>
        </div>
      </main>
    );
  }

  const activeParts = userParts;
  const { makeName, modelName, year, engine } = selectedVehicle;

  // Loading state (only while the first Supabase fetch is in flight)
  if (loading && activeParts.length === 0) {
    return (
      <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-container text-[56px] animate-spin">progress_activity</span>
      </main>
    );
  }

  const isEmpty = activeParts.length === 0;

  const installedParts = activeParts.filter(p => p.status === 'installed');
  const plannedParts   = activeParts.filter(p => p.status === 'planned');

  const baseHP    = engine.stockHp;
  const baseTorque = engine.stockTorque;
  const currentHP  = baseHP     + sum(installedParts, 'hpGain');
  const targetHP   = currentHP  + sum(plannedParts,   'hpGain');
  const currentTorque  = baseTorque  + sum(installedParts, 'torqueGain');
  const targetTorque   = currentTorque + sum(plannedParts,  'torqueGain');
  const maxScaleHP     = scaleMax(targetHP);
  const maxScaleTorque = scaleMax(targetTorque);

  // 0-100 km/h estimates (stock / current / planned)
  const vehicleWeight = MODEL_WEIGHTS[modelName] ?? DEFAULT_WEIGHT;
  const accelStock   = estimate0to100(baseHP,    vehicleWeight);
  const accelCurrent = estimate0to100(currentHP, vehicleWeight);
  const accelTarget  = estimate0to100(targetHP,  vehicleWeight);
  const accelSaved   = accelStock - accelTarget;

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-6xl mx-auto space-y-xl">

        {/* Guest banner — shown only when not logged in */}
        {!user && (
          <div className="flex flex-row-reverse items-center justify-between gap-3 bg-[#FF6B00]/10 border border-[#FF6B00]/40 rounded p-md">
            <div className="flex flex-row-reverse items-center gap-2 text-right">
              <span className="material-symbols-outlined text-[18px] text-[#FF6B00]">info</span>
              <p className="font-body-md text-body-md text-on-surface">
                הגראז&apos; שלך נשמר באופן זמני. התחבר כדי לשמור לצמיתות.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="shrink-0 bg-[#FF6B00] text-[#121212] font-label-caps text-label-caps px-4 py-2 rounded hover:bg-[#ff8533] transition-colors"
            >
              התחבר
            </button>
          </div>
        )}

        {/* User Profile Header */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md border-b border-[#2D2D2D] pb-lg">
          <div className="flex items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-[#2D2D2D] overflow-hidden">
              <img alt="תמונת פרופיל" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaon7rKumT_B6Lv8jSWCtDK4o6PnIUP7hd0kJBcC9MnLsb391zvVALXEDxWzfPGBxTfUC9cTripd35zGRjgddMmoWHyn5M5SvAQzI5BAsxDUAN724lrCWeRYgSbjOzAR5u-DuB0GRRlgyn1IDGN5AYO7u5wBKKq_jK9tgJnO9Y34DHzpHUDeObtLZnmBpfMWFoz_VXOixBfKJSmGf22VI3Z8phLZVvY-vwE5tUUbNfMqxvg-Z_0YvAQy39O_Fk4irQSUwfGwv-nKA" />
            </div>
            <div>
              <h1 className="font-h1 text-h1 text-on-surface uppercase">הגראז&apos; שלי</h1>
              <p className="font-body-md text-body-md text-primary-container font-semibold" dir="ltr">
                {year} {makeName} {modelName} • {engine.code}
              </p>
              <p className="font-mono-data text-[11px] text-secondary">הגראז&apos; מציג שיפורים עבור הרכב הנבחר בלבד</p>
            </div>
          </div>
        </section>

        {/* Hero Car */}
        <section className="relative w-full rounded-lg overflow-hidden border border-[#2D2D2D] bg-[#1E1E1E]">
          <div className="aspect-video md:aspect-[21/9] w-full relative">
            <img
              alt={`תמונת ${makeName} ${modelName}`}
              className="w-full h-full object-cover opacity-80"
              src={MODEL_IMAGES[selectedVehicle.modelId] ?? DEFAULT_HERO_IMG}
              onError={(e) => { if (e.currentTarget.src !== DEFAULT_HERO_IMG) e.currentTarget.src = DEFAULT_HERO_IMG; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
            <div className="absolute bottom-md right-md left-md flex justify-between items-end">
              <div>
                <h2 className="font-h2 text-h2 text-on-surface mb-base" dir="ltr">{year} {makeName} {modelName}</h2>
                <p className="font-mono-data text-mono-data text-primary-container" dir="ltr">{engine.code} {engine.displacement} • {baseHP} כ&quot;ס / {baseTorque} Nm</p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">מדדי ביצועים משוערים</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">EST. PERFORMANCE METRICS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <TriSegmentProgressBar label="כ״ס בגלגל (HP)"  base={baseHP}    current={currentHP}    target={targetHP}    maxScale={maxScaleHP} />
            <TriSegmentProgressBar label="מומנט (Nm)"      base={baseTorque} current={currentTorque} target={targetTorque} maxScale={maxScaleTorque} />
          </div>
          <div className="flex flex-row-reverse items-center gap-lg text-xs font-mono-data text-secondary">
            <div className="flex items-center gap-xs"><div className="w-3 h-2 rounded-sm bg-[#2D2D2D]" /><span>סטוק</span></div>
            <div className="flex items-center gap-xs"><div className="w-3 h-2 rounded-sm bg-primary-container" /><span>נוכחי (+{sum(installedParts,'hpGain')} HP / +{sum(installedParts,'torqueGain')} Nm)</span></div>
            <div className="flex items-center gap-xs"><div className="w-3 h-2 rounded-sm bg-white/30" /><span>יעד (+{sum(plannedParts,'hpGain')} HP / +{sum(plannedParts,'torqueGain')} Nm)</span></div>
          </div>
        </section>

        {/* 0-100 km/h acceleration estimate */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">⏱ תאוצה 0-100</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">0-100 KM/H</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            {/* Stock */}
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md text-center">
              <p className="font-label-caps text-label-caps text-secondary uppercase mb-xs">סטוק</p>
              <p className="font-h1 text-h1 text-secondary">{accelStock.toFixed(1)}<span className="font-body-md text-body-md"> ש׳</span></p>
            </div>
            {/* Current */}
            <div className="bg-[#1E1E1E] border border-primary-container/50 rounded-lg p-md text-center">
              <p className="font-label-caps text-label-caps text-primary-container uppercase mb-xs">נוכחי</p>
              <p className="font-h1 text-h1 text-primary-container">{accelCurrent.toFixed(1)}<span className="font-body-md text-body-md"> ש׳</span></p>
            </div>
            {/* Planned */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-md text-center">
              <p className="font-label-caps text-label-caps text-on-surface/70 uppercase mb-xs">מתוכנן</p>
              <p className="font-h1 text-h1 text-on-surface">{accelTarget.toFixed(1)}<span className="font-body-md text-body-md"> ש׳</span></p>
            </div>
          </div>
          {accelSaved > 0.05 && (
            <p className="font-body-md text-body-md text-[#00C853] text-center font-semibold">
              ⚡ חסכת {accelSaved.toFixed(1)} שניות
            </p>
          )}
          <p className="font-mono-data text-[11px] text-secondary text-center">* הערכה תיאורטית בלבד — תנאי נסיעה משתנים</p>
        </section>

        {/* Empty garage notice — vehicle still shown above */}
        {isEmpty && (
          <section className="flex flex-col items-center justify-center text-center gap-md bg-[#1E1E1E] border border-dashed border-[#2D2D2D] rounded-lg py-12 px-md">
            <span className="material-symbols-outlined text-[64px] text-[#2D2D2D]">garage</span>
            <p className="font-body-lg text-body-lg text-on-surface">הגראז&apos; ריק — הוסף חלפים מהקטלוג כדי לראות שינויים</p>
            <button onClick={() => navigate('/catalog')} className="bg-primary-container text-[#121212] font-label-caps text-label-caps py-3 px-6 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <span className="material-symbols-outlined">search</span>
              עבור לקטלוג החלפים
            </button>
          </section>
        )}

        {!isEmpty && (<>
        {/* Target Builder */}
        <TargetBuilder
          currentHP={currentHP}
          currentTorque={currentTorque}
          baseHP={baseHP}
          baseTorque={baseTorque}
          vehicleId={engine.id}
          ownedIds={activeParts.map(p => p.id)}
          addToGarage={addToGarage}
        />

        {/* Benchmark */}
        <GarageBenchmark
          modelName={modelName}
          currentHP={currentHP}
          baseHP={baseHP}
          ownedIds={activeParts.map(p => p.id)}
        />

        {/* Mods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">

          {/* Installed */}
          <section className="space-y-md">
            <div className="flex items-baseline justify-between border-b border-[#2D2D2D] pb-base">
              <div className="flex items-baseline gap-sm">
                <h3 className="font-h2 text-h2 text-primary-container uppercase">שיפורים מותקנים</h3>
                <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">INSTALLED MODS</span>
              </div>
              <button onClick={() => navigate('/catalog')} className="text-primary-container flex items-center gap-xs hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-label-caps text-label-caps">הוסף חדש</span>
              </button>
            </div>
            {installedParts.length === 0 ? (
              <p className="font-body-md text-body-md text-secondary text-center py-8">אין חלקים מותקנים עדיין.</p>
            ) : (
              <div className="space-y-sm">
                {installedParts.map(part => (
                  <div key={part.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex items-center justify-between">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 bg-[#2D2D2D] rounded flex items-center justify-center text-[#474746]">
                        <span className="material-symbols-outlined">{CATEGORY_ICONS[part.category] ?? 'build'}</span>
                      </div>
                      <div>
                        <h4 className="font-body-md text-body-md font-semibold text-on-surface" dir="ltr">{part.name}</h4>
                        <p className="font-mono-data text-xs text-secondary">{CATEGORY_LABELS[part.category] ?? part.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded whitespace-nowrap">
                        {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                      </span>
                      <button onClick={() => removeFromGarage(part.id)} title="הסר מהגראז'" aria-label="הסר חלף" className="text-[#474746] hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Planned */}
          <section className="space-y-md">
            <div className="flex items-baseline justify-between border-b border-[#2D2D2D] pb-base">
              <div className="flex items-baseline gap-sm">
                <h3 className="font-h2 text-h2 text-primary-container uppercase">שיפורים מתוכננים</h3>
                <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">PLANNED MODS</span>
              </div>
            </div>
            {plannedParts.length === 0 ? (
              <p className="font-body-md text-body-md text-secondary text-center py-8">אין שיפורים מתוכננים.</p>
            ) : (
              <div className="space-y-sm">
                {plannedParts.map(part => (
                  <div key={part.id} className="bg-[#121212] border border-dashed border-[#2D2D2D] rounded-lg p-md flex items-center justify-between gap-md opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-md min-w-0">
                      <div className="w-12 h-12 shrink-0 bg-[#1E1E1E] rounded flex items-center justify-center text-[#474746]">
                        <span className="material-symbols-outlined">{CATEGORY_ICONS[part.category] ?? 'bolt'}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-body-md text-body-md font-semibold text-secondary truncate" dir="ltr">{part.name}</h4>
                        <p className="font-mono-data text-xs text-[#474746]">{CATEGORY_LABELS[part.category] ?? part.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-mono-data text-sm text-secondary bg-[#2D2D2D] px-2 py-1 rounded whitespace-nowrap">
                        {part.hpGain > 0 ? `EST +${part.hpGain} HP` : '—'}
                      </span>
                      <button onClick={() => updatePartStatus(part.id, 'installed')} title="סמן כמותקן" className="flex items-center gap-xs bg-primary-container/10 border border-primary-container/40 text-primary-container font-label-caps text-label-caps px-2 py-1 rounded hover:bg-primary-container hover:text-[#121212] transition-colors whitespace-nowrap">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        התקן
                      </button>
                      <button onClick={() => removeFromGarage(part.id)} title="הסר מהגראז'" aria-label="הסר חלף" className="text-[#474746] hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/catalog')} className="w-full mt-md border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-sm px-md rounded hover:bg-[#1E1E1E] transition-colors flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">search</span>
              חפש בקטלוג החלפים
            </button>
          </section>

        </div>

        {/* Next Step recommendations */}
        <NextStep
          installedParts={installedParts}
          ownedIds={activeParts.map(p => p.id)}
          addToGarage={addToGarage}
        />
        </>)}
      </div>
    </main>
  );
}
