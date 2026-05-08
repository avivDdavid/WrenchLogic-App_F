import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'wrenchlogic_vehicle';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedVehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedVehicle]);

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
