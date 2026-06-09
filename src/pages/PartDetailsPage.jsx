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

// Recommended installers (mock data) for the "where to buy" tab.
const INSTALLERS = [
  { name: 'מוסך טורבו ספיד',     region: 'מרכז',    city: 'תל אביב',    specialty: 'VAG מומחים',       price_range: '₪400-1,200 התקנה', rating: 4.8 },
  { name: 'גארג׳ פרפורמנס',       region: 'מרכז',    city: 'פתח תקווה',  specialty: 'טורבו ומנוע',      price_range: '₪500-2,000 התקנה', rating: 4.6 },
  { name: 'Dyno Garage חיפה',     region: 'צפון',    city: 'חיפה',       specialty: 'כיוונון ודינו',    price_range: '₪600-2,500 התקנה', rating: 4.9 },
  { name: 'מוסך הצפון טיונינג',   region: 'צפון',    city: 'קריות',      specialty: 'מערכות פליטה',    price_range: '₪350-1,500 התקנה', rating: 4.5 },
  { name: 'ספיד שופ דרום',         region: 'דרום',    city: 'באר שבע',   specialty: 'בלמים ומתלים',    price_range: '₪400-1,800 התקנה', rating: 4.7 },
  { name: 'RS מוטורס ירושלים',    region: 'ירושלים', city: 'ירושלים',    specialty: 'התקנות כלליות',   price_range: '₪450-1,600 התקנה', rating: 4.4 },
];
const INSTALLER_REGIONS = ['הכל', 'מרכז', 'צפון', 'דרום', 'ירושלים'];

// Suggested retailers per category for the "where to buy" tab.
const PURCHASE_LINKS = {
  engine: [
    { name: 'ECS Tuning',     url: 'https://www.ecstuning.com',          price_range: '₪800-5,000',   flag: '🇺🇸' },
    { name: '034Motorsport',  url: 'https://store.034motorsport.com',    price_range: '₪1,200-8,000', flag: '🇺🇸' },
    { name: 'Amazon.com',     url: 'https://www.amazon.com',             price_range: '₪400-3,000',   flag: '🌐' },
    { name: 'AliExpress',     url: 'https://www.aliexpress.com',         price_range: '₪150-1,500',   flag: '🇨🇳' },
  ],
  intake: [
    { name: 'K&N Filters Israel', url: 'https://www.knfilters.com',      price_range: '₪300-1,500',   flag: '🇮🇱' },
    { name: 'CTS Turbo',      url: 'https://ctsturbo.com',               price_range: '₪600-2,500',   flag: '🇺🇸' },
    { name: 'Amazon.com',     url: 'https://www.amazon.com',             price_range: '₪200-1,200',   flag: '🌐' },
    { name: 'AliExpress',     url: 'https://www.aliexpress.com',         price_range: '₪80-600',      flag: '🇨🇳' },
  ],
  exhaust: [
    { name: 'Milltek Sport',  url: 'https://www.millteksport.com',       price_range: '₪2,000-8,000', flag: '🇬🇧' },
    { name: 'Scorpion Exhausts', url: 'https://www.scorpionexhausts.co.uk', price_range: '₪1,800-6,000', flag: '🇬🇧' },
    { name: 'ECS Tuning',     url: 'https://www.ecstuning.com',          price_range: '₪900-4,000',   flag: '🇺🇸' },
    { name: 'Amazon.com',     url: 'https://www.amazon.com',             price_range: '₪500-3,000',   flag: '🌐' },
  ],
  brakes: [
    { name: 'Brembo Israel',  url: 'https://www.brembo.com',             price_range: '₪500-12,000',  flag: '🇮🇱' },
    { name: 'EBC Brakes',     url: 'https://www.ebcbrakes.com',          price_range: '₪300-3,000',   flag: '🇬🇧' },
    { name: 'Amazon.com',     url: 'https://www.amazon.com',             price_range: '₪200-2,000',   flag: '🌐' },
    { name: 'AliExpress',     url: 'https://www.aliexpress.com',         price_range: '₪80-800',      flag: '🇨🇳' },
  ],
  suspension: [
    { name: 'KW Suspensions', url: 'https://www.kwsuspensions.net',      price_range: '₪3,000-15,000', flag: '🇩🇪' },
    { name: 'H&R Springs',    url: 'https://www.h-r.com',                price_range: '₪800-4,000',   flag: '🇩🇪' },
    { name: 'ECS Tuning',     url: 'https://www.ecstuning.com',          price_range: '₪600-8,000',   flag: '🇺🇸' },
    { name: 'Amazon.com',     url: 'https://www.amazon.com',             price_range: '₪400-3,000',   flag: '🌐' },
  ],
  boost: [
    { name: 'Forge Motorsport', url: 'https://www.forgemotorsport.co.uk', price_range: '₪600-4,000',  flag: '🇬🇧' },
    { name: 'TurboSmart',     url: 'https://turbosmart.com',             price_range: '₪500-2,500',   flag: '🇦🇺' },
    { name: '034Motorsport',  url: 'https://store.034motorsport.com',    price_range: '₪1,000-8,000', flag: '🇺🇸' },
    { name: 'AliExpress',     url: 'https://www.aliexpress.com',         price_range: '₪200-2,000',   flag: '🇨🇳' },
  ],
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
  const [detailsTab, setDetailsTab] = useState('specs'); // specs | install | buy
  const [installerRegion, setInstallerRegion] = useState('הכל');

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
          description: data.description   ?? '',
          compatibleModels: data.compatible_models ?? null, // null = universal
          difficulty:  data.difficulty,
          isLegal:     data.is_legal,
          priceIls:    data.price_ils ?? null,
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

  // Vehicle-fit state: 'universal' | 'fit' | 'mismatch' | 'unknown'
  const modelId    = selectedVehicle?.modelId ?? null;
  const isUniversal = part.compatibleModels == null;
  const fitState =
    isUniversal                                              ? 'universal' :
    modelId && part.compatibleModels.includes(modelId)       ? 'fit'       :
    modelId                                                  ? 'mismatch'  :
                                                               'unknown';

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
              <img src={part.imageUrl} alt={`תמונת ${part.name}`} className="w-full h-full object-cover object-center" />
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-5 flex flex-col gap-lg">
            <div className="flex flex-col gap-2">
              <h1 className="font-h1 text-h1 text-on-background" dir="ltr">{part.name}</h1>
              <div className="font-mono-data text-mono-data text-surface-variant tracking-wider uppercase" dir="ltr">SKU: {part.id.toUpperCase()}</div>
              {part.isLegal === false && (
                <span className="w-fit font-label-caps text-label-caps px-3 py-1.5 rounded bg-[#7F1D1D] text-white">⚠ למסלול בלבד</span>
              )}
            </div>

            {/* Social proof — prominent */}
            <div className="w-fit flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/40 text-[#FF6B00] rounded-full px-4 py-2 font-label-caps text-sm md:text-base">
              {installLabel(installCounts[part.id] ?? 0)}
            </div>

            {/* Vehicle compatibility verdict */}
            {fitState === 'fit' && (
              <div className="flex flex-row-reverse items-center gap-2 bg-[#00C853]/15 border border-[#00C853]/40 text-[#00C853] rounded-lg px-4 py-3 font-body-md text-body-md font-semibold" dir="rtl">
                <span>✓</span>
                <span>מאומת כמתאים ל-{selectedVehicle.modelName} שלך</span>
              </div>
            )}
            {fitState === 'universal' && (
              <div className="flex flex-row-reverse items-center gap-2 bg-[#2D2D2D] border border-[#474747] text-secondary rounded-lg px-4 py-3 font-body-md text-body-md" dir="rtl">
                <span>⚙</span>
                <span>חלף אוניברסלי — מתאים לרוב הרכבים</span>
              </div>
            )}
            {fitState === 'mismatch' && (
              <div className="flex flex-row-reverse items-center gap-2 bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-[#FF6B00] rounded-lg px-4 py-3 font-body-md text-body-md font-semibold" dir="rtl">
                <span>⚠</span>
                <span>החלף הזה לא מאומת לרכב שלך</span>
              </div>
            )}

            {/* Track-only legal warning */}
            {part.isLegal === false && (
              <div className="bg-[#FEF2F2] border-2 border-red-600 rounded-lg px-4 py-3 text-right" dir="rtl">
                <p className="font-body-md text-body-md font-bold text-red-800 mb-1">⚠️ חלף זה מיועד לשימוש במסלול בלבד</p>
                <p className="font-body-md text-[13px] text-red-900 leading-relaxed">
                  התקנה על רכב המיועד לכביש עלולה לפסול את הרכב לטסט ולבטל את הביטוח.
                  WrenchLogic אינה אחראית לשימוש החלף בניגוד לחוק.
                </p>
              </div>
            )}

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

            <p className="font-body-md text-body-md text-[#c8c6c5] leading-relaxed" dir="rtl">
              {part.description || 'מידע נוסף על החלף יהיה זמין בקרוב'}
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

            {/* Cost / benefit calculator */}
            {(() => {
              const price = part.priceIls;
              const hp = part.hpGain;
              const hpPerK = hp > 0 && price ? (hp / price * 1000) : null;
              const costPerHp = hp > 0 && price ? (price / hp) : null;

              const hpRatioColor =
                hpPerK == null ? 'text-secondary' :
                hpPerK > 20 ? 'text-[#00C853]' :
                hpPerK > 10 ? 'text-[#FF6B00]' :
                              'text-secondary';

              let verdict = null;
              if (hp > 0 && price) {
                if (costPerHp <= 200)      verdict = { text: '🟢 כדאיות גבוהה',  color: 'text-[#00C853]' };
                else if (costPerHp <= 500) verdict = { text: '🟠 כדאיות בינונית', color: 'text-[#FF6B00]' };
                else                       verdict = { text: '🔴 כדאיות נמוכה',   color: 'text-red-400' };
              } else if (hp === 0) {
                verdict = { text: '⚙️ שיפור איכותי — לא ניתן למדידת HP', color: 'text-secondary' };
              }

              return (
                <div className="bg-[#1A1A1A] border border-[#FF6B00]/40 rounded-lg p-5 mt-2 text-right space-y-3" dir="rtl">
                  <h3 className="font-h2 text-h2 text-on-surface">💰 עלות / תועלת</h3>

                  {/* מחיר */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-body-md text-body-md text-secondary">מחיר משוער</span>
                    <span className="font-mono-data text-body-md text-white font-medium" dir="ltr">
                      {price ? `₪${price.toLocaleString('en-US')}` : 'מחיר לפי פנייה'}
                    </span>
                  </div>

                  {/* HP/₪ */}
                  {hpPerK != null && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body-md text-body-md text-secondary">⚡ יחס HP/₪</span>
                      <span className={`font-mono-data text-body-md font-medium ${hpRatioColor}`} dir="rtl">
                        {hpPerK.toFixed(2)} HP לכל ₪1,000
                      </span>
                    </div>
                  )}

                  {/* כדאיות */}
                  {verdict && (
                    <div className="flex items-center justify-between gap-2 border-t border-[#2D2D2D] pt-3">
                      <span className="font-body-md text-body-md text-secondary">דירוג כדאיות</span>
                      <span className={`font-body-md text-body-md font-bold ${verdict.color}`}>{verdict.text}</span>
                    </div>
                  )}
                </div>
              );
            })()}
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
            <button type="button" role="tab" aria-selected={detailsTab === 'buy'} onClick={() => setDetailsTab('buy')} className={tabCls(detailsTab === 'buy')}>
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              היכן לקנות
            </button>
          </div>

          {detailsTab === 'install' ? (
            <InstallGuide difficulty={part.difficulty} category={part.category} isLegal={part.isLegal} />
          ) : detailsTab === 'buy' ? (
            <div className="flex flex-col gap-xl" dir="rtl">

              {/* ── Section 1: Online retailers ── */}
              <div className="flex flex-col gap-md">
                <h3 className="font-h2 text-h2 text-on-surface border-b border-[#2D2D2D] pb-base">🛒 רכישה אונליין</h3>
                <div className="flex flex-col gap-3">
                  {(PURCHASE_LINKS[part.category] ?? PURCHASE_LINKS.engine).map((vendor) => (
                    <div key={vendor.name} className="flex flex-row-reverse items-center justify-between gap-md bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md hover:border-[#FF6B00]/50 transition-colors">
                      <div className="flex flex-row-reverse items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0" aria-hidden="true">{vendor.flag}</span>
                        <div className="text-right min-w-0">
                          <a
                            href={vendor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body-md text-body-md font-semibold text-on-surface hover:text-[#FF6B00] transition-colors"
                            dir="ltr"
                          >
                            {vendor.name}
                          </a>
                          <p className="font-mono-data text-[12px] text-secondary" dir="ltr">{vendor.price_range}</p>
                        </div>
                      </div>
                      <a
                        href={vendor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 bg-[#FF6B00] text-[#121212] font-label-caps text-label-caps px-4 py-2 rounded hover:bg-[#ff8533] transition-colors"
                      >
                        בקר באתר ←
                      </a>
                    </div>
                  ))}
                </div>
                <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed text-right">
                  * המחירים הם הערכה בלבד ועשויים להשתנות.
                  WrenchLogic אינה קשורה לספקים אלה ואינה אחראית לזמינות או מחיר.
                </p>
              </div>

              {/* ── Section 2: Recommended installers ── */}
              <div className="flex flex-col gap-md">
                <h3 className="font-h2 text-h2 text-on-surface border-b border-[#2D2D2D] pb-base">🔧 מוסכים מומלצים להתקנה</h3>

                {/* Region filter */}
                <div className="flex flex-row-reverse flex-wrap gap-2">
                  {INSTALLER_REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setInstallerRegion(r)}
                      className={`font-label-caps text-[11px] px-3 py-1.5 rounded border transition-colors ${
                        installerRegion === r
                          ? 'bg-[#2D2D2D] border-primary-container text-primary-container'
                          : 'bg-[#2D2D2D] border-[#3D3D3D] text-secondary hover:border-[#555] hover:text-on-surface'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Installer cards */}
                <div className="flex flex-col gap-3">
                  {INSTALLERS
                    .filter(g => installerRegion === 'הכל' || g.region === installerRegion)
                    .map(garage => (
                      <div key={garage.name} className="flex flex-row-reverse items-start justify-between gap-md bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md hover:border-[#FF6B00]/40 transition-colors">
                        <div className="flex flex-col gap-1 text-right min-w-0 flex-1">
                          <p className="font-body-md text-body-md font-bold text-on-surface">{garage.name}</p>
                          <p className="font-mono-data text-[12px] text-secondary">
                            📍 {garage.region} — {garage.city}
                          </p>
                          <p className="font-mono-data text-[12px] text-[#FF6B00]">{garage.specialty}</p>
                          <p className="font-mono-data text-[12px] text-secondary">{garage.price_range}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-mono-data text-[13px] text-[#FFD700] whitespace-nowrap">
                            ⭐ {garage.rating.toFixed(1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => alert('פרטי יצירת קשר יהיו זמינים בקרוב')}
                            className="font-label-caps text-label-caps px-3 py-1.5 rounded border border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-[#121212] transition-colors whitespace-nowrap text-[11px]"
                          >
                            צור קשר
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <p className="font-mono-data text-[11px] text-[#6B6B6B] leading-relaxed border-t border-[#2D2D2D] pt-md text-right">
                  * המוסכים והמחירים הם הדגמה בלבד. WrenchLogic אינה ממליצה או קשורה למוסכים אלה.
                </p>
              </div>

            </div>
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