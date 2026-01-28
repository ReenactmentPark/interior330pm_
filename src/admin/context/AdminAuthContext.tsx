import { createContext, useContext, useMemo, useState } from 'react';

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
};

const STORAGE_KEY = 'admin_auth';

const DEFAULT_AUTH: AdminAuthContextValue = {
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
};

const AdminAuthContext = createContext<AdminAuthContextValue>(DEFAULT_AUTH);

function mockVerify(id: string, password: string) {
  return id.trim() === 'admin' && password.trim() === '330pm';
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ 새로고침해도 유지
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  const value = useMemo<AdminAuthContextValue>(() => {
    return {
      isAuthenticated,

      login: (id, password) => {
        const ok = mockVerify(id, password);
        if (ok) {
          localStorage.setItem(STORAGE_KEY, '1');
          setIsAuthenticated(true);
        }
        return ok;
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
      },
    };
  }, [isAuthenticated]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
