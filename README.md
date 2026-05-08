# WrenchLogic — מערכת ניהול שיפורי ביצועים לרכב

## תיאור הפרויקט

WrenchLogic היא אפליקציית Web לניהול ומעקב אחר שיפורי ביצועים לרכב (Aftermarket Tuning).  
המערכת מיועדת לסצנת ה-Tuner/Street — רכבים כגון Volkswagen Golf GTI, SEAT Leon Cupra, Honda Civic Type R ו-Hyundai i30 N.

המשתמש בוחר את רכבו בצורה מדורגת (יצרן → דגם → שנתון → קוד מנוע), מקבל קטלוג חלפים מותאם אישית, ומנהל "גראז' אישי" הכולל מעקב חי אחר תוספות כוח סוס ומומנט.

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 |
| State Management | React Context API |
| Persistence | localStorage |
| שפה | JavaScript (JSX) |

---

## מבנה העמודים

| נתיב | תיאור |
|---|---|
| `/` | בחירת רכב — אשף Cascading Dropdown בן 4 שלבים |
| `/catalog` | קטלוג קטגוריות שיפורים (6 קטגוריות, תצוגת גריד) |
| `/catalog/:partId` | עמוד פרטי חלק — מפרט טכני + כפתור הוספה לגראז' |
| `/garage` | הגראז' האישי — סרגל ביצועים דינמי + רשימות חלפים |

---

## הרצת הפרויקט

```bash
# 1. כניסה לתיקיית הפרויקט
cd wrench-logic

# 2. התקנת תלויות
npm install

# 3. הפעלת שרת הפיתוח
npm run dev
```

לאחר ההרצה, פתח את הדפדפן בכתובת: `http://localhost:5173`

---

## רכיבים מרכזיים

- **`TriSegmentProgressBar`** — סרגל מדדים תלת-מקטעי: אפור (סטוק), כתום (נוכחי), לבן שקוף (יעד)
- **`CategoryCard`** — כרטיסיית קטגוריה גנרית עם Props
- **`AppNavigation`** — ניווט צידי (Desktop) + עליון ותחתון (Mobile), RTL מלא
- **`VehicleContext`** — מצב הרכב הנבחר, נשמר ב-localStorage
- **`GarageContext`** — מצב החלפים בגראז', נשמר ב-localStorage
