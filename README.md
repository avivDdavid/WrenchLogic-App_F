<div dir="rtl">

# 🔧 WrenchLogic

**קטלוג ובוֹנֶה שדרוגי ביצועים לרכב** — פרויקט גמר אקדמי בפיתוח אתרים.

המשתמש בוחר רכב (יצרן → דגם → שנתון → מנוע), מקבל נתוני מפעל מדויקים, מדפדף בחלפי שדרוג עם רווח כוחות־סוס/מומנט ומחיר שקוף, ובונה **"גראז'"** — רשימת שדרוגים מתוכננים/מותקנים עם חישוב הספק מצטבר בזמן אמת. ממשק דו־לשוני עברית/אנגלית (RTL/LTR).

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

קובץ `.env` עם מפתחות Supabase כבר כלול בריפו, כך שלאחר `npm install` החיבור ל־DB עובד מיד.

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
│  ├─ .env                  מפתחות Supabase (URL + anon key ציבורי)
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
