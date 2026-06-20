-- ============================================================
-- WrenchLogic — part prices (ILS)
-- Run manually in the Supabase dashboard → SQL Editor. Idempotent.
-- ============================================================

ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS price_ils INTEGER DEFAULT NULL;

-- מנוע
UPDATE public.parts SET price_ils = 4200 WHERE id = 'wl-tur-001';
UPDATE public.parts SET price_ils = 1800 WHERE id = 'wl-eng-002';
UPDATE public.parts SET price_ils = 950 WHERE id = 'wl-eng-003';
UPDATE public.parts SET price_ils = 1200 WHERE id = 'wl-eng-004';

-- יניקה
UPDATE public.parts SET price_ils = 1400 WHERE id = 'wl-int-001';
UPDATE public.parts SET price_ils = 380 WHERE id = 'wl-int-002';
UPDATE public.parts SET price_ils = 2200 WHERE id = 'wl-int-003';
UPDATE public.parts SET price_ils = 680 WHERE id = 'wl-int-004';

-- פליטה
UPDATE public.parts SET price_ils = 3800 WHERE id = 'wl-exh-001';
UPDATE public.parts SET price_ils = 1600 WHERE id = 'wl-exh-002';
UPDATE public.parts SET price_ils = 2900 WHERE id = 'wl-exh-003';
UPDATE public.parts SET price_ils = 420 WHERE id = 'wl-exh-004';

-- בלמים
UPDATE public.parts SET price_ils = 8500 WHERE id = 'wl-brk-001';
UPDATE public.parts SET price_ils = 580 WHERE id = 'wl-brk-002';
UPDATE public.parts SET price_ils = 1100 WHERE id = 'wl-brk-003';
UPDATE public.parts SET price_ils = 320 WHERE id = 'wl-brk-004';

-- מתלים
UPDATE public.parts SET price_ils = 2200 WHERE id = 'wl-sus-001';
UPDATE public.parts SET price_ils = 7800 WHERE id = 'wl-sus-002';
UPDATE public.parts SET price_ils = 680 WHERE id = 'wl-sus-003';
UPDATE public.parts SET price_ils = 290 WHERE id = 'wl-sus-004';

-- בוסט
UPDATE public.parts SET price_ils = 1100 WHERE id = 'wl-bst-001';
UPDATE public.parts SET price_ils = 3200 WHERE id = 'wl-bst-002';
UPDATE public.parts SET price_ils = 750 WHERE id = 'wl-bst-003';
UPDATE public.parts SET price_ils = 6800 WHERE id = 'wl-bst-004';

UPDATE public.parts SET price_ils = 12000 WHERE name LIKE '%Garrett%';
UPDATE public.parts SET price_ils = 890 WHERE name LIKE '%HKS%';

-- Verify
SELECT id, name, price_ils, hp_gain FROM public.parts ORDER BY price_ils DESC NULLS LAST;
