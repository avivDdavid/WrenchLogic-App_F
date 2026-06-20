-- ============================================================
-- WrenchLogic — per-part model compatibility
-- Run manually in the Supabase dashboard → SQL Editor. Idempotent.
-- NULL compatible_models = universal (fits every car).
-- ============================================================

ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS compatible_models TEXT[] DEFAULT NULL;

-- Golf GTI ספציפי
UPDATE public.parts SET compatible_models = ARRAY['golf-gti']
WHERE id IN ('wl-tur-001', 'wl-eng-002', 'wl-eng-003', 'wl-eng-004');

-- Golf R ספציפי
UPDATE public.parts SET compatible_models = ARRAY['golf-r']
WHERE id IN ('wl-bst-004');

-- VAG פלטפורמה (Golf GTI + Golf R + Leon Cupra)
UPDATE public.parts SET compatible_models = ARRAY['golf-gti','golf-r','leon-cupra']
WHERE id IN ('wl-int-001','wl-int-002','wl-int-003','wl-int-004',
             'wl-exh-001','wl-exh-002','wl-exh-003','wl-exh-004',
             'wl-bst-001','wl-bst-002','wl-bst-003');

-- הונדה ספציפי
UPDATE public.parts SET compatible_models = ARRAY['civic-type-r','civic-si']
WHERE id IN ('wl-eng-002','wl-eng-003');

-- אוניברסלי (NULL = מתאים לכולם)
-- בלמים ומתלים נשארים NULL כי הם אוניברסליים

-- Verify
SELECT id, name, compatible_models FROM public.parts ORDER BY id;
