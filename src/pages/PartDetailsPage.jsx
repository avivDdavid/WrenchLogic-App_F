import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';
import { supabase } from '../lib/supabase';
import { fetchInstallCounts, installLabel } from '../lib/installCounts';
import NewBadge from '../components/NewBadge';
import InstallGuide from '../components/InstallGuide';

const tabCls = (active) =>
  `flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps border-b-2 transition-colors ${
    active ? 'border-primary-container text-primary-container' : 'border-transparent text-secondary hover:text-on-surface'
  }`;

const STATUS_LABELS = {
  installed: { label: 'מותקן',    color: 'bg-[#00C853] text-black'    },
  planned:   { label: 'מתוכנן',   color: 'bg-[#FF6B00] text-black'    },
  none:      { label: 'לא הותקן', color: 'bg-[#353534] text-secondary' },
};

export default function PartDetailsPage() {
  const { partId }  = useParams();
  const navigate    = useNavigate();
  const { selectedVehicle } = useVehicle();
  const { userParts, addToGarage } = useGarage();

  const [part,    setPart]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [installCounts, setInstallCounts] = useState({});
  const [detailsTab, setDetailsTab] = useState('specs'); // specs | install

  // Social proof — ONE read on page load.
  useEffect(() => { fetchInstallCounts().then(setInstallCounts); }, []);

  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('parts')
        .select('*, categories(id, name, slug)')
        .eq('id', partId)
        .single();

      if (sbError || !data) {
        setError('החלק לא נמצא');
      } else {
        // Normalize DB fields → local shape
        setPart({
          id:          data.id,
          name:        data.name,
          hpGain:      data.hp_gain       ?? 0,
          torqueGain:  data.torque_gain_nm ?? 0,
          imageUrl:    data.image_url     ?? '',
          difficulty:  data.difficulty,
          isLegal:     data.is_legal,
          category:    data.categories?.slug ?? '',
          categoryName: data.categories?.name ?? '',
          createdAt:   data.created_at,
        });
      }
      setLoading(false);
    };
    fetchPart();
  }, [partId]);

  // ── Loading ──
  if (loading) return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined text-primary-container text-[56px] animate-spin">progress_activity</span>
    </main>
  );

  // ── Not Found / Error ──
  if (error || !part) return (
    <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-[#474747]">search_off</span>
        <h2 className="font-h2 text-h2 text-on-surface">החלק לא נמצא</h2>
        <p className="font-body-md text-body-md text-secondary">המזהה <span dir="ltr" className="font-mono-data text-primary-container">{partId}</span> לא קיים בקטלוג.</p>
        <button onClick={() => navigate('/catalog')} className="mt-4 border border-primary-container text-primary-container font-label-caps text-label-caps px-6 py-3 rounded hover:bg-primary-container hover:text-[#121212] transition-colors">
          חזור לקטלוג
        </button>
      </div>
    </main>
  );

  // Determine status from garage context
  const garageEntry = userParts.find(p => p.id === part.id);
  const isInGarage  = !!garageEntry;
  const statusKey   = garageEntry?.status ?? 'none';
  const status      = STATUS_LABELS[statusKey] ?? STATUS_LABELS.none;

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-xl min-h-screen">

      {/* Breadcrumb */}
      <div className="sticky top-16 md:top-0 z-30 flex flex-row-reverse justify-between items-center h-14 bg-[#121212]/80 backdrop-blur-md border-b border-[#2D2D2D] -mx-container-margin px-container-margin mb-lg">
        <div className="flex items-center gap-2 text-surface-variant cursor-pointer hover:text-on-background transition-colors" onClick={() => navigate('/catalog')}>
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          <span className="font-mono-data text-mono-data">חזור לקטלוג</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#E0E0E0] opacity-70 cursor-pointer hover:text-[#FF6B00] transition-colors">share</span>
          <span className="material-symbols-outlined text-[#E0E0E0] opacity-70 cursor-pointer hover:text-[#FF6B00] transition-colors">shopping_cart</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-xl">

        {/* Vehicle Compatibility */}
        {selectedVehicle && (
          <div className="flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md">
            <span className="material-symbols-outlined text-primary-container">verified</span>
            <p className="font-mono-data text-mono-data text-secondary" dir="ltr">
              תואם ל: {selectedVehicle.year} {selectedVehicle.makeName} {selectedVehicle.modelName} &nbsp;|&nbsp; {selectedVehicle.engine.code}
            </p>
          </div>
        )}

        {/* Product Hero */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-lg items-start">
          {/* Image */}
          <div className="md:col-span-7 flex flex-col gap-md">
            <div className="w-full aspect-[4/3] bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden relative shadow-[0px_4px_24px_rgba(0,0,0,0.4)]">
              <div className={`absolute top-4 right-4 z-10 font-label-caps text-label-caps px-2 py-1 rounded tracking-wider uppercase shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${status.color}`}>
                {status.label}
              </div>
              {/* "New" badge — top-left corner */}
              <NewBadge createdAt={part.createdAt} className="absolute top-4 left-4 z-10" />
              <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover object-center" />
            </div>
            <div className="grid grid-cols-4 gap-md">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`aspect-square bg-[#1E1E1E] border rounded-lg overflow-hidden cursor-pointer ${i === 0 ? 'border-2 border-[#FF6B00]' : 'border-[#2D2D2D] opacity-60 hover:opacity-100 transition-opacity'}`}>
                  <img src={part.imageUrl} alt={`תצוגה ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-5 flex flex-col gap-lg">
            <div className="flex flex-col gap-2">
              <h1 className="font-h1 text-h1 text-on-background" dir="ltr">{part.name}</h1>
              <div className="font-mono-data text-mono-data text-surface-variant tracking-wider uppercase" dir="ltr">SKU: {part.id.toUpperCase()}</div>
            </div>

            {/* Social proof — prominent */}
            <div className="w-fit flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/40 text-[#FF6B00] rounded-full px-4 py-2 font-label-caps text-sm md:text-base">
              {installLabel(installCounts[part.id] ?? 0)}
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-md rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-[#2D2D2D] opacity-20 transform -rotate-12">
                  <span className="material-symbols-outlined text-[80px]">bolt</span>
                </div>
                <span className="font-label-caps text-label-caps text-surface-variant uppercase relative z-10">תוספת כוח</span>
                <span className="font-h2 text-h2 text-[#FF6B00] relative z-10">{part.hpGain > 0 ? `+${part.hpGain} HP` : '—'}</span>
              </div>
              <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-md rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -left-4 -bottom-4 text-[#2D2D2D] opacity-20 transform rotate-12">
                  <span className="material-symbols-outlined text-[80px]">rotate_right</span>
                </div>
                <span className="font-label-caps text-label-caps text-surface-variant uppercase relative z-10">תוספת מומנט</span>
                <span className="font-h2 text-h2 text-on-background relative z-10">{part.torqueGain > 0 ? `+${part.torqueGain} Nm` : '—'}</span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-[#c8c6c5] leading-relaxed">
              שיפור ביצועים מדויק לסצנת ה-Tuner. החלק עבר בדיקות על דינומטר ומוגדר לתאימות מלאה עם פלטפורמת {selectedVehicle ? `${selectedVehicle.makeName} ${selectedVehicle.modelName}` : 'הרכב שנבחר'}.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {isInGarage ? (
                <button disabled className="w-full bg-[#2D2D2D] text-secondary font-h2 text-[20px] font-bold py-4 rounded-lg flex items-center justify-center gap-3 cursor-not-allowed">
                  <span className="material-symbols-outlined">check_circle</span>
                  כבר קיים בגראז&apos;
                </button>
              ) : (
                <button onClick={() => addToGarage(part, 'planned')} className="w-full bg-[#FF6B00] text-[#121212] font-h2 text-[20px] font-bold py-4 rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.5)] hover:bg-[#ff8533] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">garage</span>
                  הוסף לגראז&apos;
                </button>
              )}
              <button onClick={() => navigate('/garage')} className="w-full border border-[#2D2D2D] text-secondary font-label-caps text-label-caps py-3 rounded-lg hover:bg-[#1E1E1E] transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                עבור לגראז&apos; שלי
              </button>
            </div>
          </div>
        </section>

        <hr className="border-[#2D2D2D] w-full" />

        {/* Tabs: Technical details / Install guide */}
        <section className="flex flex-col gap-lg">
          <div className="flex flex-row-reverse gap-2 border-b border-[#2D2D2D]" role="tablist">
            <button type="button" role="tab" aria-selected={detailsTab === 'specs'} onClick={() => setDetailsTab('specs')} className={tabCls(detailsTab === 'specs')}>
              <span className="material-symbols-outlined text-[18px]">description</span>
              פרטים טכניים
            </button>
            <button type="button" role="tab" aria-selected={detailsTab === 'install'} onClick={() => setDetailsTab('install')} className={tabCls(detailsTab === 'install')}>
              <span className="material-symbols-outlined text-[18px]">build</span>
              מדריך התקנה
            </button>
          </div>

          {detailsTab === 'install' ? (
            <InstallGuide difficulty={part.difficulty} category={part.category} isLegal={part.isLegal} />
          ) : (
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#2D2D2D]">
              <div className="flex flex-col divide-y divide-[#2D2D2D]">
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">קטגוריה</span>
                  <span className="font-body-md text-body-md font-medium text-on-background">{part.categoryName || part.category}</span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">תוספת כוח סוס</span>
                  <span className="font-body-md text-body-md font-medium text-[#FF6B00]" dir="ltr">{part.hpGain > 0 ? `+${part.hpGain} HP` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">תוספת מומנט</span>
                  <span className="font-body-md text-body-md font-medium text-on-background" dir="ltr">{part.torqueGain > 0 ? `+${part.torqueGain} Nm` : 'N/A'}</span>
                </div>
              </div>
              <div className="flex flex-col divide-y divide-[#2D2D2D]">
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">סטטוס</span>
                  <span className={`font-label-caps text-label-caps px-2 py-1 rounded-sm ${status.color}`}>{status.label}</span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">רמת קושי</span>
                  <span className="font-body-md text-body-md font-medium text-on-background" dir="ltr">{part.difficulty ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center p-md hover:bg-[#252525] transition-colors">
                  <span className="font-mono-data text-mono-data text-surface-variant">חוקי לכביש</span>
                  <span className={`font-label-caps text-label-caps px-2 py-1 rounded-sm ${part.isLegal ? 'bg-[#00C853] text-black' : 'bg-[#353534] text-secondary'}`}>
                    {part.isLegal === null ? '—' : part.isLegal ? 'כן' : 'לא'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}
        </section>

      </div>
    </main>
  );
}