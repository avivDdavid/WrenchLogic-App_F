import { supabase } from './supabase';

// Recent-vehicle history is per-user and capped. Newest first.
const MAX_RECENT = 5;

// Slugify a model name → the cars.json model id (e.g. "Civic Type R" →
// "civic-type-r"). The DB only stores model_name, but the rest of the app keys
// off modelId (vehicle photo in MODEL_IMAGES, part fitment via compatible_models),
// so we reconstruct it here. Matches every cars.json model id 1:1.
export const slugifyModel = (name) =>
  String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// DB row (real `vehicles` schema) → app vehicle shape (VehicleContext.selectedVehicle).
// Real columns only: id, user_id, manufacturer_name, model_name, year,
// engine_code, base_hp, base_torque_nm, base_weight_kg, created_at.
// `id` is the DB UUID — used as garage_entries.vehicle_id.
export const rowToVehicle = (row) => ({
  id:           row.id,
  makeName:     row.manufacturer_name,
  modelId:      slugifyModel(row.model_name),
  modelName:    row.model_name,
  year:         row.year,
  baseWeightKg: row.base_weight_kg ?? null,
  engine: {
    // No engine_id column in the DB — synthesize a stable local key from the
    // car's identity (used only for localStorage cache keys, never sent to DB).
    id:          `${row.model_name}-${row.year}-${row.engine_code}`,
    code:        row.engine_code,
    stockHp:     row.base_hp,
    stockTorque: row.base_torque_nm,
  },
});

// Fetch a user's recent vehicles — newest first (by created_at).
export async function fetchRecentVehicles(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('[vehicles] fetch failed:', error.message); return []; }
  return data ?? [];
}

// Save the selected vehicle for a signed-in user and return its DB UUID.
// Reuses an existing identical row (same make/model/year/engine) so we don't
// pile up duplicates. Returns null for guests or on failure.
export async function saveRecentVehicle(userId, vehicle) {
  if (!userId) return null;

  const manufacturer_name = vehicle.makeName;
  const model_name        = vehicle.modelName;
  const year              = vehicle.year;
  const engine_code       = vehicle.engine?.code ?? null;

  // Reuse an existing matching row if present.
  const { data: existing } = await supabase
    .from('vehicles')
    .select('id')
    .eq('user_id', userId)
    .eq('manufacturer_name', manufacturer_name)
    .eq('model_name', model_name)
    .eq('year', year)
    .eq('engine_code', engine_code)
    .limit(1);

  if (existing && existing.length > 0) return existing[0].id;

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      user_id:           userId,
      manufacturer_name,
      model_name,
      year,
      engine_code,
      base_hp:        vehicle.engine?.stockHp ?? null,
      base_torque_nm: vehicle.engine?.stockTorque ?? null,
      base_weight_kg: vehicle.baseWeightKg ?? null,
    })
    .select('id')
    .single();

  if (error) { console.error('[vehicles] save failed:', error.message); return null; }

  // Prune — keep only the MAX_RECENT most recent rows.
  const { data: all } = await supabase
    .from('vehicles')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (all && all.length > MAX_RECENT) {
    const stale = all.slice(MAX_RECENT).map(r => r.id);
    await supabase.from('vehicles').delete().in('id', stale);
  }

  return data?.id ?? null;
}
