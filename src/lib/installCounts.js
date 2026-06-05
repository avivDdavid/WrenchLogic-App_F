import { supabase } from './supabase';

// Social proof: how many garage_entries exist per part_id.
// Equivalent to: SELECT part_id, COUNT(*) FROM garage_entries GROUP BY part_id
//
// ONE read per page load — we pull all visible `part_id`s in a single request
// and aggregate client-side (PostgREST has no GROUP BY over the REST API).
//
// NOTE on counts: garage_entries RLS limits rows to the signed-in user's OWN
// entries, so this reflects the current user's installs. For true cross-user
// numbers, run `install_counts_view.sql` (a public aggregate view) and change
// the source below from 'garage_entries' to 'part_install_counts'
// (select 'part_id, install_count' and read row.install_count).
const SOURCE = 'garage_entries';

export async function fetchInstallCounts() {
  const { data, error } = await supabase.from(SOURCE).select('part_id');
  if (error || !data) return {};
  return data.reduce((acc, row) => {
    if (row.part_id) acc[row.part_id] = (acc[row.part_id] ?? 0) + 1;
    return acc;
  }, {});
}

// Badge text for a given install count.
export function installLabel(count) {
  return count > 0 ? `🔧 ${count} טיונרים התקינו` : 'היה הראשון להתקין';
}
