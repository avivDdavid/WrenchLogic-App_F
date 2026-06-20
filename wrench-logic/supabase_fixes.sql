-- ============================================================
-- WrenchLogic — Supabase fixes
-- Run this in the Supabase dashboard → SQL Editor.
-- Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1) Catalog categories  (ALREADY APPLIED — all 6 now exist)
--    Kept here for reference / fresh setups.
-- ------------------------------------------------------------
INSERT INTO public.categories (name, slug, description) VALUES
  ('בלמים',  'brakes',     'שיפור מערכת הבלימה'),
  ('מתלים',  'suspension', 'כיוון וחיזוק המתלה'),
  ('בוסט',   'boost',      'שיפורי לחץ טורבו ובינוני')
ON CONFLICT (slug) DO NOTHING;


-- ------------------------------------------------------------
-- 2) Garage persistence  (ALREADY APPLIED — vehicle_id is nullable)
--    Kept here for reference / fresh setups.
-- ------------------------------------------------------------
ALTER TABLE public.garage_entries
  ALTER COLUMN vehicle_id DROP NOT NULL;


-- ------------------------------------------------------------
-- 3) Parts for the 3 new categories so they aren't empty.
--    parts INSERT is blocked by RLS for the app's anon/auth key
--    (error 42501), so this MUST be run here in the SQL editor.
-- ------------------------------------------------------------
INSERT INTO public.parts (id, name, category_id, hp_gain, torque_gain_nm, difficulty, is_legal, image_url) VALUES
('wl-brk-001', 'ערכת בלמים ספורטיבית Brembo', (SELECT id FROM public.categories WHERE slug='brakes'), 0, 0, 'medium', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Brembo_brake_disc_and_caliper.jpg/320px-Brembo_brake_disc_and_caliper.jpg'),
('wl-sus-001', 'קפיצים ספורטיביים H&R', (SELECT id FROM public.categories WHERE slug='suspension'), 0, 0, 'expert', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Coilover.jpg/320px-Coilover.jpg'),
('wl-bst-001', 'בקר בוסט אלקטרוני Forge', (SELECT id FROM public.categories WHERE slug='boost'), 25, 35, 'medium', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Turbocharger_assembly.jpg/320px-Turbocharger_assembly.jpg')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Note: garage_entries already has RLS that lets a user
-- insert / select / delete their OWN rows (user_id = auth.uid()),
-- so no policy change is needed for the garage to work.
-- ============================================================
