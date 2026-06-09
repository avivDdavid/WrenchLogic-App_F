import { useGarage } from '../context/GarageContext';

export default function UserProfilePage() {
  const { userParts } = useGarage();

  // Real garage stats, derived straight from the garage context.
  const installed   = userParts.filter(p => p.status === 'installed');
  const plannedCount = userParts.filter(p => p.status === 'planned').length;
  const hpAdded     = installed.reduce((sum, p) => sum + (p.hpGain     || 0), 0);
  const nmAdded     = installed.reduce((sum, p) => sum + (p.torqueGain || 0), 0);

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-3xl mx-auto space-y-xl">

        {/* Header */}
        <section className="flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-md border-b border-[#2D2D2D] pb-lg">
          <div className="flex flex-row-reverse items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-[#FF6B00] overflow-hidden shrink-0">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaon7rKumT_B6Lv8jSWCtDK4o6PnIUP7hd0kJBcC9MnLsb391zvVALXEDxWzfPGBxTfUC9cTripd35zGRjgddMmoWHyn5M5SvAQzI5BAsxDUAN724lrCWeRYgSbjOzAR5u-DuB0GRRlgyn1IDGN5AYO7u5wBKKq_jK9tgJnO9Y34DHzpHUDeObtLZnmBpfMWFoz_VXOixBfKJSmGf22VI3Z8phLZVvY-vwE5tUUbNfMqxvg-Z_0YvAQy39O_Fk4irQSUwfGwv-nKA"
              />
            </div>
            <div className="text-right">
              <h1 className="font-h1 text-h1 text-on-surface uppercase">שלומי טיונר</h1>
              <p className="font-mono-data text-mono-data text-secondary">shlomi@wrenchlogic.com</p>
            </div>
          </div>
          <button className="border border-primary-container text-primary-container font-label-caps text-label-caps py-sm px-md rounded hover:bg-primary-container hover:text-[#121212] transition-colors flex items-center gap-xs shadow-[0px_2px_4px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            ערוך פרופיל
          </button>
        </section>

        {/* Subscription */}
        <section className="bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg p-lg space-y-md">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="flex flex-row-reverse items-center gap-sm">
              <span className="material-symbols-outlined text-primary-container">workspace_premium</span>
              <div className="text-right">
                <h2 className="font-h2 text-h2 text-primary-container uppercase">Pro Tuner</h2>
                <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">SUBSCRIPTION TIER</span>
              </div>
            </div>
            <span className="bg-primary-container text-[#121212] font-label-caps text-label-caps px-sm py-base rounded uppercase">
              פעיל
            </span>
          </div>
          <div className="grid grid-cols-3 gap-sm text-center border-t border-[#2D2D2D] pt-md">
            {[
              { label: 'גראז\' מלא ללא הגבלה', icon: 'garage' },
              { label: 'גיבוי אוטומטי לענן',   icon: 'cloud_upload' },
              { label: 'מעקב ביצועים חי',      icon: 'monitoring' },
            ].map(({ label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-xs text-secondary">
                <span className="material-symbols-outlined text-primary-container text-[22px]">{icon}</span>
                <span className="font-mono-data text-[10px] text-secondary leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Account Details */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">פרטי חשבון</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">ACCOUNT DETAILS</span>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg divide-y divide-[#2D2D2D]">
            {[
              { label: 'שם מלא',    value: 'שלומי טיונר',             icon: 'person'    },
              { label: 'אימייל',    value: 'shlomi@wrenchlogic.com',  icon: 'mail'      },
              { label: 'טלפון',     value: '+972 52-000-0000',         icon: 'phone'     },
              { label: 'חבר מאז',   value: 'ינואר 2024',              icon: 'calendar_month' },
              { label: 'מיקום',     value: 'תל אביב, ישראל',          icon: 'location_on'    },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex flex-row-reverse items-center justify-between px-md py-sm">
                <div className="flex flex-row-reverse items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-[#474746]">{icon}</span>
                  <span className="font-label-caps text-label-caps text-secondary">{label}</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface" dir={/[a-z]/i.test(value) ? 'ltr' : 'rtl'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Garage Stats */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">סטטיסטיקות גראז'</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">GARAGE STATS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {[
              { value: String(installed.length), label: 'חלקים מותקנים',    icon: 'build_circle' },
              { value: String(plannedCount),     label: 'שיפורים מתוכננים', icon: 'schedule'     },
              { value: `+${hpAdded}`,            label: 'כ"ס נוספו',         icon: 'bolt'         },
              { value: `+${nmAdded}`,            label: 'Nm נוספו',          icon: 'compress'     },
            ].map(({ value, label, icon }) => (
              <div key={label} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md text-center space-y-xs">
                <span className="material-symbols-outlined text-primary-container text-[28px]">{icon}</span>
                <p className="font-h2 text-h2 text-on-surface">{value}</p>
                <p className="font-mono-data text-[10px] text-secondary uppercase leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-red-500 uppercase">אזור מסוכן</h3>
            <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">DANGER ZONE</span>
          </div>
          <div className="bg-[#1E1E1E] border border-red-900/40 rounded-lg p-md flex flex-row-reverse items-center justify-between gap-md">
            <div className="text-right">
              <p className="font-body-md text-body-md font-semibold text-on-surface">מחק חשבון</p>
              <p className="font-mono-data text-[11px] text-secondary">פעולה זו בלתי הפיכה ותמחק את כל הנתונים שלך.</p>
            </div>
            <button className="shrink-0 border border-red-600 text-red-500 font-label-caps text-label-caps py-sm px-md rounded hover:bg-red-600 hover:text-white transition-colors">
              מחק חשבון
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}