import { NextResponse } from 'next/server';
import { adminFetch, requireAdminSession } from '@/lib/directus-admin';

// GET /api/admin/posts — 列出所有文章（含草稿，按时间倒序）
export async function GET() {
  const session = await requireAdminSession();
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const result = await adminFetch(
    '/items/posts?sort=-published_at&fields=id,title,slug,status,published_at,category.name,views'
  );
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: result.data?.data ?? [] });
}

// POST /api/admin/posts — 创建文章
export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  // 基础校验
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: '标题必填' }, { status: 400 });
  }
  if (!body.slug || typeof body.slug !== 'string' || !body.slug.trim()) {
    return NextResponse.json({ error: 'slug 必填' }, { status: 400 });
  }

  // 构造 Directus payload（只允许白名单字段）
  const payload: Record<string, any> = {
    title: body.title.trim(),
    slug: body.slug.trim(),
    summary: body.summary ?? '',
    content: body.content ?? '',
    status: body.status === 'published' ? 'published' : 'draft',
    published_at: body.published_at ?? new Date().toISOString(),
    category: body.category ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    views: 0,
  };

  const result = await adminFetch('/items/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: result.data?.data }, { status: 201 });
}
