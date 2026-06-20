# WrenchLogic — קובץ הקשר (CLAUDE.md)

> נקרא אוטומטית בתחילת כל שיחה. סשן חדש יכול להמשיך מכאן בלי לקרוא היסטוריה.

---

## העדפות עבודה של המשתמש (קריטי — כבד אותן בכל תשובה)

- **אין לי רקע בתכנות.** אני עובד רק בהדבקת פרומפטים מוכנים. כל פלט שלך = טקסט מוכן להעתקה.
- **שלושת הכלים היחידים שלי:** Claude Code, Claude Design, ותוסף Claude בכרום. אל תציע כלים אחרים, ספריות חיצוניות או שירותים נוספים.
- **כל פעולות ה-SQL ו-Supabase Dashboard** מתבצעות דרך תוסף הכרום (לא CLI, לא psql).
- **תקשורת:** עברית, ישירה, ברמת עיניים. בלי פתיחות מנומסות, בלי מילוי, בלי אורך מיותר.
- **git:** אסור `git commit` / `git push` אלא אם ביקשתי מפורשות. אני מנהל git ידנית.
- **אל תיצור קבצים** (טקסט/Word/Excel/קוד חדש) אלא אם ביקשתי מפורשות.
- **פרומפט אחד גדול ומסודר** עדיף על כמה נפרדים — חוסך טוקנים.
- **ניתוח ביקורתי:** אם הלוגיקה שלי שגויה או יש דרך טובה יותר — תגיד לי ישירות ובקצרה. אל תסכים סתם.

---

## זהות הפרויקט

**WrenchLogic** — אפליקציית ווב לחובבי שדרוג רכבים (aftermarket tuning) בעברית. המשתמש בוחר רכב (יצרן→דגם→שנתון→מנוע), מעיין בקטלוג חלפים עם נתוני ביצועים אמיתיים (כ"ס, מומנט, משקל), ובונה **"גראז' וירטואלי"** שעוקב אחרי עקומת ביצועים, יעד כוח, ומשקל.

פרויקט גמר אקדמי. **המרצה לא מבין ברכבים** — אז כל פיצ'ר חייב להיות ברור ו-idiot-proof.

---

## Tech Stack

React ^19.2 + Vite ^8 · Tailwind CSS ^3.4.19 (JIT) · react-router-dom ^7.15 · Supabase (`@supabase/supabase-js` ^2.106 — Auth + PostgreSQL + RLS + RPC).

- **תיקיית עבודה:** `wrench-logic/` (תת-תיקייה, לא שורש ה-repo). פקודות npm רצות מתוכה.
- **env:** `wrench-logic/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **GitHub:** https://github.com/avivDdavid/WrenchLogic-App.git
- **Supabase Project ID:** `rldclhemvhfluormbnca`
- **הרצה:** `cd wrench-logic && npm run dev` (פיתוח) · `npm run build` (בנייה).
- **נתיב Windows עברי שובר כלי-קבצים** → השתמש ב-short path 8.3: `C:\Users\User\DOWNLO~1\67FF~1\AE5A~1\979B~1\4295~1\WRENCH~1\wrench-logic`. PowerShell מטפל בנתיב המלא בסדר.

---

## מבנה (`wrench-logic/src/`)

```
main.jsx                    כניסה — מרנדר <App/> ב-StrictMode
App.jsx                     נסטינג providers + כל הגדרות ה-routes
index.css                   גלובלי + overrides של מצב בהיר (html.light .bg-[#...])

lib/
  supabase.js               אתחול קליינט Supabase מ-env
  installCounts.js          ספירת פעמים שחלף נוסף לגראז' (social proof) + תווית
  recentVehicles.js         CRUD היסטוריית רכבים אחרונים (טבלת vehicles, cap 5)

context/
  AuthContext.jsx           session/user + signOut. undefined=טוען, null=אורח, object=מחובר
  VehicleContext.jsx        selectedVehicle (מ-cars.json). cache ל-localStorage רק למחוברים
  GarageContext.jsx         userParts + add/remove/updateStatus. גראז' פר-רכב, sync ל-Supabase
  ThemeContext.jsx          theme (light/dark, דיפולט light) + lang (he/en) גלובלי. שניהם ב-localStorage; lang קובע document.dir

layouts/
  MainLayout.jsx            עוטף דפים פנימיים ב-AppNavigation + <Outlet/> (dir=rtl)

components/
  AppNavigation.jsx         סיידבר דסקטופ + טופ/בוטום בר מובייל. לוגו לחיץ→/, כפתור auth דינמי, ThemeToggle, LangToggle
  ProtectedRoute.jsx        מפנה ל-/login אם אין session (null בזמן טעינה)
  CategoryCard.jsx          כרטיס קטגוריה בקטלוג + fallback image ב-onError
  TriSegmentProgressBar.jsx בר התקדמות בסיס/נוכחי/יעד
  NewBadge.jsx              תג "חדש" לפי parts.created_at
  HelpHint.jsx              tooltip עזרה
  InstallGuide.jsx          מדריך התקנה: זמן/קושי/אזהרת חוקיות + סרטון YouTube (VIDEOS_BY_ID→categories.slug→cat)
  GarageBenchmark.jsx       "איפה אתה עומד?" — RPC get_benchmark_stats מול ממוצע הקהילה
  TargetBuilder.jsx         הגדרת יעד כ"ס + המלצת חלפים לסגירת הפער
  NextStep.jsx              "הצעד הבא המומלץ" — עד 3 חלפים שלא בגראז'

pages/
  LandingPage.jsx           דף נחיתה שיווקי standalone, דו-לשוני HE/EN, scroll-reveal
  LoginPage.jsx             tabs התחבר/הירשם, אימות סיסמה, דמו. OAuth מוסתר (OAUTH_ENABLED=false)
  VehicleSelectionPage.jsx  בחירת רכב מדורגת מ-cars.json + רכבים אחרונים
  CatalogPage.jsx           קטגוריות (8) + "הכי פופולרי" + באנר רכב. fallback מקומי כש-DB ריק
  CategoryViewPage.jsx      רשימת חלפים בקטגוריה + תג משקל ירוק (-X ק"ג)
  PartDetailsPage.jsx       פרטי חלף, הוספה לגראז', spec tab, תשלומים, InstallGuide
  MyGaragePage.jsx          הגראז' + מד כוח + מעקב משקל (MODEL_WEIGHTS) + benchmark/target/next-step
  UserProfilePage.jsx       פרופיל משתמש (מוגן)
  TermsPage / PrivacyPage / ContactPage   דפי דמה standalone, דו-לשוניים

data/
  cars.json                 עץ רכבים: יצרן→דגם→שנתון→מנוע (id, code, displacement, stockHp, stockTorque)
  parts.json                fallback מקומי לחלפים (שים לב: משתמש ב-slug 'induction' במקום 'intake')

דף נחיתה/                    קוד דף נחיתה ישן — לא בשימוש, נתיב עברי
```

נסטינג providers (App.jsx): `ThemeProvider > AuthProvider > VehicleProvider > GarageProvider > BrowserRouter`.

---

## מודל הנתונים (Supabase — project `rldclhemvhfluormbnca`)

### `profiles`
מראה של `auth.users` (id UUID = auth.users.id, email/שם, created_at). נוצר אוטומטית ע"י **trigger `handle_new_user`** (AFTER INSERT ON auth.users → INSERT לשורת profiles). RLS: כל משתמש קורא/מעדכן רק את השורה שלו.

### `vehicles`
היסטוריית רכבים פר-משתמש (cap 5, ראה `recentVehicles.js`). עמודות: `id, user_id, make_id, manufacturer_name, model_id, model_name, year, engine_id (unique-per-variant), engine_code, base_hp, base_torque_nm, base_weight_kg, engine (jsonb), is_default, last_used_at`. upsert על `(user_id, engine_id)`.
⚠️ בפועל בחירת הרכב הפעילה נבנית מ-`cars.json` המקומי; משקל הבסיס בגראז' נקרא כרגע מ-`MODEL_WEIGHTS` ב-`MyGaragePage.jsx` ולא מ-`base_weight_kg`.

### `categories`
8 slugs: `engine, intake, exhaust, brakes, suspension, boost, wheels, weight`. עמודות: `id (uuid), name, slug, description`.

### `parts`
עמודות: `id (TEXT, למשל wl-tur-001), name, category_id (uuid→categories), hp_gain, torque_gain_nm, weight_change_kg (שלילי=הפחתת משקל), price, difficulty (easy/medium/expert), is_legal (bool), image_url, compatible_models, description, created_at`.

### `garage_entries`
עמודות: `id, user_id (uuid), vehicle_id (int, nullable), part_id (text→parts), status (planned/installed), created_at, updated_at`. **הגראז' פר-רכב** — מסונן לפי `vehicle_id = selectedVehicle.engine.id`.

### RLS
- טבלאות תוכן (`categories`, `parts`) דורשות policy `FOR SELECT TO anon, authenticated USING (true)` — אחרת אורחים מקבלים `[]` (HTTP 200) והקטלוג נראה ריק.
- **INSERT ל-`categories`/`parts` חסום ב-RLS גם למחוברים (שגיאה 42501)** → seed דרך SQL editor (תוסף כרום) בלבד.
- `garage_entries` — RLS מאפשר insert/select/delete של שורות המשתמש בלבד (`user_id = auth.uid()`).

### RPC — `get_benchmark_stats`
`SECURITY DEFINER` (רץ כ-owner, עוקף RLS בבטחה — מחזיר רק מצרפים, לא user_id). מסכם HP מותקן (`status='installed'`) פר-משתמש ומחזיר `{user_count, avg_hp_gain, gains_sorted}`. נצרך ב-`GarageBenchmark.jsx`; אם לא deployed → מצב "אין מספיק נתונים".

### קבצי SQL ב-repo (להרצה ב-SQL editor)
`supabase_fixes.sql, enable_public_read.sql, benchmark_rpc.sql, install_counts_view.sql, seed_parts.sql, more_parts.sql, add_prices.sql, add_descriptions.sql, compatible_models.sql, update_images.sql, update_part_images.sql, new_parts_badge.sql, fix_vehicle_id.sql, vehicles_update.sql`.

### דמו
`demo@wrenchlogic.com` / `demo1234`.

---

## Routing

| נתיב | דף | Layout | הגנה |
|------|-----|--------|------|
| `/` | LandingPage | standalone | ציבורי |
| `/login` | LoginPage | standalone | ציבורי |
| `/terms` | TermsPage | standalone | ציבורי |
| `/privacy` | PrivacyPage | standalone | ציבורי |
| `/contact` | ContactPage | standalone | ציבורי |
| `/vehicle-selection` | VehicleSelectionPage | MainLayout | ציבורי |
| `/catalog` | CatalogPage | MainLayout | ציבורי |
| `/catalog/category/:categoryId` | CategoryViewPage | MainLayout | ציבורי |
| `/catalog/:partId` | PartDetailsPage | MainLayout | ציבורי |
| `/garage` | MyGaragePage | MainLayout | ציבורי (גראז' אורח in-memory) |
| `/profile` | UserProfilePage | MainLayout | 🔒 **ProtectedRoute** |

**רק `/profile` מוגן.** קטלוג/גראז'/בחירת רכב חופשיים — אורחים גולשים ושומרים גראז' מקומי, מחוברים שומרים ל-Supabase.

---

## מערכת עיצוב

- **צבעים (כהה):** רקע `#121212`, כרטיסים `#1E1E1E`/`#2D2D2D`, accent כתום `#FF6B00` (hover `#ff8124`), טקסט `#E0E0E0`, גבולות `#2D2D2D`.
- **פלטת בהיר:** רקע `#F5F5F5`, כרטיסים `#FFFFFF`, טקסט `#1A1A1A`, accent נשאר כתום.
- **theming:** הקוד ב-hard-coded arbitrary classes (`bg-[#1E1E1E]`). מצב בהיר = **overrides ב-`index.css`** תחת `html.light .bg-\[\#1E1E1E\]` (specificity מנצח) — **לא** שכתוב מחלקות. חשוב: התאם case של ה-hex בסלקטור.
- **שפה + כיוון:** `lang` (he/en) ב-ThemeContext קובע `document.documentElement.dir` (rtl/ltr). RTL ברירת מחדל. ערכים טכניים (כ"ס, קודי מנוע, אימייל) עטופים ב-`dir="ltr"`; פריסות RTL ב-`flex-row-reverse`.
- **גופנים:** Inter (גוף), Space Grotesk (כותרות/מספרים), Material Symbols (אייקונים). אסתטיקת motorsport.
- **ניווט תמיד דרך `Link`/`NavLink`/`navigate`** — לא `<a href>` פנימי.

---

## מצב נוכחי — מה עובד ומה פתוח

**עובד end-to-end:** דף נחיתה דו-לשוני · בחירת רכב מדורגת + רכבים אחרונים · קטלוג 8 קטגוריות (כולל **wheels** ו-**weight** החדשות) + "הכי פופולרי" + תג "חדש" · גראז' פר-רכב עם הוספה/הסרה/סטטוס + sync ל-Supabase + **מד כוח** ו-**מעקב משקל** (כ"ס לטון) · סרטוני התקנה מ-YouTube ב-InstallGuide · אימות אימייל+סיסמה + דמו · light/dark + he/en · דפי דמה terms/privacy/contact.

**פתוח / תלוי-deploy:**
- **OAuth מושבת** — Google + Facebook, הכפתורים מוסתרים (`OAUTH_ENABLED=false`, הקוד נשמר). Client Secret של גוגל צריך החלפה לפני הפעלה.
- `get_benchmark_stats` ו-public-read policies צריכים deploy ב-SQL editor (אם לא רצו עדיין).
- `installCounts` סופר כרגע רק את המשתמש הנוכחי (RLS); לספירה חוצת-משתמשים צריך view ציבורי.
- אזהרת chunk > 500kB בבנייה (לא שגיאה).

---

## יומן החלטות (אל תפתח מחדש)

- **מודל עסקי = mock בלבד** — קישורי רכישה ומוסכים עם disclaimer, לא API אמיתי.
- **תמונות חלפים נוצרו ב-AI**, מקומיות ב-`public/images/parts/`.
- **חלפים לא-חוקיים** מוצגים עם תג "למסלול בלבד" — לא מוסתרים.
- **light mode דרך CSS overrides** ב-index.css, לא שכתוב מחלקות.
- **משקל בסיס** נקרא מ-`MODEL_WEIGHTS` מקומי (טבלת vehicles לא מאוכלסת לצורך זה).
