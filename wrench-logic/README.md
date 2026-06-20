# WrenchLogic — מערכת ניהול שיפורי ביצועים לרכב

## תיאור הפרויקט

**WrenchLogic** היא אפליקציית Web לניהול, תכנון ומעקב אחר שיפורי ביצועים לרכב (Aftermarket Tuning).

**הבעיה שהיא פותרת:** חובבי טיונינג מתקשים לדעת *מה* כל שדרוג באמת עושה לרכב הספציפי שלהם, כמה כוח הוא מוסיף, כמה הוא עולה, והאם הוא חוקי — לפני שהם מוציאים כסף. המידע מפוזר בפורומים ובניחושים. WrenchLogic מרכזת נתונים טכניים מדויקים לכל חלף, מותאמים לפלטפורמת הרכב, ומאפשרת לבנות "בילד" ולראות את ההשפעה המצטברת בזמן אמת.

**קהל היעד:** סצנת ה-Tuner/Street — בעלי רכבים ספורטיביים כגון Volkswagen Golf GTI/R, SEAT Leon Cupra, Honda Civic Type R/Si ו-Hyundai i30 N / Veloster N.

המשתמש בוחר את רכבו בצורה מדורגת (יצרן → דגם → שנתון → קוד מנוע), מקבל קטלוג חלפים מותאם אישית, ומנהל "גראז' אישי" הכולל מעקב חי אחר תוספות כוח סוס, מומנט, משקל, יחס כוח/משקל והערכת תאוצה 0–100.

---

## טכנולוגיות (Tech Stack)

| שכבה | טכנולוגיה |
|---|---|
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 |
| Backend / DB / Auth | Supabase (PostgreSQL + Auth) |
| State Management | React Context API |
| Cache מקומי | localStorage (מטמון גראז'/רכב) |
| שפה | JavaScript (JSX) |

---

## שירותים חיצוניים ואינטגרציות

| שירות | סוג | למה משמש |
|-------|-----|---------|
| Supabase Auth | אוטנטיקציה | הרשמה והתחברות משתמשים (אימייל+סיסמה) |
| Supabase PostgreSQL | בסיס נתונים | אחסון רכבים, חלפים, גראז', משוב |
| Microsoft Clarity | אנליטיקס | הקלטות סשנים ו-heatmaps |
| Sentry | מעקב שגיאות | תפיסת שגיאות JS בזמן אמת |
| Vercel Analytics | אנליטיקס | תעבורה ודפים פופולריים |

> **סטטוס אינטגרציות:** Supabase (Auth/DB) ו-Vercel Analytics משולבים בקוד. Microsoft Clarity ו-Sentry מתוכננים בארכיטקטורה וטרם חוברו בקוד.

---

## מבנה העמודים

| נתיב | תיאור |
|---|---|
| `/` | דף נחיתה שיווקי (Hero, "איך זה עובד", קטגוריות, CTA) |
| `/vehicle-selection` | בחירת רכב — אשף Cascading Dropdown בן 4 שלבים, עם לוגו יצרן |
| `/catalog` | קטלוג קטגוריות שיפורים + "הכי פופולרי" |
| `/catalog/category/:slug` | רשימת חלפים בקטגוריה (פילטרים, מיון) |
| `/catalog/:partId` | עמוד פרטי חלק — מפרט טכני, עלות/תועלת, מדריך התקנה, היכן לקנות |
| `/garage` | הגראז' האישי — מדדי ביצועים, יעד Build, השוואה קהילתית |
| `/profile` | פרופיל משתמש (מוגן) |

---

## הרצת הפרויקט (Local Setup)

```bash
# 1. כניסה לתיקיית הפרויקט
cd wrench-logic

# 2. התקנת תלויות
npm install

# 3. הפעלת שרת הפיתוח
npm run dev
```

לאחר ההרצה, פתח את הדפדפן בכתובת: `http://localhost:5173`

להגשת/תצוגת build יציב (ללא hot-reload):
```bash
npm run build
npm run preview   # מגיש את ה-build בכתובת http://localhost:4173
```

**משתני סביבה** (קובץ `.env` בתיקיית `wrench-logic`):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## רכיבים מרכזיים

- **`TriSegmentProgressBar`** — סרגל מדדים תלת-מקטעי: אפור (סטוק), כתום (נוכחי), לבן שקוף (יעד)
- **`TargetBuilder`** — בורר יעד הספק עם המלצות חלפים לפי הפער שנותר
- **`GarageBenchmark`** — השוואה קהילתית מול בוני אותו דגם
- **`FeedbackButton`** — כפתור משוב צף (נשמר לטבלת `feedback`)
- **`AppNavigation`** — ניווט צידי (Desktop) + עליון/תחתון (Mobile), RTL/LTR מלא
- **`VehicleContext` / `GarageContext` / `ThemeContext`** — ניהול מצב (רכב נבחר, גראז', שפה+ערכת נושא)

---

## מסד הנתונים (ERD)

תרשים מלא של הטבלאות והקשרים (Mermaid) נמצא בקובץ [`ERD.md`](./ERD.md).
