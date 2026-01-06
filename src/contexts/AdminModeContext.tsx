'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminModeContextType {
  isAdminModeActive: boolean;
  toggleAdminMode: () => void;
  setAdminMode: (active: boolean) => void;
}

interface AdminModeProviderProps {
  children: ReactNode;
  isUserAdmin: boolean;
  isUserAuthenticated: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

const ADMIN_MODE_KEY = 'adminModeActive';

export function AdminModeProvider({ children, isUserAdmin, isUserAuthenticated }: AdminModeProviderProps) {
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Recuperar estado do localStorage na montagem
  useEffect(() => {
    const savedMode = localStorage.getItem(ADMIN_MODE_KEY);
    if (savedMode === 'true' && isUserAdmin && isUserAuthenticated) {
      setIsAdminModeActive(true);
    }
    setIsHydrated(true);
  }, [isUserAdmin, isUserAuthenticated]);

  // Desativar admin mode automaticamente se usuário não é admin ou não está logado
  useEffect(() => {
    if (isHydrated && (!isUserAdmin || !isUserAuthenticated)) {
      setIsAdminModeActive(false);
      localStorage.setItem(ADMIN_MODE_KEY, 'false');
    }
  }, [isUserAdmin, isUserAuthenticated, isHydrated]);

  // Persistir estado no localStorage sempre que mudar
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(ADMIN_MODE_KEY, String(isAdminModeActive));
    }
  }, [isAdminModeActive, isHydrated]);

  const toggleAdminMode = () => {
    // Só permite toggle se for admin E estiver logado
    if (isUserAdmin && isUserAuthenticated) {
      setIsAdminModeActive((prev) => !prev);
    }
  };

  const setAdminMode = (active: boolean) => {
    // Só permite ativar se for admin E estiver logado
    if (active && (!isUserAdmin || !isUserAuthenticated)) {
      return;
    }
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
