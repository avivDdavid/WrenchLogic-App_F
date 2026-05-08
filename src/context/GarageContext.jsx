import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'wrenchlogic_garage';

const GarageContext = createContext(null);

export function GarageProvider({ children }) {
  const [userParts, setUserParts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userParts));
  }, [userParts]);

  const addToGarage = (part, status = 'planned') => {
    setUserParts(prev => {
      if (prev.some(p => p.id === part.id)) return prev;
      return [...prev, { ...part, status }];
    });
  };

  const removeFromGarage = (partId) => {
    setUserParts(prev => prev.filter(p => p.id !== partId));
  };

  const updatePartStatus = (partId, newStatus) => {
    setUserParts(prev =>
      prev.map(p => p.id === partId ? { ...p, status: newStatus } : p)
    );
  };

  const clearGarage = () => setUserParts([]);

  return (
    <GarageContext.Provider value={{ userParts, addToGarage, removeFromGarage, updatePartStatus, clearGarage }}>
      {children}
    </GarageContext.Provider>
  );
}

export function useGarage() {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used inside GarageProvider');
  return ctx;
}
