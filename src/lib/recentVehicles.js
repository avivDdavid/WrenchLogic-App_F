import { supabase } from './supabase';

// Recent-vehicle history is per-user and capped. Re-selecting a car bumps it
// to the top; once the cap is exceeded the oldest entry is dropped.
const MAX_RECENT = 5;

// DB row → app vehicle shape (matches VehicleContext.selectedVehicle).
// Prefer the full engine JSONB; fall back to the scalar columns if absent.
export const rowToVehicle = (row) => ({
  makeId:    row.make_id,
  makeName:  row.manufacturer_name,
  modelId:   row.model_id,
  modelName: row.model_name,
  year:      row.year,
  engine:    row.engine ?? {
    id:          row.engine_id,
    code:        row.engine_code,
    stockHp:     row.base_hp,
    stockTorque: row.base_torque_nm,
  },
});

// Fetch a user's recent vehicles — default first, then most-recently used.
export async function fetchRecentVehicles(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default',   { ascending: false })
    .order('last_used_at', { ascending: false });
  if (error) { console.error('[vehicles] fetch failed:', error.message); return []; }
  return data ?? [];
}

// Upsert the vehicle as "just used", then prune to the 5 most recent.
export async function saveRecentVehicle(userId, vehicle) {
  const engineId = vehicle?.engine?.id;
  if (!userId || !engineId) return;

  const payload = {
    user_id:           userId,
    make_id:           vehicle.makeId,
    manufacturer_name: vehicle.makeName,
    model_id:          vehicle.modelId,
    model_name:        vehicle.modelName,
    year:              vehicle.year,
    engine_id:         engineId,
    engine_code:       vehicle.engine.code ?? null,
    base_hp:           vehicle.engine.stockHp ?? null,
    base_torque_nm:    vehicle.engine.stockTorque ?? null,
    engine:            vehicle.engine,
    last_used_at:      new Date().toISOString(),
  };

  // Upsert on (user_id, engine_id): re-selecting an existing car just bumps it.
  // NOTE: engine_id (unique per variant) is used instead of (engine_code, year)
  // because many models share an engine code in the same year (e.g. Golf GTI &
  // Golf R are both "EA888 Gen4" in 2022) — that key would collide.
  const { error } = await supabase
    .from('vehicles')
    .upsert(payload, { onConflict: 'user_id,engine_id' });
  if (error) { console.error('[vehicles] save failed:', error.message); return; }

  // Prune — keep only the MAX_RECENT most recent rows.
  const { data: all } = await supabase
    .from('vehicles')
    .select('id, last_used_at')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false });
  if (all && all.length > MAX_RECENT) {
    const stale = all.slice(MAX_RECENT).map(r => r.id);
    await supabase.from('vehicles').delete().in('id', stale);
  }
}

// Remove one vehicle from the user's history.
export async function deleteRecentVehicle(userId, engineId) {
  if (!userId || !engineId) return;
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('user_id', userId)
    .eq('engine_id', engineId);
  if (error) console.error('[vehicles] delete failed:', error.message);
}

// Mark one vehicle as default and clear the flag on all the user's others.
export async function setDefaultVehicle(userId, engineId) {
  if (!userId || !engineId) return;
  const clear = await supabase
    .from('vehicles')
    .update({ is_default: false })
    .eq('user_id', userId);
  if (clear.error) console.error('[vehicles] clear default failed:', clear.error.message);

  const set = await supabase
    .from('vehicles')
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('engine_id', engineId);
  if (set.error) console.error('[vehicles] set default failed:', set.error.message);
}
