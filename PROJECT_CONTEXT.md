# WrenchLogic — מסמך Handoff

> מסמך הקשר מלא. פתח שיחה חדשה, תן את הקובץ הזה, והמשך מאיפה שעצרת בלי לאבד הקשר.
> עודכן: 2026-06-10

---

## 1. זהות הפרויקט

- **שם:** WrenchLogic
- **מהות:** פרויקט גמר אקדמי (פיתוח אתרים).
- **מטרה:** קטלוג שדרוגי ביצועים לרכב. המשתמש בוחר רכב (יצרן→דגם→שנתון→מנוע), מקבל נתוני מפעל מדויקים, מדפדף בחלפים עם רווח כ"ס/מומנט ומחיר שקוף, ובונה "גראז'" — רשימת שדרוגים מתוכננים/מותקנים עם הספק מצטבר בזמן אמת.
- **קהל יעד:** חובבי רכב/טיונרים בישראל. עברית, RTL.
- **סטטוס:** MVP פעיל. ליבה עובדת end-to-end (בחירת רכב, קטלוג, גראז' עם שמירה ל-Supabase, אימות). דף נחיתה שיווקי חדש דו-לשוני נבנה לאחרונה.
- **דדליין:** (לא תועד במסמך — מלא ידנית)

---

## 2. Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Build | Vite ^8.0 |
| UI | React ^19.2 + react-dom |
| Routing | react-router-dom ^7.15 |
| Styling | Tailwind CSS ^3.4.19 (JIT) + PostCSS + autoprefixer |
| Backend | Supabase (`@supabase/supabase-js` ^2.106) — Auth + Postgres + RLS + RPC |
| Lint | ESLint ^10 (react-hooks, react-refresh) |
| גופנים | Inter + Space Grotesk (Google Fonts), Material Symbols (CDN) |

- **שורש האפליקציה:** תיקיית `wrench-logic/` (לא שורש ה-repo).
- **משתני סביבה:** `wrench-logic/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **בנייה:** `npm run build` (מתוך `wrench-logic/`). dev: `npm run dev`.

---

## 3. מבנה הפרויקט (`wrench-logic/src/`)

```
main.jsx                  כניסה — מרנדר <App/>
App.jsx                   נסטינג providers + הגדרת כל ה-routes
index.css                 גלובלי + overrides של מצב בהיר (html.light ...)

lib/
  supabase.js             אתחול קליינט Supabase מ-env
  installCounts.js        ספירת כמה פעמים כל חלף נוסף לגראז' (social proof)
  recentVehicles.js       היסטוריית רכבים אחרונים (localStorage)

context/
  AuthContext.jsx         session/user + signOut. undefined=טוען, null=אורח, object=מחובר
  VehicleContext.jsx      selectedVehicle (נבנה מ-cars.json). cache ל-localStorage רק למחוברים
  GarageContext.jsx       userParts + add/remove/updateStatus. גראז' פר-רכב, sync ל-Supabase
  ThemeContext.jsx        light/dark — toggle class על <html>. דיפולט: בהיר

layouts/
  MainLayout.jsx          עוטף את רוב הדפים ב-AppNavigation + <Outlet/>

components/
  AppNavigation.jsx       סיידבר דסקטופ + טופ/בוטום בר מובייל. לוגו לחיץ, כפתור auth דינמי, ThemeToggle
  ProtectedRoute.jsx      מפנה ל-/login אם אין session
  CategoryCard.jsx        כרטיס קטגוריה בקטלוג
  TriSegmentProgressBar   בר התקדמות בסיס/נוכחי/יעד
  NewBadge.jsx            תג "חדש" לחלף (לפי created_at)
  HelpHint.jsx            tooltip עזרה
  InstallGuide.jsx        מדריך התקנה לפי קושי/קטגוריה/חוקיות
  GarageBenchmark.jsx     "איפה אתה עומד?" — RPC get_benchmark_stats מול ממוצע הקהילה
  TargetBuilder.jsx       הגדרת יעד כ"ס + המלצת חלפים לסגירת הפער
  NextStep.jsx            "הצעד הבא המומלץ" — עד 3 חלפים שלא בגראז'

pages/
  LandingPage.jsx         דף נחיתה שיווקי standalone, דו-לשוני HE/EN, scroll-reveal
  LoginPage.jsx           tabs התחבר/הירשם, דמו, OAuth (Google/Facebook)
  VehicleSelectionPage    בחירת רכב מדורגת מ-cars.json
  CatalogPage.jsx         6 קטגוריות + פופולרי + באנר רכב
  CategoryViewPage.jsx    רשימת חלפים בקטגוריה
  PartDetailsPage.jsx     פרטי חלף + הוספה לגראז'
  MyGaragePage.jsx        הגראז' + אנליטיקה (benchmark/target/next-step)
  UserProfilePage.jsx     פרופיל משתמש (מוגן)

data/
  cars.json               עץ רכבים: יצרן→דגם→שנתון→מנוע (id, code, displacement, stockHp, stockTorque)
  parts.json              fallback מקומי לחלפים

דף נחיתה/                  קוד דף נחיתה ישן (לא בשימוש, נתיב עברי)
```

---

## 4. מודל הנתונים — Supabase

פרויקט: `rldclhemvhfluormbnca`

### טבלאות
- **`garage_entries`** — `id, user_id (uuid), vehicle_id (int, nullable), part_id (text), status, created_at, updated_at`.
  האפליקציה שומרת `{user_id, part_id, status, vehicle_id}`. **הגראז' הוא פר-רכב** — מסונן לפי `vehicle_id = selectedVehicle.engine.id`.
- **`parts`** — `id` TEXT (לדוגמה `wl-tur-001`), `name`, `category_id` (UUID→categories), `hp_gain`, `torque_gain_nm`, `image_url`, `difficulty`, `compatible_models`, `created_at`.
- **`categories`** — 6 slugs קיימים: `engine, intake, exhaust, brakes, suspension, boost`.
- **`vehicles`** — ריקה, **לא בשימוש**. הרכב נבנה מ-`src/data/cars.json` המקומי.

### RLS
- ברירת מחדל: טבלאות תוכן דורשות session מאומת → anon REST מחזיר `[]`.
- **`garage_entries`** — RLS מאפשר למשתמש insert/select/delete של השורות שלו בלבד. הגראז' עובד מהאפליקציה.
- **INSERT ל-`categories` ו-`parts` חסום ב-RLS גם למחוברים (`42501`)** → seed דרך SQL editor בלבד.
- **GUEST CATALOG GOTCHA:** משעשו `/catalog` + `/garage` ציבוריים, אורחים נחסמו ע"י RLS ו-SELECT החזיר `[]` (HTTP 200) → קטלוג נראה ריק. **תיקון:** policy `FOR SELECT TO anon, authenticated USING (true)` על `categories` ו-`parts` (מידע רפרנס ציבורי; כתיבה נשארת נעולה). חובה להריץ ב-SQL editor.

### RPC
- **`get_benchmark_stats`** (SECURITY DEFINER, עוקף RLS) — משווה HP מותקן של המשתמש מול ממוצע כל הבונים. נצרך ב-`GarageBenchmark.jsx`. אם לא deployed → הקומפוננטה מציגה hint SQL.

### קבצי SQL ב-repo
- `wrench-logic/supabase_fixes.sql` — seed קטגוריות/חלפים + `ALTER ... DROP NOT NULL` (כבר הוחל).
- מוזכרים גם `enable_public_read.sql`, `install_counts_view.sql`, RPC ל-benchmark — ייתכן שצריך deploy ידני ב-SQL editor.

### דמו
`demo@wrenchlogic.com` / `demo1234`

---

## 5. פיצ'רים

### ✅ גמור
- בחירת רכב מדורגת (cars.json) + persistence למחוברים
- קטלוג 6 קטגוריות + fallback מקומי כשה-DB ריק
- גראז' פר-רכב: הוספה/הסרה/שינוי סטטוס + sync ל-Supabase (אומת end-to-end)
- אימות: אימייל+סיסמה, דמו, OAuth (Google/Facebook), tabs התחבר/הירשם + אימות סיסמה
- מצב בהיר/כהה (toggle, דיפולט בהיר)
- דף נחיתה שיווקי standalone דו-לשוני (HE/EN) עם scroll-reveal
- "הכי פופולרי" בקטלוג, תג "חדש" לחלפים
- ניווט auth-דינמי (לוגו לחיץ → `/`, כפתור פרופיל/התחברות לפי מצב)

### 🟡 חלקי / תלוי-deploy
- `GarageBenchmark` — תלוי ב-RPC `get_benchmark_stats` (צריך deploy)
- `installCounts` — כרגע סופר רק שורות המשתמש (RLS); לספירה חוצת-משתמשים צריך view ציבורי
- `TargetBuilder` / `NextStep` — קוראים מ-`parts` ב-Supabase; תלויים בכך שהקטלוג seeded

### 🔲 TODO
- מילוי deadline במסמך
- וידוא שכל קבצי ה-SQL (public read, benchmark RPC, counts view) הורצו בפרודקשן
- code-splitting (אזהרת chunk >500kB)

---

## 6. מערכת עיצוב

- **צבעים:** רקע `#121212`, כרטיסים `#1E1E1E`/`#2D2D2D`, accent כתום `#FF6B00` (hover `#ff8124`), טקסט `#E0E0E0`, גבולות `#2D2D2D`.
- **פלטת בהיר:** רקע `#F5F5F5`, כרטיסים `#FFFFFF`, טקסט `#1A1A1A`, משני `#555`, גבולות `#DDD`. accent נשאר כתום.
- **גופנים:** Inter (גוף), Space Grotesk (כותרות/מספרים), Material Symbols (אייקונים).
- **כיוון:** RTL ברירת מחדל. אנגלית בדף הנחיתה עוברת ל-LTR דינמית.
- **theming:** האפליקציה כתובה ב-hard-coded arbitrary classes (`bg-[#1E1E1E]` וכו'). מצב בהיר = overrides ב-`index.css` תחת `html.light .bg-\[\#1E1E1E\]` (specificity גבוה יותר מנצח). **חשוב:** Tailwind שומר case מקורי של hex בסלקטור — overrides חייבים להתאים ל-case.
- **קונבנציה:** RTL עם `flex-row-reverse`. ערכים טכניים (כ"ס, קודי מנוע, אימייל) עטופים ב-`dir="ltr"`.

---

## 7. מפת Routing

| נתיב | דף | Layout | הגנה |
|------|-----|--------|------|
| `/` | LandingPage | standalone | ציבורי |
| `/login` | LoginPage | standalone | ציבורי (מפנה ל-/catalog אם מחובר) |
| `/vehicle-selection` | VehicleSelectionPage | MainLayout | ציבורי |
| `/catalog` | CatalogPage | MainLayout | ציבורי |
| `/catalog/category/:categoryId` | CategoryViewPage | MainLayout | ציבורי |
| `/catalog/:partId` | PartDetailsPage | MainLayout | ציבורי |
| `/garage` | MyGaragePage | MainLayout | ציבורי (גראז' אורח in-memory) |
| `/profile` | UserProfilePage | MainLayout | 🔒 ProtectedRoute |

נסטינג providers: `ThemeProvider > AuthProvider > VehicleProvider > GarageProvider > BrowserRouter`.

---

## 8. באגים ידועים ונקודות סיכון

- **נתיב עברי שובר כלים:** הנתיב האבסולוטי מכיל תיקיות בעברית. כלי קבצים נכשלים על הנתיב המלא — השתמש ב-short path 8.3 (`C:\Users\User\DOWNLO~1\...\WRENCH~1\wrench-logic`). PowerShell מטפל בנתיב בסדר.
- **slug mismatch:** `parts.json` המקומי משתמש בקטגוריה `induction` בעוד ה-DB/קטלוג משתמשים ב-`intake`. שים לב להתאמה אם מסתמכים על fallback מקומי.
- **RLS חוסם seed:** אי אפשר להוסיף categories/parts מהאפליקציה — רק דרך SQL editor.
- **תלות ב-RPC:** `GarageBenchmark` שובר בשקט (מציג hint) אם `get_benchmark_stats` לא deployed.
- **install counts פר-משתמש:** ה-social proof משקף רק את המשתמש הנוכחי עד שמריצים view ציבורי.
- **chunk size:** bundle > 500kB (אזהרת build, לא שגיאה).
- **תמונות Wikimedia חסומות** (ORB) בדפדפן הפריוויו — לא משפיע על פרודקשן.

---

## 9. שינויים אחרונים (סשן זה)

1. **דף נחיתה חדש** `LandingPage.jsx` — standalone, דו-לשוני HE/EN, 7 סקשנים, scroll-reveal.
2. **routing:** `/` → LandingPage; שונה שם נתיב בחירת הרכב מ-`/select` ל-`/vehicle-selection` בכל הקבצים.
3. **כפתור auth דינמי** ב-LandingPage וב-AppNavigation: מחובר→"הפרופיל שלי"/`/profile`, אורח→"התחבר / הירשם"/`/login`.
4. **לוגו לחיץ** → `navigate('/')` ב-LandingPage וב-AppNavigation (sidebar).
5. **AppNavigation תוקן:** הוסר `Link` מ-import אך נשאר בשימוש → הוחלף ב-button/navigate בכל המופעים.
6. **LoginPage:** tabs שונו ל-"התחבר"/"הירשם", כפתור submit ל-"התחבר"/"הירשם", נוסף שדה **אימות סיסמה** (signup בלבד) + validation "הסיסמאות אינן תואמות".
7. כל הבילדים נקיים (92 modules).

> **לא בוצע git commit/push** — נשאר לעבודה ידנית.

---

## 10. העדפות העבודה של המשתמש (מילה במילה)

- עברית, ישיר, ברמת עיניים, בלי פתיחות/נימוסים.
- אין רקע בתכנות — כל פלט = פרומפט מוכן להעתקה.
- שלושה כלים בלבד: Claude Code, Claude Design, תוסף Claude בכרום.
- אסור git commit/push בפרומפטים — נעשה ידנית.
- אין יצירת קבצים לא-מבוקשת, אין הצעת כלים נוספים, אין אורך מיותר.
