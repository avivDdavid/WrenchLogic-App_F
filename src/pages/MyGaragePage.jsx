import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';
import TriSegmentProgressBar from '../components/TriSegmentProgressBar';

const CATEGORY_ICONS = {
  induction: 'air',
  ecu:       'memory',
  cooling:   'ac_unit',
  brakes:    'disc_full',
  engine:    'settings',
  body:      'directions_car',
};

const CATEGORY_LABELS = {
  induction: 'Induction',
  ecu:       'ECU Tuning',
  cooling:   'Cooling',
  brakes:    'Braking',
  engine:    'Engine',
  body:      'Body / Aero',
};

const sum = (arr, key) => arr.reduce((acc, p) => acc + (p[key] ?? 0), 0);
const scaleMax = (value) => Math.ceil((value * 1.4) / 100) * 100;

export default function MyGaragePage() {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { userParts, updatePartStatus, removeFromGarage } = useGarage();

  useEffect(() => {
    if (!selectedVehicle) navigate('/', { replace: true });
  }, [selectedVehicle, navigate]);

  if (!selectedVehicle) return null;

  const { makeName, modelName, year, engine } = selectedVehicle;

  if (userParts.length === 0) {
    return (
      <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-lg max-w-sm">
          <span className="material-symbols-outlined text-[80px] text-[#2D2D2D]">garage</span>
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-xs">הגראז' שלך ריק</h2>
            <p className="font-body-md text-body-md text-secondary">
              עבור לקטלוג כדי לגלות חלפים ושיפורים שמתאימים ל‑{makeName} {modelName} שלך.
            </p>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-4 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            <span className="material-symbols-outlined">search</span>
            עבור לקטלוג החלפים
          </button>
        </div>
      </main>
    );
  }

  // Partition live context parts (not static JSON)
  const installedParts = userParts.filter(p => p.status === 'installed');
  const plannedParts   = userParts.filter(p => p.status === 'planned');

  // Base stats from selected vehicle
  const baseHP      = engine.stockHp;
  const baseTorque  = engine.stockTorque;

  // Calculated HP
  const currentHP  = baseHP     + sum(installedParts, 'hpGain');
  const targetHP   = currentHP  + sum(plannedParts,   'hpGain');
  const maxScaleHP = scaleMax(targetHP);

  // Calculated Torque
  const currentTorque  = baseTorque   + sum(installedParts, 'torqueGain');
  const targetTorque   = currentTorque + sum(plannedParts,   'torqueGain');
  const maxScaleTorque = scaleMax(targetTorque);

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-6xl mx-auto space-y-xl">

        {/* User Profile Header */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md border-b border-[#2D2D2D] pb-lg">
          <div className="flex items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-[#2D2D2D] overflow-hidden">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaon7rKumT_B6Lv8jSWCtDK4o6PnIUP7hd0kJBcC9MnLsb391zvVALXEDxWzfPGBxTfUC9cTripd35zGRjgddMmoWHyn5M5SvAQzI5BAsxDUAN724lrCWeRYgSbjOzAR5u-DuB0GRRlgyn1IDGN5AYO7u5wBKKq_jK9tgJnO9Y34DHzpHUDeObtLZnmBpfMWFoz_VXOixBfKJSmGf22VI3Z8phLZVvY-vwE5tUUbNfMqxvg-Z_0YvAQy39O_Fk4irQSUwfGwv-nKA"
              />
            </div>
            <div>
              <h1 className="font-h1 text-h1 text-on-surface uppercase">הגראז' שלי</h1>
              <p className="font-body-md text-body-md text-secondary">טיונר מקצועי • WrenchLogic</p>
            </div>
          </div>
          <button className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-background transition-colors flex items-center gap-xs shadow-[0px_2px_4px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            ערוך פרופיל
          </button>
        </section>

        {/* Hero Car Card */}
        <section className="relative w-full rounded-lg overflow-hidden border border-[#2D2D2D] bg-[#1E1E1E]">
          <div className="aspect-video md:aspect-[21/9] w-full relative">
            <img
              alt={`${makeName} ${modelName}`}
              className="w-full h-full object-cover opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBTNKJtqXm4BmDK1Bn1MtL37J71yKGKFCWlx73fjc7R5Ki3vm3XkGFfJC1fRmQvcie65gx6uqwNmcSZbVJIVF4SuUoeTEf41goag77qhP9_Ndw3yoB27xrrnFyhU1RRbBPQX0JKiYRspElHYOOLKqSnFgoS3QB-WR7Pl8PXDhdGLy0jvUbZ5jWG3Wu0O78QfF2hWx36QKoU_H75CwxON7GgbOxFgBA_yUejmXs0H_2baLCT6WHncMar1ggzqumzC3RDZK1Fw-4NR8"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
            <div className="absolute bottom-md right-md left-md flex justify-between items-end">
              <div>
                <div className="inline-block bg-[#00C853] text-black font-label-caps text-label-caps px-sm py-base rounded-sm uppercase mb-sm">
                  חוקי לכביש
                </div>
                <h2 className="font-h2 text-h2 text-on-surface mb-base" dir="ltr">
                  {year} {makeName} {modelName}
                </h2>
                <p className="font-mono-data text-mono-data text-primary-container" dir="ltr">
                  {engine.code} {engine.displacement} • {baseHP} כ&quot;ס / {baseTorque} Nm
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">מדדי ביצועים משוערים</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">
              EST. PERFORMANCE METRICS
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <TriSegmentProgressBar
              label="כ״ס בגלגל (HP)"
              base={baseHP}
              current={currentHP}
              target={targetHP}
              maxScale={maxScaleHP}
            />
            <TriSegmentProgressBar
              label="מומנט (Nm)"
              base={baseTorque}
              current={currentTorque}
              target={targetTorque}
              maxScale={maxScaleTorque}
            />
          </div>
          {/* Legend */}
          <div className="flex flex-row-reverse items-center gap-lg text-xs font-mono-data text-secondary">
            <div className="flex items-center gap-xs">
              <div className="w-3 h-2 rounded-sm bg-[#2D2D2D]" />
              <span>סטוק</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-2 rounded-sm bg-primary-container" />
              <span>נוכחי (+{sum(installedParts, 'hpGain')} HP / +{sum(installedParts, 'torqueGain')} Nm)</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-2 rounded-sm bg-white/30" />
              <span>יעד (+{sum(plannedParts, 'hpGain')} HP / +{sum(plannedParts, 'torqueGain')} Nm)</span>
            </div>
          </div>
        </section>

        {/* Mods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">

          {/* Installed Mods */}
          <section className="space-y-md">
            <div className="flex items-baseline justify-between border-b border-[#2D2D2D] pb-base">
              <div className="flex items-baseline gap-sm">
                <h3 className="font-h2 text-h2 text-primary-container uppercase">שיפורים מותקנים</h3>
                <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">
                  INSTALLED MODS
                </span>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-primary-container flex items-center gap-xs hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-label-caps text-label-caps">הוסף חדש</span>
              </button>
            </div>

            {installedParts.length === 0 ? (
              <p className="font-body-md text-body-md text-secondary text-center py-8">
                אין חלקים מותקנים עדיין.
              </p>
            ) : (
              <div className="space-y-sm">
                {installedParts.map(part => (
                  <div
                    key={part.id}
                    className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 bg-[#2D2D2D] rounded flex items-center justify-center text-[#474746]">
                        <span className="material-symbols-outlined">
                          {CATEGORY_ICONS[part.category] ?? 'build'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-body-md text-body-md font-semibold text-on-surface" dir="ltr">
                          {part.name}
                        </h4>
                        <p className="font-mono-data text-xs text-secondary">
                          {CATEGORY_LABELS[part.category] ?? part.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded whitespace-nowrap">
                        {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                      </span>
                      <button
                        onClick={() => removeFromGarage(part.id)}
                        title="הסר מהגראז'"
                        className="text-[#474746] hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Planned Mods */}
          <section className="space-y-md">
            <div className="flex items-baseline justify-between border-b border-[#2D2D2D] pb-base">
              <div className="flex items-baseline gap-sm">
                <h3 className="font-h2 text-h2 text-primary-container uppercase">שיפורים מתוכננים</h3>
                <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">
                  PLANNED MODS
                </span>
              </div>
            </div>

            {plannedParts.length === 0 ? (
              <p className="font-body-md text-body-md text-secondary text-center py-8">
                אין שיפורים מתוכננים.
              </p>
            ) : (
              <div className="space-y-sm">
                {plannedParts.map(part => (
                  <div
                    key={part.id}
                    className="bg-[#121212] border border-dashed border-[#2D2D2D] rounded-lg p-md flex items-center justify-between gap-md opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-md min-w-0">
                      <div className="w-12 h-12 shrink-0 bg-[#1E1E1E] rounded flex items-center justify-center text-[#474746]">
                        <span className="material-symbols-outlined">
                          {CATEGORY_ICONS[part.category] ?? 'bolt'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-body-md text-body-md font-semibold text-secondary truncate" dir="ltr">
                          {part.name}
                        </h4>
                        <p className="font-mono-data text-xs text-[#474746]">
                          {CATEGORY_LABELS[part.category] ?? part.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-mono-data text-sm text-secondary bg-[#2D2D2D] px-2 py-1 rounded whitespace-nowrap">
                        {part.hpGain > 0 ? `EST +${part.hpGain} HP` : '—'}
                      </span>
                      <button
                        onClick={() => updatePartStatus(part.id, 'installed')}
                        title="סמן כמותקן"
                        className="flex items-center gap-xs bg-primary-container/10 border border-primary-container/40 text-primary-container font-label-caps text-label-caps px-2 py-1 rounded hover:bg-primary-container hover:text-[#121212] transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        התקן
                      </button>
                      <button
                        onClick={() => removeFromGarage(part.id)}
                        title="הסר מהגראז'"
                        className="text-[#474746] hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/catalog')}
              className="w-full mt-md border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-sm px-md rounded hover:bg-[#1E1E1E] transition-colors flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              חפש בקטלוג החלפים
            </button>
          </section>

        </div>
      </div>
    </main>
  );
}
