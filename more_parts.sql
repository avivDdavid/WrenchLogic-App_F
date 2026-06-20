-- ============================================================
-- WrenchLogic — 24 additional parts (4 per category)
-- Run manually in the Supabase dashboard → SQL Editor.
-- Requires: categories table with slugs engine/intake/exhaust/brakes/suspension/boost
-- ============================================================

-- ENGINE (wl-eng-005 → wl-eng-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-eng-005',
    'APR Stage 2 ECU Tune',
    50, 60, 'expert', true,
    '/images/parts/engine.jpg',
    'כיוון מנוע Stage 2 של APR מוסיף עד 50 כ"ס באמצעות אופטימיזציה של מפת הדלק, הצתה ולחץ הבוסט. מצריך דאונפייפ ובנזין 98 אוקטן.'
  ),
  (
    'wl-eng-006',
    'Forge Motorsport Intercooler Hose Kit',
    0, 0, 'easy', true,
    '/images/parts/engine.jpg',
    'ערכת צינורות סיליקון של Forge Motorsport מחליפה את הצינורות המקוריים בצינורות עמידים בלחץ גבוה. מניעת פיצוצי צינור תחת עומס.'
  ),
  (
    'wl-eng-007',
    'ACL Race Bearings',
    0, 0, 'expert', true,
    '/images/parts/engine.jpg',
    'מיסבי מרוץ ACL עשויים מסגסוגת ביסמוט-ברונזה לעמידות מירבית. מתאים לטיונינג אגרסיבי ולמנועים שעברו שחזור מלא.'
  ),
  (
    'wl-eng-008',
    'Walbro High Flow Fuel Pump',
    15, 20, 'medium', true,
    '/images/parts/engine.jpg',
    'משאבת דלק Walbro 255lph מספקת זרימת דלק מוגברת לתמיכה ב-Stage 2 ומעלה. הכרחי לרכבים עם הספק מעל 300 כ"ס.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'engine'
ON CONFLICT (id) DO NOTHING;

-- INTAKE (wl-int-005 → wl-int-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-int-005',
    'Eventuri Carbon Intake',
    18, 22, 'medium', true,
    '/images/parts/intake.jpg',
    'מערכת יניקה מקרבון של Eventuri מייצרת הזנת אוויר מוגברת עם פחות מגבלות זרימה. מוסיפה עד 18 כ"ס ומפחיתה טמפרטורת אוויר נכנס.'
  ),
  (
    'wl-int-006',
    'GFB DV+ Diverter Valve',
    0, 0, 'easy', true,
    '/images/parts/intake.jpg',
    'שסתום הטיית לחץ GFB DV+ מחליף את השסתום המקורי בגרסה איכותית יותר. מגיב מהיר יותר ומונע אובדן לחץ בוסט בשינויי הילוך.'
  ),
  (
    'wl-int-007',
    'Forge Twintercooler',
    12, 15, 'expert', true,
    '/images/parts/intake.jpg',
    'אינטרקולר כפול של Forge מספק קירור אוויר מרבי לרכבי Stage 2+. דורש הרכבה מקצועית וחיווט של צינורות הסיליקון.'
  ),
  (
    'wl-int-008',
    'HKS Super Power Flow Filter',
    8, 10, 'easy', true,
    '/images/parts/intake.jpg',
    'פילטר אוויר ספורטיבי של HKS המגדיל זרימת אוויר ב-30% לעומת המקורי. התקנה פשוטה ישירות על הסינון הקיים.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'intake'
ON CONFLICT (id) DO NOTHING;

-- EXHAUST (wl-exh-005 → wl-exh-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-exh-005',
    'Akrapovic Evolution Exhaust',
    20, 25, 'expert', false,
    '/images/parts/exhaust.jpg',
    'מערכת פליטה טיטניום של Akrapovic מפחיתה משקל ב-4 ק"ג ומוסיפה 20 כ"ס. צליל אגרסיבי ועוצמתי — אינה עומדת בתקני רעש ישראלי.'
  ),
  (
    'wl-exh-006',
    'Scorpion Cat-Back Exhaust',
    15, 18, 'medium', true,
    '/images/parts/exhaust.jpg',
    'מערכת Cat-Back מנירוסטה של Scorpion עם silencer מובנה. מוסיפה 15 כ"ס ועוברת בדיקת רעש — מתאימה לשימוש יומיומי ולמסלול.'
  ),
  (
    'wl-exh-007',
    'Forge Turbo Outlet Pipe',
    10, 12, 'medium', true,
    '/images/parts/exhaust.jpg',
    'צינור יציאת טורבו מנירוסטה של Forge מחליף את הצינור הפלסטי המקורי. מפחית חום ומגביר זרימת גזים לשיפור תגובת טורבו.'
  ),
  (
    'wl-exh-008',
    'Decat Downpipe 3 inch',
    30, 40, 'expert', false,
    '/images/parts/exhaust.jpg',
    'דאונפייפ 3 אינץ\' ללא קטליזטור מוסיף 30 כ"ס ומשפר תגובת טורבו משמעותית. אינו חוקי לכביש — מיועד לשימוש במסלול בלבד.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'exhaust'
ON CONFLICT (id) DO NOTHING;

-- BRAKES (wl-brk-005 → wl-brk-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-brk-005',
    'StopTech Big Brake Kit',
    0, 0, 'expert', true,
    '/images/parts/brakes.jpg',
    'ערכת בלמים גדולה של StopTech עם דיסקים 355מ"מ ובולמי 6 בוכנות. שיפור עצום בכוח הבלימה ועמידות לטמפרטורות גבוהות במסלול.'
  ),
  (
    'wl-brk-006',
    'Mintex Performance Pads',
    0, 0, 'easy', true,
    '/images/parts/brakes.jpg',
    'רפידות בלמים ספורטיביות Mintex מספקות בלימה עדיפה בטמפרטורות גבוהות עם אבק מינימלי. התקנה פשוטה ישירות לבולמים הקיימים.'
  ),
  (
    'wl-brk-007',
    'Goodridge Brake Lines',
    0, 0, 'medium', true,
    '/images/parts/brakes.jpg',
    'צינורות בלמים ארוגים מנירוסטה של Goodridge מחליפים את הצינורות הגומי המקוריים. פדאל קשיח יותר ותגובה מיידית בכל תנאי.'
  ),
  (
    'wl-brk-008',
    'AP Racing Caliper Kit',
    0, 0, 'expert', true,
    '/images/parts/brakes.jpg',
    'בולמי מרוץ AP Racing עם 4 בוכנות לכל גלגל — ביצועי מסלול אמיתיים. עשויים אלומיניום מזויף עם ציפוי אנודייז לעמידות מרבית.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'brakes'
ON CONFLICT (id) DO NOTHING;

-- SUSPENSION (wl-sus-005 → wl-sus-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-sus-005',
    'Bilstein B16 Coilovers',
    0, 0, 'expert', true,
    '/images/parts/suspension.jpg',
    'קויל-אוברים מתכווננים B16 של Bilstein עם 30 הגדרות בלימה. מאפשרים כיוון גובה עצמאי לחזית ואחורית עם ביצועי מסלול עילית.'
  ),
  (
    'wl-sus-006',
    'Eibach Pro Street Coilovers',
    0, 0, 'expert', true,
    '/images/parts/suspension.jpg',
    'קויל-אוברים Pro Street של Eibach לשימוש יומיומי ולמסלול. מספקים הנמכה של 20–60 מ"מ עם קשיחות מתכווננת בשני צירים.'
  ),
  (
    'wl-sus-007',
    'Whiteline Front Strut Brace',
    0, 0, 'easy', true,
    '/images/parts/suspension.jpg',
    'גשר קשיחות חזיתי של Whiteline מחזק את תאי המתלה ומפחית עיוות שלדה בפינות. התקנה של 20 דקות ללא קידוח — שיפור מיידי בחדות.'
  ),
  (
    'wl-sus-008',
    'Powerflex Lower Engine Mount',
    0, 0, 'medium', true,
    '/images/parts/suspension.jpg',
    'משענת מנוע תחתונה מפוליאוריתן של Powerflex מחליפה את המשענת הגומי הרכה המקורית. מפחיתה תזוזת מנוע ומשפרת תגובת גז מדויקת.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'suspension'
ON CONFLICT (id) DO NOTHING;

-- BOOST (wl-bst-005 → wl-bst-008)
INSERT INTO public.parts
  (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description, created_at)
SELECT
  v.id,
  v.name,
  c.id AS category_id,
  v.hp_gain,
  v.torque_gain_nm,
  v.difficulty,
  v.is_legal,
  v.image_url,
  v.description,
  NOW() - INTERVAL '45 days'
FROM (VALUES
  (
    'wl-bst-005',
    'TurboSmart Race Port BOV',
    5, 8, 'easy', true,
    '/images/parts/boost.jpg',
    'שסתום BOV מרוץ של TurboSmart עם פתיחה מיידית ב-7 PSI. מייצר צליל ספורטיבי אופייני ומונע קריסת בוסט בין הילוכים.'
  ),
  (
    'wl-bst-006',
    'GFB Mach 2 Recirculation Valve',
    5, 8, 'easy', true,
    '/images/parts/boost.jpg',
    'שסתום ספיגה חוזרת Mach 2 של GFB מחליף את ה-DV המקורי ב-actuator מוקשח. תגובה מיידית וסאונד קריסה אגרסיבי יותר.'
  ),
  (
    'wl-bst-007',
    'Precision 6266 Turbo',
    150, 180, 'expert', false,
    '/images/parts/boost.jpg',
    'טורבו Precision 6266 Gen2 מתאים לרכבים שמכוונים מעל 500 כ"ס. מצריך מניפולד חדש, מזין שמן, ושדרוג מלא של מערכות הדלק.'
  ),
  (
    'wl-bst-008',
    'Tial Sport Q BOV',
    5, 8, 'medium', true,
    '/images/parts/boost.jpg',
    'שסתום BOV פרמיום של Tial Sport עם קפיץ מתכוונן ל-7–22 PSI. בנוי אלומיניום מזויף עם איטום מושלם לחץ ואמינות מרבית.'
  )
) AS v(id, name, hp_gain, torque_gain_nm, difficulty, is_legal, image_url, description)
JOIN public.categories c ON c.slug = 'boost'
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT p.id, p.name, c.slug AS category, p.difficulty, p.is_legal, p.hp_gain
FROM public.parts p
JOIN public.categories c ON c.id = p.category_id
WHERE p.id LIKE 'wl-eng-00%'
   OR p.id LIKE 'wl-int-00%'
   OR p.id LIKE 'wl-exh-00%'
   OR p.id LIKE 'wl-brk-00%'
   OR p.id LIKE 'wl-sus-00%'
   OR p.id LIKE 'wl-bst-00%'
ORDER BY c.slug, p.id;
