/**
 * 외부/내부 URL을 안전하게 img/background 용도로만 쓰기 위한 최소 sanitize.
 * - http/https 허용
 * - same-origin 허용
 * - 나머지는 null
 */
export function toSafeUrl(raw?: string): string | null {
  if (!raw) return null;

  try {
    const url = new URL(raw, window.location.origin);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isSameOrigin = url.origin === window.location.origin;

    if (!isHttp && !isSameOrigin) return null;

    // style url() 인젝션/깨짐 방지용 최소 치환
    return url.toString().replace(/["')\\]/g, '');
  } catch {
    return null;
  }
}
