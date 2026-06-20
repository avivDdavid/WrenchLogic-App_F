-- ============================================================
-- WrenchLogic — "New" badge: created_at on parts
-- Run in the Supabase dashboard → SQL Editor. Safe to re-run.
--
-- NOTE — two fixes vs. the original draft so the demo actually
-- shows ONLY 6 new parts:
--
--   (a) ADD COLUMN ... DEFAULT now() backfills EVERY existing row
--       to "now", so all parts would look new. Step 2 resets them
--       all to an old date first.
--   (b) The draft's WHERE mixed OR/AND (AND binds tighter than OR)
--       and used up to 20 days (> the 14-day "new" window). Step 3
--       targets exactly the 6 ids and uses ≤13 days so all 6 land
--       inside the 2-week window.
-- ============================================================

-- 1. Add the column if it doesn't exist.
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 2. Age every existing part so nothing is "new" by default.
UPDATE public.parts
SET created_at = NOW() - interval '60 days';

-- 3. Mark the 6 demo parts as recently added (0–13 days ago).
UPDATE public.parts
SET created_at = NOW() - (random() * interval '13 days')
WHERE id IN ('wl-eng-002', 'wl-int-002', 'wl-bst-002', 'wl-brk-002', 'wl-sus-002', 'wl-exh-002');
