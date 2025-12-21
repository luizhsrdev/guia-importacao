'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminModeContextType {
  isAdminModeActive: boolean;
  toggleAdminMode: () => void;
  setAdminMode: (active: boolean) => void;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);

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
