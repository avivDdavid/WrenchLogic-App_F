import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

  const [userParts, setUserParts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mirror to localStorage so a guest (no session) keeps their garage,
  // and the UI has an instant offline cache.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userParts));
  }, [userParts]);

  // Load the signed-in user's garage from Supabase (source of truth).
  const refreshFromSupabase = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('garage_entries')
      .select('*, parts(*, categories(slug, name))')
      .eq('user_id', user.id);

    if (error) {
      console.error('[garage] failed to load from Supabase:', error.message);
      return;
    }
    setUserParts((data ?? []).map(normalizeEntry));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = async () => { await refreshFromSupabase(); };
    load();
  }, [user, refreshFromSupabase]);

  const addToGarage = async (part, status = 'planned') => {
    // Optimistic local update (covers guest mode + instant button feedback)
    setUserParts(prev =>
      prev.some(p => p.id === part.id) ? prev : [...prev, { ...part, status }]
    );

    if (!user) return; // guest: localStorage only

    const { error } = await supabase
      .from('garage_entries')
      .insert({ user_id: user.id, part_id: part.id, status });

    if (error) {
      console.error('[garage] failed to add to Supabase:', error.message);
      return;
    }
    refreshFromSupabase();
  };

  const removeFromGarage = async (partId) => {
    setUserParts(prev => prev.filter(p => p.id !== partId));

    if (!user) return;

    const { error } = await supabase
      .from('garage_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('part_id', partId);

    if (error) console.error('[garage] failed to remove from Supabase:', error.message);
  };

  const updatePartStatus = async (partId, newStatus) => {
    setUserParts(prev =>
      prev.map(p => p.id === partId ? { ...p, status: newStatus } : p)
    );

    if (!user) return;

    const { error } = await supabase
      .from('garage_entries')
      .update({ status: newStatus })
      .eq('user_id', user.id)
      .eq('part_id', partId);

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
