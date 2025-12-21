'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminModeContextType {
  isAdminModeActive: boolean;
  toggleAdminMode: () => void;
  setAdminMode: (active: boolean) => void;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

const ADMIN_MODE_KEY = 'adminModeActive';

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Recuperar estado do localStorage na montagem
  useEffect(() => {
    const savedMode = localStorage.getItem(ADMIN_MODE_KEY);
    if (savedMode === 'true') {
      setIsAdminModeActive(true);
    }
    setIsHydrated(true);
  }, []);

  // Persistir estado no localStorage sempre que mudar
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(ADMIN_MODE_KEY, String(isAdminModeActive));
    }
  }, [isAdminModeActive, isHydrated]);

  const toggleAdminMode = () => {
    setIsAdminModeActive((prev) => !prev);
  };

  const setAdminMode = (active: boolean) => {
    setIsAdminModeActive(active);
  };

  return (
    <AdminModeContext.Provider value={{ isAdminModeActive, toggleAdminMode, setAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
}
