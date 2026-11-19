import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminFetch, requireAdminSession, usesSinglePostTag } from '@/lib/directus-admin';

// GET /api/admin/posts — 列出所有文章（含草稿，按时间倒序）
export async function GET() {
  const session = await requireAdminSession();
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const result = await adminFetch(
    '/items/posts?limit=-1&sort=-published_at&fields=*,category.name'
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
  const singleTag = await usesSinglePostTag();
  const tagIds = Array.isArray(body.tags) ? body.tags : [];
  if (singleTag && tagIds.length > 1) {
    return NextResponse.json({ error: '当前 CMS 标签关联支持单选，请选择一个标签。' }, { status: 400 });
  }
  const payload: Record<string, any> = {
    title: body.title.trim(),
    slug: body.slug.trim(),
    summary: body.summary ?? '',
    content: body.content ?? '',
    status: body.status === 'published' ? 'published' : 'draft',
    published_at: body.published_at ?? new Date().toISOString(),
    category: body.category ?? null,
    tags: singleTag ? tagIds[0] ?? null : tagIds,
    views: 0,
  };

  const result = await adminFetch('/items/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ data: result.data?.data }, { status: 201 });
}
