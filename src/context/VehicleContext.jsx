import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'wrenchlogic_vehicle';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const { user } = useAuth();

  // In-memory by default. Guests never touch localStorage — their selection
  // lives only in React state and is gone when the tab closes.
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Signed-in users: hydrate the cached vehicle on login (instant restore).
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
