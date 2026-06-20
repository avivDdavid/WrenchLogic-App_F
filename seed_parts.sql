-- ============================================================
-- WrenchLogic — Seed: additional catalog parts
-- Run this in the Supabase dashboard → SQL Editor.
-- (parts INSERT is blocked by RLS for the app's anon/auth key,
--  so it must be run here, like supabase_fixes.sql.)
--
-- Adds ~3 parts per category (18 total) on top of the existing
-- one-per-category seed. Safe to re-run (ON CONFLICT DO NOTHING).
--
-- category_id is resolved by slug, so this works regardless of the
-- categories' UUIDs. Existing slugs:
--   engine · intake · exhaust · brakes · suspension · boost
--
-- image_url points at LOCAL images under public/images/parts/
-- (downloaded from Wikimedia Commons) so they render in every
-- environment without Wikimedia hotlink/ORB blocking.
-- ============================================================

INSERT INTO public.parts (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url) VALUES

-- ── ENGINE (מנוע) ─────────────────────────────────────────
('wl-eng-002', 'מצמד מוגבר Sachs Performance',        (SELECT id FROM public.categories WHERE slug='engine'),     0,   0, 'expert', true,  '/images/parts/engine.jpg'),
('wl-eng-003', 'גלגל תנופה קל משקל',                  (SELECT id FROM public.categories WHERE slug='engine'),     5,   0, 'expert', true,  '/images/parts/engine.jpg'),
('wl-eng-004', 'משאבת דלק בנפח גבוה (HPFP)',          (SELECT id FROM public.categories WHERE slug='engine'),    30,  40, 'expert', true,  '/images/parts/engine.jpg'),

-- ── INTAKE (יניקה) ───────────────────────────────────────
('wl-int-002', 'מסנן אוויר ביצועים K&N',              (SELECT id FROM public.categories WHERE slug='intake'),     5,   8, 'easy',   true,  '/images/parts/intake.jpg'),
('wl-int-003', 'מערכת יניקה קרה (Cold Air Intake)',   (SELECT id FROM public.categories WHERE slug='intake'),    12,  15, 'medium', true,  '/images/parts/intake.jpg'),
('wl-int-004', 'צינור טורבו מוגדל (Turbo Inlet)',     (SELECT id FROM public.categories WHERE slug='intake'),     8,  10, 'medium', true,  '/images/parts/intake.jpg'),

-- ── EXHAUST (פליטה) ──────────────────────────────────────
('wl-exh-002', 'דאון-פייפ ספורט ללא ממיר (Catless)',  (SELECT id FROM public.categories WHERE slug='exhaust'),   25,  40, 'expert', false, '/images/parts/exhaust.jpg'),
('wl-exh-003', 'אגזוז Cat-Back מנירוסטה',             (SELECT id FROM public.categories WHERE slug='exhaust'),   10,  12, 'medium', true,  '/images/parts/exhaust.jpg'),
('wl-exh-004', 'מפסק רזונטור (Resonator Delete)',     (SELECT id FROM public.categories WHERE slug='exhaust'),    5,   5, 'easy',   true,  '/images/parts/exhaust.jpg'),

-- ── BRAKES (בלמים) ───────────────────────────────────────
('wl-brk-002', 'רפידות בלם ספורטיביות EBC',           (SELECT id FROM public.categories WHERE slug='brakes'),     0,   0, 'easy',   true,  '/images/parts/brakes.jpg'),
('wl-brk-003', 'דיסקים מחורצים מקדימה',               (SELECT id FROM public.categories WHERE slug='brakes'),     0,   0, 'medium', true,  '/images/parts/brakes.jpg'),
('wl-brk-004', 'צינורות בלם מתכת קלועה',              (SELECT id FROM public.categories WHERE slug='brakes'),     0,   0, 'medium', true,  '/images/parts/brakes.jpg'),

-- ── SUSPENSION (מתלים) ───────────────────────────────────
('wl-sus-002', 'קואילאוברים מתכווננים KW V3',         (SELECT id FROM public.categories WHERE slug='suspension'), 0,   0, 'expert', true,  '/images/parts/suspension.jpg'),
('wl-sus-003', 'מוטות מייצב מוגברים (Sway Bars)',     (SELECT id FROM public.categories WHERE slug='suspension'), 0,   0, 'medium', true,  '/images/parts/suspension.jpg'),
('wl-sus-004', 'בושינגים פוליאוריתן',                 (SELECT id FROM public.categories WHERE slug='suspension'), 0,   0, 'medium', true,  '/images/parts/suspension.jpg'),

-- ── BOOST (בוסט) ─────────────────────────────────────────
('wl-bst-002', 'אינטרקולר מוגדל (FMIC)',              (SELECT id FROM public.categories WHERE slug='boost'),     20,  30, 'medium', true,  '/images/parts/boost.jpg'),
('wl-bst-003', 'דיברטר ואלב / Blow-off',              (SELECT id FROM public.categories WHERE slug='boost'),      5,   5, 'easy',   true,  '/images/parts/boost.jpg'),
('wl-bst-004', 'טורבו היברידי Stage 3',               (SELECT id FROM public.categories WHERE slug='boost'),    120, 150, 'expert', false, '/images/parts/boost.jpg')

ON CONFLICT (id) DO NOTHING;
