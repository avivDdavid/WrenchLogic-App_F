import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useVehicle } from './VehicleContext';

const STORAGE_KEY = 'wrenchlogic_garage';

const GarageContext = createContext(null);

// garage_entries row (with nested parts) → local part shape used across the app
const normalizeEntry = (entry) => ({
  id:         entry.parts?.id            ?? entry.part_id,
  name:       entry.parts?.name          ?? '',
  category:   entry.parts?.categories?.slug ?? '',
  hpGain:     entry.parts?.hp_gain       ?? 0,
  torqueGain: entry.parts?.torque_gain_nm ?? 0,
  imageUrl:   entry.parts?.image_url     ?? '',
  status:     entry.status,
});

export function GarageProvider({ children }) {
  const { user } = useAuth();
  const { selectedVehicle } = useVehicle();

  // The garage is per-vehicle: every entry belongs to a specific engine/platform.
  const vehicleId = selectedVehicle?.engine?.id ?? null;
  // Cache key is scoped by vehicle so switching cars never bleeds parts across.
  const cacheKey  = vehicleId ? `${STORAGE_KEY}_${vehicleId}` : null;

  // In-memory by default. Guests keep their garage only in React state
  // (gone when the tab closes) — nothing is written to localStorage.
  const [userParts, setUserParts] = useState([]);

  // Signed-in users: hydrate the cached garage for the CURRENT vehicle on
  // login / vehicle switch (Supabase below is the source of truth and overwrites it).
  useEffect(() => {
    if (!user || !cacheKey) return;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) setUserParts(JSON.parse(stored));
    } catch { /* ignore corrupt cache */ }
  }, [user, cacheKey]);

  // Signed-in users: mirror the current vehicle's garage to localStorage.
  // Guests (or no vehicle): do nothing.
  useEffect(() => {
    if (!user || !cacheKey) return;
    localStorage.setItem(cacheKey, JSON.stringify(userParts));
  }, [user, cacheKey, userParts]);

  // Load the signed-in user's garage for the selected vehicle (source of truth).
  const refreshFromSupabase = useCallback(async () => {
    if (!user) return;
    // No vehicle selected → nothing to show.
    if (!vehicleId) { setUserParts([]); return; }

    const { data, error } = await supabase
      .from('garage_entries')
      .select('*, parts(*, categories(slug, name))')
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('[garage] failed to load from Supabase:', error.message);
      return;
    }
    setUserParts((data ?? []).map(normalizeEntry));
  }, [user, vehicleId]);

  // Reload whenever the user or the selected vehicle changes.
  useEffect(() => {
    if (!user) return;
    refreshFromSupabase();
  }, [user, refreshFromSupabase]);

  const addToGarage = async (part, status = 'planned') => {
    // Optimistic local update (covers guest mode + instant button feedback)
    setUserParts(prev =>
      prev.some(p => p.id === part.id) ? prev : [...prev, { ...part, status }]
    );

    if (!user) return; // guest: in-memory only

    const { error } = await supabase
      .from('garage_entries')
      .insert({ user_id: user.id, part_id: part.id, status, vehicle_id: vehicleId });

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
    if (vehicleId) del.eq('vehicle_id', vehicleId);
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
    if (vehicleId) upd.eq('vehicle_id', vehicleId);
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
