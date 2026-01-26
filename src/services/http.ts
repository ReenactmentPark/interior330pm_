// src/services/http.ts
export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function buildUrl(path: string) {
  if (!API_BASE_URL) return path; // same-origin
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
    credentials: 'include', // 필요 없으면 제거 가능 (세션/쿠키 기반이면 유지)
  });

  if (!res.ok) {
    let details: unknown = undefined;
    try {
      details = await res.json();
    } catch {
      // ignore
    }
    const err: HttpError = {
      status: res.status,
      message: res.statusText || 'Request failed',
      details,
    };
    throw err;
  }

  return (await res.json()) as T;
}
