-- ============================================================
-- WrenchLogic — Allow public (guest) read of the catalog
-- Run this in the Supabase dashboard → SQL Editor.
--
-- WHY: the app now lets GUESTS (not signed in) browse the catalog
-- and keep a localStorage garage. But categories/parts have RLS that
-- only permitted SELECT for authenticated users, so as a guest the
-- queries returned an empty array ([]) with HTTP 200 — the catalog
-- looked "broken" / showed no categories or parts.
--
-- These tables are public reference data (not user-specific), so it is
-- safe to allow read access to the `anon` role too. Writes stay locked
-- (no INSERT/UPDATE/DELETE policy is added here).
--
-- Safe to re-run.
-- ============================================================

-- ── categories: public read ──────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── parts: public read ───────────────────────────────────
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read parts" ON public.parts;
CREATE POLICY "Public read parts"
  ON public.parts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sanity check (run as anon in the API, or here):
--   SELECT count(*) FROM public.categories;  -- expect 6
--   SELECT count(*) FROM public.parts;        -- expect your seeded parts
