import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/* =========================================================================
   WrenchLogic — Landing Page
   Self-contained marketing page. Imports only react + react-router-dom.
   Pure Tailwind classes, accent #FF6B00. Bilingual HE / EN via a toggle.
   ========================================================================= */

/* ---- all static copy lives here; t = TEXT[lang] ---------------------- */
const TEXT = {
  he: {
    // nav
    tagline: 'Engineered Performance',
    navCatalog: 'קטלוג',
    navGarage: 'הגראז\' שלי',
    navLogin: 'התחבר',
    navSignup: 'הירשם עכשיו',
    navAuthBtn: 'הפרופיל שלי',
    navGuestBtn: 'התחבר / הירשם',
    logoAria: 'WrenchLogic - דף הבית',
    // hero
    heroAlt: 'WrenchLogic רכב ביצועים',
    heroTitle1: 'מהמפעל זה רק ההתחלה.',
    heroTitle2: 'הרכב שלך מתחיל כאן.',
    heroSubtitle: 'נתונים טכניים קשיחים לכל שדרוג, בלי ניחושים, בלי בולשיט.',
    heroPrimary: 'בוא נתחיל',
    heroSecondary: 'לקטלוג החלפים',
    // stats
    stat1: 'כוחות סוס נוספו בממוצע',
    stat2: 'חלפים בקטלוג',
    stat3: 'התאמה מדויקת לסוג הרכב שלך',
    // banner
    bannerLead: 'דע בדיוק מה כל שדרוג עושה לרכב שלך ',
    bannerAccent: 'לפני שאתה מוציא שקל.',
    // how it works
    howEyebrow: 'איך זה עובד',
    howTitle: 'שלושה צעדים. אפס ניחושים.',
    // step 1
    step1Title: 'בחר את הרכב שלך',
    step1Desc: 'יצרן, דגם ושנתון, ואנחנו טוענים מיד את נתוני המפעל המדויקים והחלפים שמתאימים בדיוק לפלטפורמה שלך.',
    step1Bullets: [
      'בחירה מהירה: יצרן · דגם · שנתון',
      'נתוני מפעל מדויקים: כ"ס, מומנט וקוד מנוע',
      'התאמה אוטומטית של כל חלף בקטלוג',
    ],
    step1MockTitle: 'בחירת פלטפורמה',
    step1Make: 'יצרן',
    step1Model: 'דגם',
    step1Year: 'שנתון',
    step1Power: '220 כ"ס',
    // step 2
    step2Title: 'גלה את הקטלוג',
    step2Desc: 'כל חלף עם הרווח האמיתי בכוחות סוס ומחיר שקוף. סנן לפי קטגוריה, רמת קושי וחוקיות, ובחר חכם.',
    step2Bullets: [
      'רווח מדויק בכ"ס לכל שדרוג',
      'מחיר שקוף, ללא הפתעות',
      'סינון לפי קטגוריה, קושי וחוקיות',
    ],
    step2Badge: '+55 כ"ס',
    step2PartDesc: 'דאון-פייפ ספורט · זרימה גבוהה',
    // step 3
    step3Title: 'בנה את הגראז\' שלך',
    step3Desc: 'הוסף שדרוגים לבנייה שלך וראה את ההספק המצטבר מטפס בזמן אמת. שמור, השווה ותכנן את הצעד הבא.',
    step3Bullets: [
      'עקוב אחרי כל שדרוג בבנייה שלך',
      'הספק מצטבר מתעדכן בזמן אמת',
      'שמור, השווה ושתף את הגראז\'',
    ],
    step3PowerLabel: 'הספק נוכחי',
    step3Power: '449 כ"ס',
    step3Stock: 'מקורי: 394',
    step3Gain: '+55 כ"ס',
    step3Installed: 'הותקן',
    // categories
    catTitle: 'קטגוריות שיפורים',
    catSubtitle: 'בחר מערכת והתחל לבנות.',
    categories: [
      { name: 'יניקה',  desc: 'יותר אוויר, יותר כוח' },
      { name: 'בלמים',  desc: 'עצור חזק, נהג בביטחון' },
      { name: 'בוסט',   desc: 'לחץ טורבו מקסימלי' },
      { name: 'פליטה',  desc: 'זרימה חופשית, סאונד עוצמתי' },
      { name: 'מתלים',  desc: 'אחיזה וכיוון מושלמים' },
      { name: 'מנוע',   desc: 'הלב הפועם של הביצועים' },
      { name: 'גלגלים וצמיגים', desc: 'אחיזה וביצועים על הכביש' },
      { name: 'הפחתת משקל',     desc: 'פחות משקל, יותר זריזות' },
      { name: 'פנים',           desc: 'תא נהג ספורטיבי' },
    ],
    // footer cta
    ctaEyebrow: 'המנוע מחכה',
    ctaTitle: 'מוכן להתחיל לבנות?',
    ctaButton: 'בחר את הרכב שלך',
    // footer
    footerCredit: 'WrenchLogic · Engineered Performance · נתוני ביצועים לרפרנס בלבד.',
    footerTerms: 'תנאי שימוש',
    footerPrivacy: 'פרטיות',
    footerContact: 'צור קשר',
  },
  en: {
    tagline: 'Engineered Performance',
    navCatalog: 'Catalog',
    navGarage: 'My Garage',
    navLogin: 'Log In',
    navSignup: 'Sign Up',
    navAuthBtn: 'My Profile',
    navGuestBtn: 'Log In / Sign Up',
    logoAria: 'WrenchLogic - home',
    heroAlt: 'WrenchLogic performance car',
    heroTitle1: 'Factory spec is just the beginning.',
    heroTitle2: 'Your build starts here.',
    heroSubtitle: 'Hard technical data for every upgrade, no guessing, no BS.',
    heroPrimary: 'Let\'s start',
    heroSecondary: 'Browse the catalog',
    stat1: 'Avg. horsepower gained',
    stat2: 'Parts in catalog',
    stat3: 'Matched to your car',
    bannerLead: 'Know exactly what every upgrade does to your car ',
    bannerAccent: 'before you spend a dime.',
    howEyebrow: 'How it works',
    howTitle: 'Three steps. Zero guessing.',
    step1Title: 'Pick your car',
    step1Desc: 'Make, model and year, and we instantly load the exact factory specs and the parts that fit your platform.',
    step1Bullets: [
      'Quick pick: make · model · year',
      'Accurate factory data: HP, torque, engine code',
      'Automatic fitment for every part in the catalog',
    ],
    step1MockTitle: 'Select platform',
    step1Make: 'Make',
    step1Model: 'Model',
    step1Year: 'Year',
    step1Power: '220 HP',
    step2Title: 'Explore the catalog',
    step2Desc: 'Every part with its real horsepower gain and a transparent price. Filter by category, difficulty and legality, and choose smart.',
    step2Bullets: [
      'Exact HP gain for every upgrade',
      'Transparent pricing, no surprises',
      'Filter by category, difficulty and legality',
    ],
    step2Badge: '+55 HP',
    step2PartDesc: 'Sport downpipe · high flow',
    step3Title: 'Build your garage',
    step3Desc: 'Add upgrades to your build and watch the cumulative power climb in real time. Save, compare and plan your next move.',
    step3Bullets: [
      'Track every upgrade in your build',
      'Cumulative power updates in real time',
      'Save, compare and share your garage',
    ],
    step3PowerLabel: 'Current power',
    step3Power: '449 HP',
    step3Stock: 'Stock: 394',
    step3Gain: '+55 HP',
    step3Installed: 'Installed',
    catTitle: 'Upgrade categories',
    catSubtitle: 'Pick a system and start building.',
    categories: [
      { name: 'Intake',     desc: 'More air, more power' },
      { name: 'Brakes',     desc: 'Stop hard, drive confident' },
      { name: 'Boost',      desc: 'Maximum turbo pressure' },
      { name: 'Exhaust',    desc: 'Free flow, aggressive sound' },
      { name: 'Suspension', desc: 'Perfect grip and alignment' },
      { name: 'Engine',     desc: 'The beating heart of performance' },
      { name: 'Wheels & Tires',   desc: 'Grip and on-road performance' },
      { name: 'Weight Reduction', desc: 'Less weight, more agility' },
      { name: 'Interior',         desc: 'A sporty cockpit' },
    ],
    ctaEyebrow: 'The engine is waiting',
    ctaTitle: 'Ready to start building?',
    ctaButton: 'Pick your car',
    footerCredit: 'WrenchLogic · Engineered Performance · Performance data for reference only.',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
  },
};

/* ---- non-text category meta (image + code label, language-neutral) ---- */
const CATEGORY_META = [
  { code: 'INTAKE',     img: '/images/parts/intake.jpg' },
  { code: 'BRAKES',     img: '/images/parts/brakes.jpg' },
  { code: 'BOOST',      img: '/images/parts/boost.jpg' },
  { code: 'EXHAUST',    img: '/images/parts/exhaust.jpg' },
  { code: 'SUSPENSION', img: '/images/parts/suspension.jpg' },
  { code: 'ENGINE',     img: '/images/parts/engine.jpg' },
  { code: 'WHEELS',     img: '/images/parts/wheels.png' },
  { code: 'WEIGHT',     img: '/images/parts/weight.png' },
  { code: 'INTERIOR',   img: '/images/parts/bucket-seats.png' },
];

// Shown when a category image is missing or fails to load.
const CATEGORY_FALLBACK_IMG = '/images/parts/engine.png';

/* ---- scroll-reveal wrapper (IntersectionObserver) --------------------- */
function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={
        `transition-all duration-700 ease-out ${className} ` +
        (shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
    >
      {children}
    </div>
  );
}

/* ---- single hero statistic ------------------------------------------- */
function Stat({ value, label }) {
  // When there's no number, the label itself takes the big orange styling
  // (so the third stat matches the +312 / +1,400 numbers exactly).
  if (!value) {
    return (
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-black text-[#FF6B00] font-['Space_Grotesk'] leading-none">
          {label}
        </div>
      </div>
    );
  }
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-[#FF6B00] font-['Space_Grotesk'] leading-none">
        {value}
      </div>
      <div className="text-xs md:text-sm text-[#C0C0C0] mt-2">{label}</div>
    </div>
  );
}

/* ---- mock dropdown row (step 01) ------------------------------------- */
function MockField({ label, value, align }) {
  return (
    <div className="flex items-center justify-between bg-[#121212] border border-[#2D2D2D] rounded-[10px] px-4 py-3">
      <div className={align}>
        <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em]">{label}</div>
        <div className="text-white font-semibold" dir="ltr">{value}</div>
      </div>
      <span className="text-[#6B6B6B] text-lg leading-none">▾</span>
    </div>
  );
}

/* ---- one "how it works" step (Z-layout, alternating) ------------------ */
function StepBlock({ num, title, desc, bullets, mock, reverse = false, dir, align, shadow = 'none', numColor }) {
  return (
    <Reveal>
      {/* dir=ltr on the grid → predictable physical left / right columns */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center py-8" dir="ltr">
        {/* TEXT */}
        <div dir={dir} className={`${align} ${reverse ? 'md:order-2' : 'md:order-1'}`}>
          <div className="text-6xl md:text-7xl font-black text-[#FF6B00]/20 font-['Space_Grotesk'] leading-none" style={{ textShadow: shadow, color: numColor || undefined }}>
            {num}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mt-2 mb-3" style={{ textShadow: shadow }}>
            {title}
          </h3>
          <p className="text-[#A0A0A0] leading-relaxed mb-5">{desc}</p>
          <ul className="space-y-2.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[#E0E0E0]">
                <span className="text-[#FF6B00] mt-0.5">⚡</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* MOCK UI */}
        <div className={reverse ? 'md:order-1' : 'md:order-2'}>{mock}</div>
      </div>
    </Reveal>
  );
}

/* ---- upgrade-category tile ------------------------------------------- */
function CategoryTile({ code, name, desc, img, onClick, align }) {
  return (
    <button
      onClick={onClick}
      className={`group relative h-56 rounded-[14px] overflow-hidden border border-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] ${align}`}
    >
      <img
        src={img}
        alt={name}
        loading="lazy"
        onError={(e) => { e.target.onerror = null; e.target.src = CATEGORY_FALLBACK_IMG; }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/55 group-hover:bg-black/40 transition-colors duration-300" />
      <div className="relative h-full flex flex-col justify-end p-5">
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#FF6B00] uppercase">{code}</div>
        <h3 className="text-2xl font-bold text-white font-['Space_Grotesk'] leading-tight">{name}</h3>
        <p className="text-sm text-[#C8C8C8] mt-1">{desc}</p>
      </div>
    </button>
  );
}

/* ======================================================================= */
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme, lang, setLang } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const t = TEXT[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const align = lang === 'he' ? 'text-right' : 'text-left';
  const heroSide = lang === 'he' ? 'justify-end' : 'justify-start';

  // Light mode: a dark outline keeps the orange/white headings readable on the
  // light background; in dark mode there's no shadow (textShadow: 'none').
  const headingShadow = theme === 'light' ? '0 1px 2px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.7)' : 'none';
  const accent = theme === 'light' ? '#CC5500' : '#FF6B00';
  const stepNumColor = theme === 'light' ? 'rgba(204,85,0,0.5)' : undefined;

  /* navbar transparent → solid #1a1a1a + shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div dir={dir} className="bg-[#121212] min-h-screen font-['Inter'] text-white overflow-x-hidden">

      {/* ============================ [1] NAVBAR ======================== */}
      <nav
        className={
          'fixed top-0 inset-x-0 z-50 transition-all duration-300 ' +
          (scrolled ? 'bg-[#1a1a1a] shadow-lg shadow-black/40' : 'bg-transparent')
        }
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* logo → home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer focus:outline-none"
            aria-label={t.logoAria}
          >
            <img src="/images/Logo.png" alt="WrenchLogic" style={{ height: '40px' }} />
            <div className={`${align} leading-tight`}>
              <div className="text-white font-bold text-lg font-['Space_Grotesk'] tracking-tight">
                WrenchLogic
              </div>
              <div className="text-[10px] text-[#FF6B00] uppercase tracking-[0.2em]">
                {t.tagline}
              </div>
            </div>
          </button>

          {/* CTA + theme toggle + language */}
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'מצב כהה' : 'מצב בהיר'}
              style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.5))' }}
              className="material-symbols-outlined text-[#E0E0E0] hover:text-[#FF6B00] transition-colors cursor-pointer"
            >
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </button>
            <button
              onClick={() => navigate(user ? '/garage' : '/login')}
              className="bg-[#FF6B00] text-black font-bold px-5 py-2.5 rounded-[10px] hover:bg-[#ff8124] transition-colors"
            >
              {user ? t.navAuthBtn : t.navGuestBtn}
            </button>

            {/* HE / EN toggle */}
            <div className="flex items-center gap-1 border border-[#2D2D2D] rounded-[8px] p-0.5">
              {['he', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={
                    'px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase transition-colors cursor-pointer ' +
                    (lang === l ? 'bg-[#FF6B00] text-black' : 'text-[#E0E0E0] hover:text-[#FF6B00]')
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ============================ [2] HERO ========================== */}
      <section className="relative h-screen min-h-[620px] w-full overflow-hidden">
        <img
          src={lang === 'en' ? '/images/GTR.en.png' : '/images/GTR.png'}
          alt={t.heroAlt}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        {/* gradient: dark on the LEFT → transparent on the RIGHT */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(18,18,18,0.96) 0%, rgba(18,18,18,0.6) 38%, rgba(18,18,18,0) 78%)',
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to top, rgba(18,18,18,0.9), transparent)' }}
        />

        {/* content — pushed to the start side (dir=ltr scaffold + justify) */}
        <div className="relative z-10 h-full flex items-center" dir="ltr">
          <div className={`w-full max-w-7xl mx-auto px-6 flex ${heroSide}`}>
            <div
              dir={dir}
              className={`relative z-10 max-w-2xl ${lang === 'en' ? 'md:max-w-[45%]' : 'md:max-w-[55%]'} ${align}`}
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)' }}
            >
              <h1 className={`${lang === 'en' ? 'text-4xl md:text-5xl' : 'text-4xl md:text-6xl lg:text-7xl'} font-black leading-[1.15] font-['Space_Grotesk'] text-white`}>
                {t.heroTitle1}
                <span className="block text-[#FF6B00] mt-2">{t.heroTitle2}</span>
              </h1>
              <p className="text-lg md:text-xl text-[#D0D0D0] mt-6 max-w-xl">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <button
                  onClick={() => navigate('/vehicle-selection')}
                  className="bg-[#FF6B00] text-black font-bold text-lg px-8 py-4 rounded-[10px] hover:bg-[#ff8124] transition-colors"
                >
                  {t.heroPrimary}
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="border border-white/40 text-white font-bold text-lg px-8 py-4 rounded-[10px] hover:bg-white/10 hover:border-white transition-colors"
                >
                  {t.heroSecondary}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="max-w-7xl mx-auto px-6 pb-8">
            <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)' }}>
              {/* RTL: stat1 right · stat3 middle · stat2 left */}
              <Stat value="+312"   label={t.stat1} />
              <Stat value=""       label={t.stat3} />
              <Stat value="+1,400" label={t.stat2} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ [3] BANNER ======================== */}
      <Reveal>
        <div className="bg-[#1A1A1A] border-y border-[#2D2D2D] py-7">
          <p dir={dir} className="max-w-5xl mx-auto px-6 text-center text-xl md:text-2xl font-bold text-white font-['Space_Grotesk']" style={{ textShadow: headingShadow }}>
            {t.bannerLead}
            <span className="text-[#FF6B00]" style={{ color: accent }}>{t.bannerAccent}</span>
          </p>
        </div>
      </Reveal>

      {/* ======================= [4] HOW IT WORKS ======================= */}
      <section className="bg-[#121212] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="text-[#FF6B00] font-bold tracking-[0.2em] uppercase text-sm" style={{ color: accent, textShadow: headingShadow }}>
                {t.howEyebrow}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white font-['Space_Grotesk'] mt-3" style={{ textShadow: headingShadow }}>
                {t.howTitle}
              </h2>
            </div>
          </Reveal>

          <div className="divide-y divide-[#2D2D2D]">
            {/* STEP 01 — text start, mock end */}
            <StepBlock
              dir={dir}
              align={align}
              shadow={headingShadow}
              numColor={stepNumColor}
              num="01"
              title={t.step1Title}
              desc={t.step1Desc}
              bullets={t.step1Bullets}
              mock={
                <div dir={dir} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[14px] p-6 shadow-xl shadow-black/30">
                  <div className={`text-[11px] text-[#FF6B00] font-bold tracking-[0.15em] uppercase mb-4 ${align}`}>
                    {t.step1MockTitle}
                  </div>
                  <div className="space-y-3">
                    <MockField label={t.step1Make}  value="פולקסווגן" align={align} />
                    <MockField label={t.step1Model} value="Golf GTI"  align={align} />
                    <MockField label={t.step1Year}  value="2018"      align={align} />
                  </div>
                  <div className="mt-4 flex items-center justify-between bg-[#121212] border border-[#FF6B00]/40 rounded-[10px] px-4 py-3">
                    <span className="text-[#FF6B00] font-bold font-['Space_Grotesk']" dir="ltr">
                      {t.step1Power}
                    </span>
                    <span className="text-[#A0A0A0] text-sm" dir="ltr">EA888 · 2.0T Turbo</span>
                  </div>
                </div>
              }
            />

            {/* STEP 02 — mock start, text end */}
            <StepBlock
              reverse
              dir={dir}
              align={align}
              shadow={headingShadow}
              numColor={stepNumColor}
              num="02"
              title={t.step2Title}
              desc={t.step2Desc}
              bullets={t.step2Bullets}
              mock={
                <div dir={dir} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[14px] overflow-hidden shadow-xl shadow-black/30">
                  <div className="relative h-40">
                    <img
                      src="/images/parts/downpipe.jpg"
                      alt="Sport Downpipe"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-[#FF6B00] text-black text-xs font-bold px-2.5 py-1 rounded-[8px]">
                      {t.step2Badge}
                    </span>
                  </div>
                  <div className={`p-5 ${align}`}>
                    <h4 className="text-white font-bold text-lg font-['Space_Grotesk']" dir="ltr">
                      Sport Downpipe
                    </h4>
                    <p className="text-[#A0A0A0] text-sm mt-1">{t.step2PartDesc}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[#FF6B00] font-bold text-xl font-['Space_Grotesk']">₪3,200</span>
                      <span className="text-[#22C55E] text-sm font-semibold">+55 HP</span>
                    </div>
                  </div>
                </div>
              }
            />

            {/* STEP 03 — text start, mock end */}
            <StepBlock
              dir={dir}
              align={align}
              shadow={headingShadow}
              numColor={stepNumColor}
              num="03"
              title={t.step3Title}
              desc={t.step3Desc}
              bullets={t.step3Bullets}
              mock={
                <div dir={dir} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[14px] p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#A0A0A0] text-sm">{t.step3PowerLabel}</span>
                    <span className="text-[#FF6B00] font-black text-2xl font-['Space_Grotesk']" dir="ltr">
                      {t.step3Power}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#121212] rounded-[8px] overflow-hidden border border-[#2D2D2D]">
                    <div className="h-full bg-[#FF6B00] rounded-[8px] transition-all" style={{ width: '88%' }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#6B6B6B]">
                    <span>{t.step3Stock}</span>
                    <span dir="ltr">{t.step3Gain}</span>
                  </div>
                  <div className="mt-5 space-y-2">
                    {['Sport Downpipe', 'Cold Air Intake', 'Stage 1 Tune'].map((m) => (
                      <div key={m} className="flex items-center justify-between bg-[#121212] rounded-[8px] px-3 py-2">
                        <span className="text-[#E0E0E0] text-sm" dir="ltr">{m}</span>
                        <span className="text-[#22C55E] text-xs">✓ {t.step3Installed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ====================== [5] CATEGORIES GRID ===================== */}
      <section className="bg-[#0E0E0E] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-white font-['Space_Grotesk']" style={{ textShadow: headingShadow }}>
                {t.catTitle}
              </h2>
              <p className="text-[#A0A0A0] mt-3 text-lg" style={{ textShadow: headingShadow }}>{t.catSubtitle}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORY_META.map((c, i) => (
                <CategoryTile
                  key={c.code}
                  code={c.code}
                  img={c.img}
                  name={t.categories[i].name}
                  desc={t.categories[i].desc}
                  align={align}
                  onClick={() => navigate('/catalog')}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= [6] FOOTER CTA ========================= */}
      <section className="bg-[#1A1A1A] py-24 border-t border-[#2D2D2D]">
        <Reveal>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="text-[#FF6B00] font-bold tracking-[0.2em] uppercase text-sm" style={{ color: accent, textShadow: headingShadow }}>
              {t.ctaEyebrow}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white font-['Space_Grotesk'] mt-3" style={{ textShadow: headingShadow }}>
              {t.ctaTitle}
            </h2>
            <button
              onClick={() => navigate('/vehicle-selection')}
              className="mt-9 bg-[#FF6B00] text-black font-bold text-lg px-10 py-4 rounded-[10px] hover:bg-[#ff8124] transition-colors"
            >
              {t.ctaButton}
            </button>
          </div>
        </Reveal>
      </section>

      {/* ========================== [7] FOOTER ========================== */}
      <footer className="bg-[#121212] border-t border-[#2D2D2D] py-10">
        <div className={`max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-center ${lang === 'he' ? 'md:text-right' : 'md:text-left'}`}>
          <p className="text-sm text-[#6B6B6B]">{t.footerCredit}</p>
          <div className="flex justify-center gap-6 text-sm">
            <button onClick={() => navigate('/terms')} className="text-[#A0A0A0] hover:text-[#FF6B00] transition-colors">{t.footerTerms}</button>
            <button onClick={() => navigate('/privacy')} className="text-[#A0A0A0] hover:text-[#FF6B00] transition-colors">{t.footerPrivacy}</button>
            <button onClick={() => navigate('/contact')} className="text-[#A0A0A0] hover:text-[#FF6B00] transition-colors">{t.footerContact}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
