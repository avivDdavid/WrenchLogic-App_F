-- ============================================================
-- WrenchLogic — Benchmark RPC
-- Run once in the Supabase dashboard → SQL Editor.
--
-- WHY: garage_entries RLS restricts SELECT to the user's own rows.
-- A SECURITY DEFINER function runs as postgres (owner), so it can
-- aggregate across ALL users without exposing any individual rows —
-- we return only counts and aggregated numbers, never user_id.
--
-- The app (src/components/GarageBenchmark.jsx) calls this via
-- supabase.rpc('get_benchmark_stats'). If the function doesn't
-- exist the component shows a graceful "not enough data" state.
-- Safe to re-run (CREATE OR REPLACE).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_benchmark_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count   int;
  v_avg_gain     int;
  v_gains_sorted int[];
BEGIN
  SELECT
    COUNT(DISTINCT ge.user_id)::int,
    ROUND(AVG(totals.hp_gain))::int,
    array_agg(totals.hp_gain ORDER BY totals.hp_gain) AS gains_sorted
  INTO v_user_count, v_avg_gain, v_gains_sorted
  FROM (
    SELECT ge.user_id, SUM(p.hp_gain)::int AS hp_gain
    FROM   garage_entries ge
    JOIN   parts           p  ON p.id = ge.part_id
    WHERE  ge.status = 'installed'
      AND  p.hp_gain IS NOT NULL
    GROUP  BY ge.user_id
  ) totals;

  RETURN json_build_object(
    'user_count',    COALESCE(v_user_count,   0),
    'avg_hp_gain',   COALESCE(v_avg_gain,     0),
    'gains_sorted',  COALESCE(v_gains_sorted, ARRAY[]::int[])
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_benchmark_stats() TO anon, authenticated;
