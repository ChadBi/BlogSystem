// 鉴权工具：HMAC-SHA256 签名 + cookie 常量
// 使用 Web Crypto API，在 Edge Runtime（middleware）与 Node.js Runtime（Route Handler）均可用

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天，单位秒

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toHex(new Uint8Array(sig));
}

// 生成 session token：HMAC(AUTH_SECRET, ADMIN_PASSWORD)
export async function generateSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) {
    throw new Error('AUTH_SECRET 与 ADMIN_PASSWORD 环境变量必须配置');
  }
  return await hmac(secret, password);
}

// 验证 session token：重算期望值并恒定时间比较，防止时序攻击
export async function verifySessionToken(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) {
    return false;
  }
  const expected = await hmac(secret, password);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
