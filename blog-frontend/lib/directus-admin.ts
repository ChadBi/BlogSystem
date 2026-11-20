import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Directus admin 凭据（仅服务端可见）
const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || '';

// 进程内缓存：access_token + 过期时间（毫秒）
let cachedToken: { token: string; expiresAt: number } | null = null;

// 登录 Directus admin 账号，返回 access_token
export async function getAdminToken(): Promise<string> {
  if (!DIRECTUS_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('DIRECTUS_URL / DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD 未配置');
  }
  // 缓存有效（提前 60s 失效避免边界）
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus 登录失败: ${res.status} ${text}`);
  }
  const data = await res.json();
  const token = data?.data?.access_token;
  const expiresIn = data?.data?.expires ?? 900_000; // Directus 返回毫秒，默认 15 分钟
  if (!token) throw new Error('Directus 登录响应缺少 access_token');
  cachedToken = {
    token,
    expiresAt: Date.now() + expiresIn,
  };
  return token;
}

// 带 admin token 调用 Directus API
export async function adminFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T | null; error?: string }> {
  try {
    const request = (token: string) => fetch(`${DIRECTUS_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    let res = await request(await getAdminToken());
    if (res.status === 401) {
      cachedToken = null;
      res = await request(await getAdminToken());
    }
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
    if (!res.ok) {
      return { status: res.status, data: null, error: body?.errors?.[0]?.message || `${res.status} ${res.statusText}` };
    }
    return { status: res.status, data: body as T, error: undefined };
  } catch (err) {
    return {
      status: 500,
      data: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// 校验当前请求是否已登录前端 admin（基于 session cookie）
export async function requireAdminSession(): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const valid = token ? await verifySessionToken(token) : false;
  if (!valid) {
    return { ok: false, status: 401, error: '未登录或会话已过期' };
  }
  return { ok: true };
}
