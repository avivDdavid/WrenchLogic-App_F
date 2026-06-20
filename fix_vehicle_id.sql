-- ============================================================
-- WrenchLogic — backfill garage_entries.vehicle_id for legacy rows
-- Run manually in the Supabase dashboard → SQL Editor.
-- ============================================================
--
-- NOTE: vehicle_id must match selectedVehicle.engine.id used by the app
-- (e.g. 'vw-gti-ea888-2022', 'honda-ctr-k20c1-2022', ...), NOT the bare
-- engine code. The line below uses the placeholder the request specified —
-- replace 'EA888' with the correct engine id for the demo user's car.

UPDATE garage_entries
SET vehicle_id = 'EA888'
WHERE vehicle_id IS NULL
  AND user_id = (SELECT id FROM auth.users WHERE email = 'demo@wrenchlogic.com');

-- Recommended (real engine id from cars.json) — e.g. the 2022 Golf GTI:
-- UPDATE garage_entries
-- SET vehicle_id = 'vw-gti-ea888-2022'
-- WHERE vehicle_id IS NULL
--   AND user_id = (SELECT id FROM auth.users WHERE email = 'demo@wrenchlogic.com');

-- Verify
SELECT id, user_id, part_id, status, vehicle_id
FROM garage_entries
ORDER BY user_id, vehicle_id;
