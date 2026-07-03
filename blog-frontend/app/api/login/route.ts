import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  generateSessionToken,
} from '@/lib/auth';

// POST /api/login  校验密码并签发 HttpOnly cookie
export async function POST(request: Request) {
  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;
  if (!adminPassword) {
    return NextResponse.json(
      { error: '服务器未配置管理员密码' },
      { status: 500 }
    );
  }
  if (!authSecret) {
    return NextResponse.json(
      { error: '服务器未配置 AUTH_SECRET' },
      { status: 500 }
    );
  }

  // 恒定时间密码比较，避免时序侧信道
  const passwordStr = typeof body.password === 'string' ? body.password : '';
  const passwordBuf = Buffer.from(passwordStr);
  const adminBuf = Buffer.from(adminPassword);
  const sameLength = passwordBuf.length === adminBuf.length;
  const equal = sameLength && timingSafeEqual(passwordBuf, adminBuf);
  if (!equal) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  const token = await generateSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
