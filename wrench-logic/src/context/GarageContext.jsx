import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useVehicle } from './VehicleContext';

const STORAGE_KEY = 'wrenchlogic_garage';

const GarageContext = createContext(null);

// Collapse duplicate garage_entries that share the same part id (the DB can
// hold several rows for one part from repeated adds). Keeps one entry per part,
// preferring an 'installed' row over a 'planned' one. Without this, the garage
// lists render duplicate React keys → children get duplicated/omitted, which
// looked like planned parts "flashing then disappearing".
const dedupeByPartId = (parts) => {
  const byId = new Map();
  for (const p of parts) {
    const existing = byId.get(p.id);
    if (!existing || (existing.status !== 'installed' && p.status === 'installed')) {
      byId.set(p.id, p);
    }
  }
  return [...byId.values()];
};

// garage_entries row (with nested parts) → local part shape used across the app
const normalizeEntry = (entry) => ({
  id:          entry.parts?.id            ?? entry.part_id,
  name:        entry.parts?.name          ?? '',
  name_en:     entry.parts?.name_en       ?? null,
  description: entry.parts?.description   ?? '',
  description_en: entry.parts?.description_en ?? null,
  category:    entry.parts?.categories?.slug ?? '',
  hpGain:      entry.parts?.hp_gain       ?? 0,
  torqueGain:  entry.parts?.torque_gain_nm ?? 0,
  weightChange: entry.parts?.weight_change_kg ?? 0,
  imageUrl:    entry.parts?.image_url     ?? '',
  status:      entry.status,
});

export function GarageProvider({ children }) {
  const { user, session } = useAuth();
  const { selectedVehicle } = useVehicle();

  // Distinguish a real in-session login from a reload that restores a session.
  const sawGuestRef = useRef(false);
  useEffect(() => { if (session === null) sawGuestRef.current = true; }, [session]);

  // DB scoping uses the real vehicles.id UUID. Null for guests or a vehicle that
  // hasn't been saved to the DB — garage_entries.vehicle_id is nullable.
  const dbVehicleId = selectedVehicle?.id ?? null;
  // Local cache is scoped by the stable cars.json variant id (works for guests
  // too, who have no DB id) so switching cars never bleeds parts across.
  const cacheVehicleId = selectedVehicle?.engine?.id ?? null;
  const cacheKey  = cacheVehicleId ? `${STORAGE_KEY}_${cacheVehicleId}` : null;

  // In-memory by default. Guests keep their garage only in React state
  // (gone when the tab closes) — nothing is written to localStorage.
  const [userParts, setUserParts] = useState([]);

  // Signed-in users: hydrate the cached garage for the CURRENT vehicle on
  // login / vehicle switch (Supabase below is the source of truth and overwrites it).
  useEffect(() => {
    if (!user || !cacheKey) return;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) setUserParts(dedupeByPartId(JSON.parse(stored)));
    } catch { /* ignore corrupt cache */ }
  }, [user, cacheKey]);

  // Signed-in users: mirror the current vehicle's garage to localStorage.
  // Guests (or no vehicle): do nothing.
  useEffect(() => {
    if (!user || !cacheKey) return;
    localStorage.setItem(cacheKey, JSON.stringify(userParts));
  }, [user, cacheKey, userParts]);

  // Login / logout transitions.
  const prevUserIdRef = useRef(user?.id ?? null);
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    const currId = user?.id ?? null;
    prevUserIdRef.current = currId;

    // REAL LOGIN (was a guest in-session, now authenticated): discard the
    // guest's in-memory garage. refreshFromSupabase (below) then loads the
    // authenticated user's own entries — never carry guest parts into the
    // signed-in session.
    if (!prevId && currId && sawGuestRef.current) {
      sawGuestRef.current = false;
      setUserParts([]);
    }

    // LOGOUT: wipe the garage from memory and remove every per-vehicle
    // garage/target cache, so the next visitor (even a guest) sees no trace of
    // the previous user. Language/theme prefs are intentionally left untouched.
    if (prevId && !currId) {
      setUserParts([]);
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('wrenchlogic_garage') || k.startsWith('wrenchlogic_target'))
          .forEach(k => localStorage.removeItem(k));
      } catch { /* ignore */ }
    }
  }, [user]);

  // Load the signed-in user's garage for the selected vehicle (source of truth).
  // Scope must match addToGarage's insert: when there's no real vehicle UUID,
  // entries are stored with vehicle_id = null, so read those back (instead of
  // clearing the list, which made optimistic adds vanish after the refresh).
  const refreshFromSupabase = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from('garage_entries')
      .select('*, parts(*, categories(slug, name))')
      .eq('user_id', user.id);
    query = dbVehicleId
      ? query.eq('vehicle_id', dbVehicleId)
      : query.is('vehicle_id', null);

    const { data, error } = await query;

    if (error) {
      console.error('[garage] failed to load from Supabase:', error.message);
      return;
    }
    setUserParts(dedupeByPartId((data ?? []).map(normalizeEntry)));
  }, [user, dbVehicleId]);

  // Reload whenever the user or the selected vehicle changes.
  useEffect(() => {
    if (!user) return;
    refreshFromSupabase();
  }, [user, refreshFromSupabase]);

  const addToGarage = async (part, status = 'planned') => {
    // Already in this garage? Do nothing — re-inserting created duplicate DB
    // rows (one per click), which broke rendering with non-unique React keys.
    const alreadyInGarage = userParts.some(p => p.id === part.id);

    // Optimistic local update (covers guest mode + instant button feedback)
    setUserParts(prev =>
      prev.some(p => p.id === part.id) ? prev : [...prev, { ...part, status }]
    );

    if (!user || alreadyInGarage) return; // guest: in-memory only / no dup insert

    const { error } = await supabase
      .from('garage_entries')
      .insert({ user_id: user.id, part_id: part.id, status, vehicle_id: dbVehicleId });

    if (error) {
      console.error('[garage] failed to add to Supabase:', error.message);
      return;
    }
    refreshFromSupabase();
  };

  const removeFromGarage = async (partId) => {
    setUserParts(prev => prev.filter(p => p.id !== partId));

    if (!user) return;

    const del = supabase
      .from('garage_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('part_id', partId);
    if (dbVehicleId) del.eq('vehicle_id', dbVehicleId);
    const { error } = await del;

    if (error) console.error('[garage] failed to remove from Supabase:', error.message);
  };

  const updatePartStatus = async (partId, newStatus) => {
    setUserParts(prev =>
      prev.map(p => p.id === partId ? { ...p, status: newStatus } : p)
    );

    if (!user) return;

    const upd = supabase
      .from('garage_entries')
      .update({ status: newStatus })
      .eq('user_id', user.id)
      .eq('part_id', partId);
    if (dbVehicleId) upd.eq('vehicle_id', dbVehicleId);
    const { error } = await upd;

    if (error) console.error('[garage] failed to update status in Supabase:', error.message);
  };

  const clearGarage = () => setUserParts([]);

  return (
    <GarageContext.Provider value={{ userParts, addToGarage, removeFromGarage, updatePartStatus, clearGarage, refreshFromSupabase }}>
      {children}
    </GarageContext.Provider>
  );
}

export function useGarage() {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used inside GarageProvider');
  return ctx;
}
