-- ============================================================
-- WrenchLogic — add a per-part description column + content
-- Run manually in the Supabase dashboard → SQL Editor. Safe to re-run.
-- ============================================================

ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE public.parts SET description = 'שדרוג הטורבו המקורי IS38 לגרסה היברידית המספקת זרימת אוויר גבוהה יותר ולחץ בוסט מוגבר. תואם ל-EA888 Gen3/Gen4 ומספק עד +120 HP עם כיוון מנוע מתאים.' WHERE id = 'wl-tur-001';

UPDATE public.parts SET description = 'מצמד ביצועים מחוזק מבית Sachs המאפשר העברת כוח מלאה גם בעומסי טורבו גבוהים. מתאים לשדרוגים מעל 300 כ"ס.' WHERE id = 'wl-eng-002';

UPDATE public.parts SET description = 'גלגל תנופה קל משקל מאלומיניום המפחית משקל סיבובי ומשפר תגובת מנוע. מוריד זמן תגובה ומגביר חדות בנהיגה ספורטיבית.' WHERE id = 'wl-eng-003';

UPDATE public.parts SET description = 'משאבת דלק בנפח גבוה (HPFP) המספקת לחץ דלק יציב בהספקים גבוהים. הכרחי בשדרוגי טורבו מעל Stage 1.' WHERE id = 'wl-eng-004';

UPDATE public.parts SET description = 'מערכת יניקה קרה מוחלפת המכניסה אוויר קר וצפוף למנוע. מגדילה הספק, משפרת תגובת גז ומוסיפה סאונד ספורטיבי.' WHERE id = 'wl-int-001';

UPDATE public.parts SET description = 'מסנן ביצועים K&N הניתן לשטיפה וחוזר לשימוש. מגדיל זרימת אוויר ב-15-20% לעומת מסנן מקורי ומשפר תגובת מנוע.' WHERE id = 'wl-int-002';

UPDATE public.parts SET description = 'מניפולד יניקה מפורז מאלומיניום עם ציפוי פנימי חלק המפחית טורבולנציה. מייעל זרימת תערובת דלק-אוויר ומשפר הספק.' WHERE id = 'wl-int-003';

UPDATE public.parts SET description = 'צינור כניסה מוגדל לטורבו המאפשר זרימת אוויר גבוהה יותר לכניסת הקומפרסור. מפחית הפרש לחצים ומשפר יעילות הטורבו.' WHERE id = 'wl-int-004';

UPDATE public.parts SET description = 'מערכת פליטה Milltek מנירוסטה אמריקאית 304 עם קוטר מוגדל. מפחית לחץ נגדי, משפר פינוי גזי פליטה ומוסיף צליל ספורטיבי.' WHERE id = 'wl-exh-001';

UPDATE public.parts SET description = 'דאון-פייפ ישיר ללא ממיר קטליטי לשימוש במסלול בלבד. מוריד טמפרטורות טורבו ומגדיל הספק משמעותית — לא חוקי לכביש.' WHERE id = 'wl-exh-002';

UPDATE public.parts SET description = 'מערכת פליטה Cat-Back מנירוסטה מלאה מהממיר לאחור. משפרת זרימה, מוסיפה צליל עמוק ומפחיתה משקל לעומת מערכת מקורית.' WHERE id = 'wl-exh-003';

UPDATE public.parts SET description = 'הסרת הרזונטור המקורי והחלפה בצינור ישיר. מגדיל זרימת גזים, מוסיף צליל ספורטיבי ומפחית משקל — התקנה פשוטה.' WHERE id = 'wl-exh-004';

UPDATE public.parts SET description = 'ערכת בלמים Brembo ספורטיבית עם קליפרים גדולים ודיסקים מחוררים. מספקת בלימה חזקה ועקבית גם בתנאי מסלול קשים.' WHERE id = 'wl-brk-001';

UPDATE public.parts SET description = 'רפידות ביצועים EBC עם חומר חיכוך ספורטיבי. מספקות עצירה חדה יותר, עמידות בחום גבוה ושחיקה נמוכה לעומת רפידות מקוריות.' WHERE id = 'wl-brk-002';

UPDATE public.parts SET description = 'דיסקים מחוררים ומחורצים EBC לפינוי חום ואבק בלמים יעיל. מפחיתים דהייה בבלמים ומשפרים ביצועי בלימה חוזרת.' WHERE id = 'wl-brk-003';

UPDATE public.parts SET description = 'צינורות בלם מתכת קלועה המחליפים צינורות גומי מקוריים. מספקים לחץ בלם חד ועקבי עם פחות "ספוגיות" בדוושה.' WHERE id = 'wl-brk-004';

UPDATE public.parts SET description = 'קפיצים ספורטיביים H&R המורידים מרכז כובד ומשפרים כניסה לפניות. הורדה של 30-40mm עם נסיעה נוחה יחסית לשימוש יומיומי.' WHERE id = 'wl-sus-001';

UPDATE public.parts SET description = 'קואילאוברים מתכווננים KW Variant 3 עם בקרת ריבאונד ודחיסה נפרדת. מאפשרים כיוון מדויק של גובה ונוקשות לכל שימוש.' WHERE id = 'wl-sus-002';

UPDATE public.parts SET description = 'מוטות מייצב מוגברים Whiteline המפחיתים גלגול גוף בפניות. משפרים יציבות ותגובת הגה תוך שמירה על נוחות נסיעה.' WHERE id = 'wl-sus-003';

UPDATE public.parts SET description = 'בושינגים פוליאוריתן קשיחים יותר מגומי מקורי. מפחיתים תנועה מיותרת במתלה, משפרים תגובת הגה ועמידים לאורך זמן.' WHERE id = 'wl-sus-004';

UPDATE public.parts SET description = 'בקר בוסט אלקטרוני Forge לכיוון מדויק של לחץ הטורבו. מאפשר שליטה מלאה על עקומת הבוסט ומניעת ירידת לחץ בהספקים גבוהים.' WHERE id = 'wl-bst-001';

UPDATE public.parts SET description = 'אינטרקולר קדמי (FMIC) גדול מהמקורי לצינון אוויר נטען יעיל יותר. אוויר קר יותר = צפיפות גבוהה = הספק גבוה יותר ועמידות לדהייה.' WHERE id = 'wl-bst-002';

UPDATE public.parts SET description = 'שסתום פריקת לחץ (BOV) ספורטיבי המשחרר עודפי לחץ בין הילוכים. מגן על הטורבו, מייצב לחץ ומוסיף את הסאונד האופייני.' WHERE id = 'wl-bst-003';

UPDATE public.parts SET description = 'שדרוג טורבו Stage 3 עם גלגל קומפרסור מוגדל. מתאים למנועים עם תמיכת דלק ובקרה מותאמת — מספק עד +120 HP נוספים.' WHERE id = 'wl-bst-004';

UPDATE public.parts SET description = 'טורבו Garrett GTX3076R עם גלגל קומפרסור נחושת לזרימה מקסימלית. מתאים לבניות Stage 3+ עם תמיכת דלק ומנוע מוכן לעומס.' WHERE name LIKE '%Garrett%';

UPDATE public.parts SET description = 'שסתום HKS SSQV האיקוני עם סאונד ספורטיבי ייחודי. מגיב מהיר, בנוי מאלומיניום קל ומציע אמינות גבוהה לשימוש ארוך טווח.' WHERE name LIKE '%HKS%';

-- Verify
SELECT id, name, description FROM public.parts ORDER BY id;
