import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { fetchRecentVehicles, rowToVehicle } from '../lib/recentVehicles';

const STORAGE_KEY = 'wrenchlogic_vehicle';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const { user, session } = useAuth();

  // In-memory by default. Guests never touch localStorage — their selection
  // lives only in React state and is gone when the tab closes.
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Track whether we've seen a definite logged-out (guest) session. Lets us
  // tell a real in-session login apart from a reload that restores a session.
  const sawGuestRef = useRef(false);
  useEffect(() => { if (session === null) sawGuestRef.current = true; }, [session]);

  // Signed-in users: hydrate the cached vehicle on (re)load (instant restore).
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSelectedVehicle(JSON.parse(stored));
    } catch { /* ignore corrupt cache */ }
  }, [user]);

  // Signed-in users: keep localStorage as a cache. Guests: do nothing.
  useEffect(() => {
    if (!user) return;
    if (selectedVehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedVehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, selectedVehicle]);

  // Login / logout transitions.
  const prevUserIdRef = useRef(user?.id ?? null);
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    const currId = user?.id ?? null;
    prevUserIdRef.current = currId;

    // REAL LOGIN (was a guest in-session, now authenticated): the user's own
    // data is authoritative. Discard whatever vehicle the guest picked and load
    // the user's most-recent vehicle from the DB — never carry the guest's car
    // into the signed-in session.
    if (!prevId && currId && sawGuestRef.current) {
      sawGuestRef.current = false;
      setSelectedVehicle(null); // discard guest selection immediately
      (async () => {
        const rows = await fetchRecentVehicles(currId);
        setSelectedVehicle(rows && rows.length ? rowToVehicle(rows[0]) : null);
      })();
    }

    // LOGOUT: wipe selection from memory + cache, so no trace remains — not even
    // for a guest who keeps browsing afterwards.
    if (prevId && !currId) {
      setSelectedVehicle(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }, [user]);

  return (
    <VehicleContext.Provider value={{ selectedVehicle, setSelectedVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used inside VehicleProvider');
  return ctx;
}
