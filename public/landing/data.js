/* ============================================================
   WrenchLogic — data + i18n
   Exposed on window.WL  (plain JS, no JSX)
   ============================================================ */
(function () {
  // ---------------- CARS (cascading) ----------------
  // manufacturer -> models -> years -> engines{ code, baseHp }
  // Helper — build a years[] array from a year range, all sharing one engine.
  const yearsRange = (from, to, engine) => {
    const out = [];
    for (let y = from; y <= to; y++) out.push({ y, engines: [engine] });
    return out;
  };

  const ENG = {
    s54:   { code: "S54B32", he: "S54B32 — 3.2L R6", en: "S54B32 — 3.2L I6", baseHp: 343 },
    n54:   { code: "N54B30", he: "N54B30 — Twin Turbo", en: "N54B30 — Twin Turbo", baseHp: 306 },
    n55:   { code: "N55B30", he: "N55B30 — Single Turbo", en: "N55B30 — Single Turbo", baseHp: 306 },
    b58m:  { code: "B58B30", he: "B58B30 — 3.0L Turbo", en: "B58B30 — 3.0L Turbo", baseHp: 335 },
    cjxc:  { code: "CJXC", he: "CJXC — 2.0 TFSI", en: "CJXC — 2.0 TFSI", baseHp: 296 },
    djha:  { code: "DJHA", he: "DJHA — 2.0 TFSI", en: "DJHA — 2.0 TFSI", baseHp: 306 },
    daza:  { code: "DAZA", he: "DAZA — 2.5 TFSI R5", en: "DAZA — 2.5 TFSI I5", baseHp: 394 },
    chhb:  { code: "CHHB", he: "CHHB — 2.0 TSI", en: "CHHB — 2.0 TSI", baseHp: 220 },
    dkza:  { code: "DKZA", he: "DKZA — 2.0 TSI", en: "DKZA — 2.0 TSI", baseHp: 245 },
    cjxg:  { code: "CJXG", he: "CJXG — 2.0 TSI", en: "CJXG — 2.0 TSI", baseHp: 310 },
    ej257: { code: "EJ257", he: "EJ257 — 2.5L Boxer", en: "EJ257 — 2.5L Boxer", baseHp: 305 },
    b58t:  { code: "B58B30", he: "B58B30 — 3.0L Turbo", en: "B58B30 — 3.0L Turbo", baseHp: 340 },
    fa24:  { code: "FA24", he: "FA24 — 2.4L Boxer", en: "FA24 — 2.4L Boxer", baseHp: 228 },
    k20c1: { code: "K20C1", he: "K20C1 — 2.0 VTEC Turbo", en: "K20C1 — 2.0 VTEC Turbo", baseHp: 320 },
  };

  const CARS = [
    {
      id: "bmw", he: "ב.מ.וו", en: "BMW",
      models: [
        { id: "m3e46", he: "M3", en: "M3", years: yearsRange(2001, 2006, ENG.s54) },
        { id: "335i", he: "335i", en: "335i", years: [
          ...yearsRange(2007, 2010, ENG.n54),
          ...yearsRange(2011, 2013, ENG.n55),
        ]},
        { id: "m240i", he: "M240i", en: "M240i", years: yearsRange(2017, 2021, ENG.b58m) },
      ]
    },
    {
      id: "audi", he: "אאודי", en: "Audi",
      models: [
        { id: "s3", he: "S3", en: "S3", years: [
          ...yearsRange(2015, 2017, ENG.cjxc),
          ...yearsRange(2018, 2020, ENG.djha),
        ]},
        { id: "rs3", he: "RS3", en: "RS3", years: yearsRange(2018, 2021, ENG.daza) },
      ]
    },
    {
      id: "vw", he: "פולקסווגן", en: "Volkswagen",
      models: [
        { id: "gti7", he: "Golf GTI", en: "Golf GTI", years: [
          ...yearsRange(2013, 2016, ENG.chhb),
          ...yearsRange(2017, 2020, ENG.dkza),
        ]},
        { id: "golfr7", he: "Golf R", en: "Golf R", years: yearsRange(2014, 2020, ENG.cjxg) },
      ]
    },
    {
      id: "subaru", he: "סובארו", en: "Subaru",
      models: [
        { id: "wrxsti", he: "WRX STI", en: "WRX STI", years: yearsRange(2015, 2021, ENG.ej257) },
      ]
    },
    {
      id: "toyota", he: "טויוטה", en: "Toyota",
      models: [
        { id: "supraa90", he: "GR Supra", en: "GR Supra", years: yearsRange(2020, 2023, ENG.b58t) },
        { id: "gr86", he: "GR86", en: "GR86", years: yearsRange(2022, 2024, ENG.fa24) },
      ]
    },
    {
      id: "honda", he: "הונדה", en: "Honda",
      models: [
        { id: "ctr-fk8", he: "Type R", en: "Type R", years: yearsRange(2017, 2021, ENG.k20c1) },
      ]
    },
  ];

  // ---------------- PARTS CATALOG ----------------
  // cat keys: software, induction, exhaust, intake, fuel, cooling
  const PARTS = [
    { id: "ecu1", cat: "software", hp: 55, tq: 70, diff: 1, legal: false, price: 3200,
      he: { n: "כיול ECU — Stage 1", d: "מפת מנוע מותאמת המעלה לחץ טורבו ותזמון בבטחה." },
      en: { n: "ECU Tune — Stage 1", d: "Custom engine map raising boost & timing safely." } },
    { id: "downpipe", cat: "exhaust", hp: 22, tq: 30, diff: 2, legal: false, price: 2400,
      he: { n: "דאונפייפ ספורט", d: "מוריד מגבלות זרימה אחרי הטורבו, משחרר סוסים." },
      en: { n: "Sport Downpipe", d: "Frees post-turbo flow restriction, unlocks power." } },
    { id: "intercooler", cat: "cooling", hp: 18, tq: 24, diff: 2, legal: true, price: 2900,
      he: { n: "אינטרקולר ביצועים", d: "צינון אוויר עקבי — מונע איבוד כוח בנהיגה קשה." },
      en: { n: "Performance Intercooler", d: "Consistent charge cooling under hard driving." } },
    { id: "turbo", cat: "induction", hp: 85, tq: 95, diff: 3, legal: false, price: 11800,
      he: { n: "טורבו היברידי", d: "מאלץ הזרמה אגרסיבי לעלייה דרמטית בכוח." },
      en: { n: "Hybrid Turbocharger", d: "Aggressive forced induction for a dramatic gain." } },
    { id: "intake", cat: "intake", hp: 12, tq: 14, diff: 1, legal: true, price: 1100,
      he: { n: "מערכת יניקה קרה", d: "זרימת אוויר משופרת + סאונד יניקה אגרסיבי." },
      en: { n: "Cold Air Intake", d: "Improved airflow and an aggressive intake note." } },
    { id: "exhaust", cat: "exhaust", hp: 15, tq: 16, diff: 2, legal: true, price: 4200,
      he: { n: "מערכת פליטה Cat-Back", d: "פליטה זורמת עם פסקול מירוצים אותנטי." },
      en: { n: "Cat-Back Exhaust", d: "Free-flowing exhaust with an authentic race note." } },
    { id: "injectors", cat: "fuel", hp: 30, tq: 35, diff: 3, legal: true, price: 3600,
      he: { n: "אינג'קטורים בספיקה גבוהה", d: "אספקת דלק לשדרוגי Stage 2 ומעלה." },
      en: { n: "High-Flow Injectors", d: "Fuel delivery for Stage 2+ builds." } },
    { id: "manifold", cat: "intake", hp: 20, tq: 22, diff: 2, legal: false, price: 2700,
      he: { n: "אינטק מניפולד", d: "מפזר אוויר משופר למילוי צילינדרים גבוה יותר." },
      en: { n: "Intake Manifold", d: "Improved plenum for higher cylinder fill." } },
    { id: "clutch", cat: "induction", hp: 0, tq: 60, diff: 3, legal: true, price: 5400,
      he: { n: "מצמד מחוזק", d: "מחזיק את המומנט הנוסף — חובה לבילד חזק." },
      en: { n: "Upgraded Clutch", d: "Holds the added torque — a must for big builds." } },
  ];

  const CATS = [
    { id: "all", he: "הכל", en: "All" },
    { id: "software", he: "תוכנה", en: "Software" },
    { id: "induction", he: "הזרמה", en: "Induction" },
    { id: "exhaust", he: "פליטה", en: "Exhaust" },
    { id: "intake", he: "יניקה", en: "Intake" },
    { id: "cooling", he: "צינון", en: "Cooling" },
    { id: "fuel", he: "דלק", en: "Fuel" },
  ];

  // ---------------- I18N STRINGS ----------------
  const T = {
    he: {
      dir: "rtl",
      nav: { how: "איך זה עובד", catalog: "קטלוג", garage: "הגראז'", login: "כניסה לאתר" },
      hero: {
        sub_a: "WrenchLogic —", sub_b: "Engineered Performance",
        h1a: "מהמפעל זה רק", h1b: "ההתחלה.", h1c: "כאן מתחיל הרכב שלך.",
        cta: "בוא נתחיל", cta2: "לקטלוג החלפים",
        photoLabel: "תמונת HERO — רכב ספורט בחושך + ניאון כתום",
        stats: [["+312", "סוסים נוספו בממוצע"], ["1,400+", "חלפים עם דאטה"], ["100%", "מותאם לרכב שלך"]],
        scroll: "גלול",
      },
      banner: {
        eyebrow: "ידע לפני כסף",
        a: "דע בדיוק מה כל שדרוג עושה לרכב שלך —",
        hl: "לפני שאתה מוציא שקל.",
      },
      c1: {
        num: "שלב 01", h: "בחר את הרכב שלך",
        p: "התחל בבחירת הרכב המדויק שלך — יצרן, דגם, שנה וקוד מנוע. כל המידע שתראה מותאם בדיוק לרכב שלך.",
        feats: ["התאמה מדויקת לקוד המנוע", "ללא חלקים שלא יתאימו", "נתוני סטוק אמיתיים כבסיס"],
      },
      c2: {
        num: "שלב 02", h: "גלה את הקטלוג",
        p: "עיין בחלפים אמיתיים עם נתוני ביצועים מדויקים — כמה כוח סוס כל שדרוג מוסיף, רמת קושי ההתקנה, וחוקיות בישראל.",
        feats: ["תוספת כוח (HP) מדודה לכל חלק", "רמת קושי התקנה 1–3", "סטטוס חוקיות לרחוב בישראל"],
      },
      c3: {
        num: "שלב 03", h: "בנה את הגראז' שלך",
        p: "הוסף שדרוגים לגראז' הווירטואלי, עקוב אחרי עקומת הביצועים בזמן אמת, וקבע יעד HP — וראה בדיוק מה צריך כדי להגיע אליו.",
        feats: ["סרגל ביצועים תלת-שלבי בזמן אמת", "קביעת יעד HP אישי", "מעקב עלות מצטברת לבילד"],
      },
      selector: {
        head: "בורר רכב", manufacturer: "יצרן", model: "דגם", year: "שנה", engine: "קוד מנוע",
        ph_man: "בחר יצרן", ph_model: "בחר דגם", ph_year: "בחר שנה", ph_eng: "בחר מנוע",
        readoutLab: "קוד מנוע מזוהה", emptyCode: "— — —", bhp: "כ\"ס סטוק", baseTorque: "מומנט בסיס",
      },
      catalog: {
        note_pre: "המחירים מותאמים ל", note_car: "הרכב שנבחר", filterAll: "הכל",
        addedToast: "נוסף לגראז'", add: "הוסף", added: "בגראז'",
        diffLab: "קושי", legal: "חוקי לרחוב", illegal: "מסלול בלבד",
        partImg: "תמונת מוצר",
      },
      garage: {
        head: "הגראז' שלי", parts: "חלפים", empty: "הגראז' ריק.",
        emptyHint: "הוסף שדרוגים מהקטלוג למעלה",
        nowLab: "הספק נוכחי", hpUnit: "כ\"ס", gainLab: "תוספת מהבילד",
        targetLab: "יעד הספק", goalHit: "היעד הושג! הבילד הזה מגיע ל", goalHitB: "כ\"ס.",
        goalMiss: "חסרים עוד", goalMissB: "כ\"ס ליעד — הוסף עוד שדרוגים.",
        legendStock: "סטוק", legendGain: "תוספת בילד", legendTarget: "יעד",
        totalCost: "עלות בילד", remove: "הסר",
        lockedTitle: "[ נעול ]", lockedMsg: "בחר רכב בבורר למעלה כדי לבנות את הגראז' שלך.",
      },
      footer: {
        eyebrow: "המנוע מחכה",
        h: "מוכן להתחיל לבנות?",
        cta: "כניסה לאתר",
        sig: "WrenchLogic — Engineered Performance · נתוני ביצועים לרפרנס בלבד.",
        links: ["תנאי שימוש", "פרטיות", "צור קשר"],
      },
    },
    en: {
      dir: "ltr",
      nav: { how: "How it works", catalog: "Catalog", garage: "Garage", login: "Enter site" },
      hero: {
        sub_a: "WrenchLogic —", sub_b: "Engineered Performance",
        h1a: "Factory is just", h1b: "the start.", h1c: "Your build begins here.",
        cta: "Let's begin", cta2: "Browse the catalog",
        photoLabel: "HERO IMAGE — sports car in the dark + orange neon",
        stats: [["+312", "avg HP added"], ["1,400+", "parts with data"], ["100%", "matched to your car"]],
        scroll: "Scroll",
      },
      banner: {
        eyebrow: "Knowledge before money",
        a: "Know exactly what every upgrade does to your car —",
        hl: "before you spend a shekel.",
      },
      c1: {
        num: "Step 01", h: "Pick your car",
        p: "Start by selecting your exact car — make, model, year and engine code. Everything you see is matched precisely to your car.",
        feats: ["Matched to your exact engine code", "No parts that won't fit", "Real stock figures as the baseline"],
      },
      c2: {
        num: "Step 02", h: "Explore the catalog",
        p: "Browse real parts with precise performance data — how much horsepower each upgrade adds, install difficulty, and street legality in Israel.",
        feats: ["Measured HP gain per part", "Install difficulty 1–3", "Street-legal status for Israel"],
      },
      c3: {
        num: "Step 03", h: "Build your garage",
        p: "Add upgrades to your virtual garage, track the performance curve in real time, and set an HP target — then see exactly what it takes to hit it.",
        feats: ["Real-time tri-segment performance bar", "Set a personal HP target", "Running build-cost tracking"],
      },
      selector: {
        head: "Car selector", manufacturer: "Make", model: "Model", year: "Year", engine: "Engine code",
        ph_man: "Select make", ph_model: "Select model", ph_year: "Select year", ph_eng: "Select engine",
        readoutLab: "Engine code identified", emptyCode: "— — —", bhp: "stock hp", baseTorque: "base torque",
      },
      catalog: {
        note_pre: "Pricing matched to ", note_car: "your selected car", filterAll: "All",
        addedToast: "Added to garage", add: "Add", added: "In garage",
        diffLab: "Difficulty", legal: "Street legal", illegal: "Track only",
        partImg: "Product image",
      },
      garage: {
        head: "My garage", parts: "parts", empty: "Your garage is empty.",
        emptyHint: "Add upgrades from the catalog above",
        nowLab: "Current output", hpUnit: "hp", gainLab: "build gain",
        targetLab: "Power target", goalHit: "Target reached! This build hits ", goalHitB: "hp.",
        goalMiss: "Still need ", goalMissB: "hp to target — add more upgrades.",
        legendStock: "Stock", legendGain: "Build gain", legendTarget: "Target",
        totalCost: "Build cost", remove: "Remove",
        lockedTitle: "[ LOCKED ]", lockedMsg: "Select a car in the selector above to start building your garage.",
      },
      footer: {
        eyebrow: "The engine is waiting",
        h: "Ready to start building?",
        cta: "Enter site",
        sig: "WrenchLogic — Engineered Performance · Performance figures for reference only.",
        links: ["Terms", "Privacy", "Contact"],
      },
    },
  };

  window.WL = { CARS, PARTS, CATS, T };
})();
