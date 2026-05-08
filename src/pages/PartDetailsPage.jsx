import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';
import partsData from '../data/parts.json';

const STATUS_LABELS = {
  installed: { label: 'מותקן',  color: 'bg-[#00C853] text-black' },
  planned:   { label: 'מתוכנן', color: 'bg-[#FF6B00] text-black' },
  none:      { label: 'לא הותקן', color: 'bg-[#353534] text-secondary' },
};

const CATEGORY_LABELS = {
  induction: 'נשימה',
  ecu:       'תוכנה',
  brakes:    'בלמים',
  engine:    'מנוע',
  cooling:   'קירור',
  body:      'גוף',
};

export default function PartDetailsPage() {
  const { partId } = useParams();
  const navigate   = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { userParts, addToGarage } = useGarage();

  const part = partsData.find(p => p.id === partId);

  if (!part) {
    return (
      <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-[#474747]">search_off</span>
          <h2 className="font-h2 text-h2 text-on-surface">החלק לא נמצא</h2>
          <p className="font-body-md text-body-md text-secondary">המזהה <span dir="ltr" className="font-mono-data text-primary-container">{partId}</span> לא קיים בקטלוג.</p>
          <button
            onClick={() => navigate('/catalog')}
            className="mt-4 border border-primary-container text-primary-container font-label-caps text-label-caps px-6 py-3 rounded hover:bg-primary-container hover:text-[#121212] transition-colors"
          >
            חזור לקטלוג
          </button>
        </div>
      </main>
    );
  }

  const isInGarage = userParts.some(p => p.id === part.id);
  const status   = STATUS_LABELS[part.status] ?? STATUS_LABELS.none;
  const category = CATEGORY_LABELS[part.category] ?? part.category;

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-xl min-h-screen">

      {/* Sub-header: breadcrumb bar */}
      <div className="sticky top-16 md:top-0 z-30 flex flex-row-reverse justify-between items-center h-14 bg-[#121212]/80 backdrop-blur-md border-b border-[#2D2D2D] -mx-container-margin px-container-margin mb-lg">
        <div
          className="flex items-center gap-2 text-surface-variant cursor-pointer hover:text-on-background transition-colors"
          onClick={() => navigate('/catalog')}
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          <span className="font-mono-data text-mono-data">חזור לקטלוג</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#E0E0E0] opacity-70 cursor-pointer hover:text-[#FF6B00] transition-colors">share</span>
          <span className="material-symbols-outlined text-[#E0E0E0] opacity-70 cursor-pointer hover:text-[#FF6B00] transition-colors">shopping_cart</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-xl">

        {/* Vehicle Compatibility Banner */}
        {selectedVehicle && (
          <div className="flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md">
            <span className="material-symbols-outlined text-primary-container">verified</span>
            <p className="font-mono-data text-mono-data text-secondary" dir="ltr">
              תואם ל: {selectedVehicle.year} {selectedVehicle.makeName} {selectedVehicle.modelName} &nbsp;|&nbsp; {selectedVehicle.engine.code}
            </p>
          </div>
        )}

        {/* Product Hero Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-lg items-start">

          {/* RIGHT (RTL first): Image */}
          <div className="md:col-span-7 flex flex-col gap-md">
            <div className="w-full aspect-[4/3] bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden relative shadow-[0px_4px_24px_rgba(0,0,0,0.4)]">
              <div className={`absolute top-4 right-4 z-10 font-label-caps text-label-caps px-2 py-1 rounded tracking-wider uppercase shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${status.color}`}>
                {status.label}
              </div>
              <img
                src={part.imageUrl}
                alt={part.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Thumbnails row – decorative, same image */}
            <div className="grid grid-cols-4 gap-md">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`aspect-square bg-[#1E1E1E] border rounded-lg overflow-hidden cursor-pointer ${i === 0 ? 'border-2 border-[#FF6B00]' : 'border-[#2D2D2D] opacity-60 hover:opacity-100 transition-opacity'}`}
                >
                  <img src={part.imageUrl} alt={`תצוגה ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* LEFT (RTL second): Details */}
          <div className="md:col-span-5 flex flex-col gap-lg">
            <div className="flex flex-col gap-2">
              <h1 className="font-h1 text-h1 text-on-background" dir="ltr">{part.name}</h1>
              <div className="font-mono-data text-mono-data text-surface-variant tracking-wider uppercase" dir="ltr">
                SKU: {part.id.toUpperCase()}
              </div>
            </div>

            {/* Quick Spec Bento */}
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-md rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-[#2D2D2D] opacity-20 transform -rotate-12">
                  <span className="material-symbols-outlined text-[80px]">bolt</span>
                </div>
                <span className="font-label-caps text-label-caps text-surface-variant uppercase relative z-10">תוספת כוח</span>
                <span className="font-h2 text-h2 text-[#FF6B00] relative z-10">
                  {part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}
                </span>
              </div>
              <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-md rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -left-4 -bottom-4 text-[#2D2D2D] opacity-20 transform rotate-12">
                  <span className="material-symbols-outlined text-[80px]">rotate_right</span>
                </div>
                <span className="font-label-caps text-label-caps text-surface-variant uppercase relative z-10">תוספת מומנט</span>
                <span className="font-h2 text-h2 text-on-background relative z-10">
                  {part.torqueGain > 0 ? `+${part.torqueGain} Nm` : '—'}
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-[#c8c6c5] leading-relaxed">
              שיפור ביצועים מדויק לסצנת ה-Tuner. החלק עבר בדיקות על דינומטר ומוגדר לתאימות מלאה עם פלטפורמת {selectedVehicle ? `${selectedVehicle.makeName} ${selectedVehicle.modelName}` : 'הרכב שנבחר'}.
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 flex flex-col gap-3">
              {isInGarage ? (
                <button
                  disabled
                  className="w-full bg-[#2D2D2D] text-secondary font-h2 text-[20px] font-bold py-4 rounded-lg flex items-center justify-center gap-3 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  כבר קיים בגראז'
                </button>
              ) : (
                <button
                  onClick={() => addToGarage(part, 'planned')}
                  className="w-full bg-[#FF6B00] text-[#121212] font-h2 text-[20px] font-bold py-4 rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.5)] hover:bg-[#ff8533] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">garage</span>
                  הוסף לגראז'
                </button>
              )}
              <button
                onClick={() => navigate('/garage')}
                className="w-full border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-3 rounded-lg hover:bg-[#1E1E1E] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                עבור לגראז' שלי
              </button>
            </div>
          </div>
        </section>

        <hr className="border-[#2D2D2D] w-full" />

        {/* Spec Table */}
        <section className="flex flex-col gap-lg">
          <div className="flex items-baseline gap-4 border-b border-[#2D2D2D] pb-3">
            <h2 className="font-h1 text-[28px] font-bold text-[#FF6B00] m-0 leading-none">מפרט טכני</h2>
            <span className="font-mono-data text-[12px] tracking-widest text-[#474747] uppercase leading-none">
              TECHNICAL SPECIFICATIONS
            </span>
          </div>

          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#2D2D2D]">

              {/* Col 1 */}
              <div className="flex flex-col divide-y divide-[#2D2D2D]">
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">קטגוריה</span>
                  <span className="font-body-md text-body-md font-medium text-on-background">{category}</span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">תוספת כוח סוס</span>
                  <span className="font-body-md text-body-md font-medium text-[#FF6B00]" dir="ltr">
                    {part.hpGain > 0 ? `+${part.hpGain} HP` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">תוספת מומנט</span>
                  <span className="font-body-md text-body-md font-medium text-on-background" dir="ltr">
                    {part.torqueGain > 0 ? `+${part.torqueGain} Nm` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Col 2 */}
              <div className="flex flex-col divide-y divide-[#2D2D2D]">
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">סטטוס</span>
                  <span className={`font-label-caps text-label-caps px-2 py-1 rounded-sm ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">תאימות</span>
                  <span className="font-body-md text-body-md font-medium text-on-background text-left" dir="ltr">
                    {selectedVehicle
                      ? `${selectedVehicle.makeName} ${selectedVehicle.modelName}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">קוד מנוע</span>
                  <span className="font-body-md text-body-md font-medium text-on-background" dir="ltr">
                    {selectedVehicle?.engine?.code ?? '—'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="flex flex-col gap-lg">
          <div className="flex items-baseline gap-4 border-b border-[#2D2D2D] pb-3">
            <h2 className="font-h1 text-[28px] font-bold text-[#FF6B00] m-0 leading-none">התקנה ובדיקות זרימה</h2>
            <span className="font-mono-data text-[12px] tracking-widest text-[#474747] uppercase leading-none">
              INSTALLATION &amp; FLOW TESTING
            </span>
          </div>
          <div className="relative w-full aspect-video bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden group cursor-pointer shadow-[0px_8px_32px_rgba(0,0,0,0.6)]">
            <img
              src={part.imageUrl}
              alt="וידאו התקנה"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105 transform"
            />
            <div className="absolute top-0 left-0 w-full p-md bg-gradient-to-b from-[#121212]/80 to-transparent">
              <h3 className="font-h2 text-[20px] font-bold text-white drop-shadow-md">
                סדרת המוסך: התקנת {part.name}
              </h3>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)] group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-[#121212] text-[48px] ml-2"
                  style={{ fontVariationSettings: "'FILL' 1", transform: 'scaleX(1)' }}
                >
                  play_arrow
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
