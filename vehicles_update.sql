-- ============================================================
-- WrenchLogic — recent-vehicles support on public.vehicles
-- Run manually in the Supabase dashboard → SQL Editor. Idempotent.
-- ============================================================

-- 1) Flags / timestamps
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_default   BOOLEAN     DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT now();

-- 2) Columns the app writes to (needed to rebuild selectedVehicle).
--    Safe no-ops if they already exist.
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS make_id           TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS manufacturer_name TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model_id          TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model_name        TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS year              INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_id         TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_code       TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS base_hp           INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS base_torque_nm    INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine            JSONB;

-- 3) One row per (user, engine variant) so re-selecting upserts instead of
--    duplicating. engine_id is unique per variant; (engine_code, year) is NOT
--    (e.g. Golf GTI & Golf R are both "EA888 Gen4" in 2022), so we key on it.
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_user_engine_uniq
  ON public.vehicles (user_id, engine_id);

-- 4) Row-Level Security — each user sees/edits only their own vehicles.
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_select_own" ON public.vehicles;
CREATE POLICY "vehicles_select_own" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vehicles_insert_own" ON public.vehicles;
CREATE POLICY "vehicles_insert_own" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vehicles_update_own" ON public.vehicles;
CREATE POLICY "vehicles_update_own" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vehicles_delete_own" ON public.vehicles;
CREATE POLICY "vehicles_delete_own" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Verify
SELECT id, user_id, year, manufacturer_name, model_name, engine_code,
       base_hp, base_torque_nm, is_default, last_used_at
FROM public.vehicles
ORDER BY user_id, is_default DESC, last_used_at DESC;
