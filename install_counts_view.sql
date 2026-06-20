-- ============================================================
-- WrenchLogic — Social proof: public install-count view
-- Run this in the Supabase dashboard → SQL Editor. (Optional)
--
-- WHY: garage_entries RLS limits SELECT to the signed-in user's OWN rows,
-- so a client-side "SELECT part_id, COUNT(*) ... GROUP BY part_id" only sees
-- that one user's installs. This view aggregates across ALL users.
--
-- A view created here is owned by `postgres` and (by default,
-- security_invoker = off) runs with the owner's privileges, so it returns
-- global counts without exposing any per-user rows. We only expose the
-- aggregate (part_id + count), never user_id.
--
-- After running this, set SOURCE = 'part_install_counts' in
-- src/lib/installCounts.js (and read row.install_count) to use global counts.
-- Safe to re-run.
-- ============================================================

CREATE OR REPLACE VIEW public.part_install_counts AS
  SELECT part_id, COUNT(*)::int AS install_count
  FROM public.garage_entries
  WHERE part_id IS NOT NULL
  GROUP BY part_id;

GRANT SELECT ON public.part_install_counts TO anon, authenticated;
