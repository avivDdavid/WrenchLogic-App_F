// Manufacturer names are stored in Hebrew in cars.json. This maps them to
// English for EN mode. Model names (Golf GTI, Veloster N, …) are already in
// Latin script so they're shown as-is in both languages.
const MFR_EN = {
  'פולקסווגן': 'Volkswagen',
  'ב.מ.וו':    'BMW',
  'אאודי':     'Audi',
  'יונדאי':    'Hyundai',
  'הונדה':     'Honda',
  'סיאט':      'Seat',
  'טויוטה':    'Toyota',
  'סובארו':    'Subaru',
};

// Localized manufacturer name. In EN, returns the English name when known,
// otherwise falls back to the original (Hebrew) value.
export const displayMfr = (name, lang) =>
  lang === 'en' ? (MFR_EN[name] || name) : name;

// Part name/description are stored in Hebrew (name/description) with optional
// English columns (name_en/description_en) from Supabase. In EN, prefer the
// English column, falling back to the Hebrew value when it's missing. Works on
// both raw rows and normalized objects as long as those carry name_en/description_en.
export const partName = (part, lang) =>
  lang === 'en' ? (part?.name_en || part?.name || '') : (part?.name || '');
export const partDesc = (part, lang) =>
  lang === 'en' ? (part?.description_en || part?.description || '') : (part?.description || '');
