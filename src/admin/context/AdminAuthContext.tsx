import React, { createContext, useContext, useMemo, useState } from 'react';

type LoginResult = { ok: true } | { ok: false; message: string };

type AdminAuthValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (adminId: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  authHeader: () => Record<string, string>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const STORAGE_KEY = '330pm_admin_token';

function getApiBase() {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  return base.replace(/\/$/, '');
}
function url(path: string) {
  const base = getApiBase();
  if (!base) return path; // 개발 중 상대경로도 허용
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;

  const value = useMemo<AdminAuthValue>(() => {
    return {
      token,
      isAuthenticated,

      async login(adminId: string, password: string): Promise<LoginResult> {
        try {
          const resp = await fetch(url('/api/admin/auth/login'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            // ✅ 쿠키 안 쓰니까 credentials 넣지 마
            body: JSON.stringify({ admin_id: adminId, password }),
          });

          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            return { ok: false, message: `로그인 실패 (${resp.status}) ${text}`.trim() };
          }

          const data = (await resp.json()) as { ok?: boolean; token?: string };
          if (!data?.token) {
            return { ok: false, message: '서버 응답에 token이 없습니다.' };
          }

          try {
            localStorage.setItem(STORAGE_KEY, data.token);
          } catch {}
          setToken(data.token);

          return { ok: true };
        } catch (e) {
          console.error('[admin login] failed', e);
          return { ok: false, message: '네트워크 오류(콘솔 확인)' };
        }
      },

      logout() {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setToken(null);
      },

      authHeader() {
        const h: Record<string, string> = {};
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
      },
    };
  }, [token, isAuthenticated]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
