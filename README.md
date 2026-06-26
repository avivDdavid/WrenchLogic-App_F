<div dir="rtl">

# 🔧 WrenchLogic

**קטלוג ובוֹנֶה שדרוגי ביצועים לרכב** — פרויקט גמר אקדמי בפיתוח אתרים.

המשתמש בוחר רכב (יצרן → דגם → שנתון → מנוע), מקבל נתוני מפעל מדויקים, מדפדף בחלפי שדרוג עם רווח כוחות־סוס/מומנט ומחיר שקוף, ובונה **"גראז'"** — רשימת שדרוגים מתוכננים/מותקנים עם חישוב הספק מצטבר בזמן אמת. ממשק דו־לשוני עברית/אנגלית (RTL/LTR).

### 🌐 הפרויקט החי
👈 **[wrench-logic-app-f.vercel.app](https://wrench-logic-app-f.vercel.app/)** — מתארח ב-Vercel.

---

## 💡 הבעיה שאנחנו פותרים

חובבי רכב שרוצים לשדרג ביצועים נתקלים בקיר: **הם לא יודעים אילו חלקים מתאימים לרכב הספציפי שלהם, כמה כוח כל שדרוג באמת יוסיף, כמה הוא עולה, והאם הוא חוקי לכביש** — לפני שהם מוציאים כסף. המידע מפוזר בין פורומים, קבוצות פייסבוק וניחושים, ואין מקור אחד אמין שמחבר *חלף → רכב → תוספת ביצועים מדידה*. התוצאה: קונים חלקים לא תואמים, מבזבזים כסף, ומתקשים לתכנן "בילד" קוהרנטי.

WrenchLogic מרכזת נתונים טכניים מדויקים לכל חלף, מסננת אותם לפי פלטפורמת הרכב, ומציגה את ההשפעה המצטברת (כ"ס, מומנט, משקל) בזמן אמת.

## 🎯 קהל היעד

- **חובבי טיונינג** מתחילים ומתקדמים שרוצים לתכנן שדרוגים בצורה מושכלת.
- **בעלי רכבים ספורטיביים** (Golf GTI/R, SEAT Leon Cupra, Honda Civic Type R/Si, Hyundai i30 N / Veloster N) שמחפשים לשפר ביצועים.
- מי שרוצה **לראות מה ייצא לו מהכסף** לפני שהוא מזמין חלף.

## ⚔️ מתחרים ובידול

| הפתרון הקיים | החיסרון |
|--------------|---------|
| פורומים וקבוצות פייסבוק | מידע סובייקטיבי, מפוזר ולא מותאם לרכב הספציפי |
| חיפוש ידני בגוגל | מפרך, ללא השוואת ביצועים אובייקטיבית |
| חנויות חלקים אונליין | מוכרות חלקים אך לא מסבירות תוספת כוח או תאימות |

**במה WrenchLogic שונה / טוב יותר:**
- ✅ **מותאם לרכב הספציפי** — סינון חלפים לפי יצרן/דגם/מנוע.
- ✅ **נתוני כוח אמיתיים** — תוספת כ"ס/מומנט מדידה לכל חלף, לא שיווק.
- ✅ **גראז' וירטואלי** — בונים "בילד" ורואים את ההספק המצטבר בזמן אמת.
- ✅ **הצעד הבא המומלץ** — המערכת ממליצה מה כדאי לשדרג בהמשך.

---

## 🚀 הרצה מהירה

> ⚠️ **שימו לב:** קוד האפליקציה נמצא בתוך תת־התיקייה **`wrench-logic/`** ולא בשורש.

```bash
# 1. שכפול הריפו
git clone https://github.com/avivDdavid/WrenchLogic-App_F.git
cd WrenchLogic-App_F/wrench-logic

# 2. התקנת תלויות (חובה — node_modules לא נשמר בגיט)
npm install

# 3. הרצת שרת הפיתוח
npm run dev
```

האתר יעלה בכתובת `http://localhost:5173`.

> 🔑 **משתני סביבה:** קובץ `.env` אינו נכלל בריפו מטעמי אבטחה. לפני ההרצה צרו קובץ `wrench-logic/.env` עם:
> ```
> VITE_SUPABASE_URL=...
> VITE_SUPABASE_ANON_KEY=...
> ```

### פקודות נוספות
| פקודה | פעולה |
|--------|--------|
| `npm run dev` | שרת פיתוח (Vite) |
| `npm run build` | בנייה לפרודקשן → `dist/` |
| `npm run preview` | תצוגה מקדימה של ה־build |
| `npm run lint` | בדיקת ESLint |

### חשבון דמו
```
demo@wrenchlogic.com  /  demo1234
```

---

## 🛠️ Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Build | Vite 8 |
| UI | React 19 + react-dom |
| Routing | react-router-dom 7 |
| עיצוב | Tailwind CSS 3.4 + PostCSS + autoprefixer |
| Backend | Supabase — Auth + PostgreSQL + RLS + RPC |
| Lint | ESLint 10 |
| גופנים | Inter + Space Grotesk, Material Symbols |

---

## 🔌 שירותים חיצוניים

| שירות | סוג | למה משמש |
|-------|-----|---------|
| Supabase Auth | אוטנטיקציה | הרשמה והתחברות משתמשים (מייל+סיסמה) עם RLS |
| Supabase PostgreSQL | בסיס נתונים | אחסון רכבים, חלפים, גראז', פרופילים, משוב |
| Microsoft Clarity | אנליטיקס | הקלטות סשנים ו-heatmaps |
| Sentry | מעקב שגיאות | תפיסת שגיאות JS בזמן אמת |
| Vercel Analytics | אנליטיקס | תעבורה ודפים פופולריים |

> Supabase ו-Vercel Analytics משולבים בקוד; Microsoft Clarity ו-Sentry מתוכננים בארכיטקטורה.

---

## 📂 מבנה הפרויקט

```
WrenchLogic-App_F/
├─ wrench-logic/            ← אפליקציית React (כאן רצים npm install / npm run dev)
│  ├─ src/
│  │  ├─ pages/             דפים: Landing, Login, VehicleSelection, Catalog,
│  │  │                     CategoryView, PartDetails, MyGarage, UserProfile
│  │  ├─ components/        רכיבים: ניווט, גראז', מדריך התקנה, בונה יעד ועוד
│  │  ├─ context/           Auth / Vehicle / Garage / Theme (React Context)
│  │  ├─ lib/               אתחול Supabase, ספירת התקנות, פרופיל, תמונות
│  │  ├─ data/              cars.json (עץ רכבים), parts.json (fallback)
│  │  └─ layouts/           MainLayout (ניווט + Outlet)
│  ├─ public/images/        תמונות רכבים וחלפים
│  ├─ .env                  מפתחות Supabase (לא בריפו — יוצרים מקומית)
│  └─ package.json
│
├─ *.sql                    סקריפטי Supabase (להרצה ב־SQL Editor)
├─ .gitignore
└─ README.md
```

---

## 🗄️ בסיס הנתונים (Supabase)

הרכב נבנה מקובץ מקומי (`src/data/cars.json`); התוכן הדינמי מגיע מ־Supabase.

**טבלאות עיקריות:**
- `parts` — חלפי שדרוג (`id`, `name`, `category_id`, `hp_gain`, `torque_gain_nm`, `difficulty`...)
- `categories` — 6 קטגוריות: engine, intake, exhaust, brakes, suspension, boost
- `garage_entries` — הגראז' של המשתמש (פר־רכב, מוגן ב־RLS)

**סקריפטי SQL בשורש הריפו** — מורצים ידנית ב־Supabase Dashboard → SQL Editor:
| קובץ | מטרה |
|------|------|
| `seed_parts.sql`, `more_parts.sql` | זריעת חלפים |
| `add_prices.sql`, `add_descriptions.sql` | מחירים ותיאורים |
| `update_images.sql`, `update_part_images.sql` | תמונות חלפים |
| `compatible_models.sql`, `vehicles_update.sql` | תאימות רכבים |
| `enable_public_read.sql` | קריאה ציבורית לאורחים (RLS) |
| `install_counts_view.sql` | view לספירת התקנות (social proof) |
| `benchmark_rpc.sql` | פונקציית השוואה מול ממוצע הקהילה |
| `new_parts_badge.sql`, `fix_vehicle_id.sql` | תיקונים נקודתיים |

📊 **תרשים ישויות-קשרים מלא (ERD):** ראו [`wrench-logic/ERD.md`](wrench-logic/ERD.md) — כל 6 הטבלאות (`profiles`, `vehicles`, `categories`, `parts`, `garage_entries`, `feedback`) והקשרים ביניהן בתרשים Mermaid.

---

## ✨ פיצ'רים עיקריים

- 🚗 **בחירת רכב מדורגת** עם נתוני מפעל מדויקים
- 📦 **קטלוג חלפים** ב־6 קטגוריות + סקשן "הכי פופולרי"
- 🔧 **גראז' אישי** — תכנון/התקנה של שדרוגים עם הספק מצטבר בזמן אמת
- 🎯 **בונה יעד** — הגדרת כ"ס מטרה והמלצת חלפים לסגירת הפער
- 📊 **Benchmark** — "איפה אתה עומד?" מול ממוצע הקהילה
- 🔐 **אימות** — אימייל+סיסמה, הרשמה מורחבת (שם, טלפון, תמונת פרופיל), חשבון דמו
- 🌗 **מצב בהיר/כהה** + ממשק דו־לשוני HE/EN (RTL/LTR)
- 🎬 **מדריכי התקנה** עם סרטוני YouTube לכל חלף

---

## 📝 רישיון

פרויקט אקדמי — לשימוש לימודי בלבד.

</div>
