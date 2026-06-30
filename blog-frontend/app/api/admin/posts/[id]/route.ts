import { NextResponse } from 'next/server';
import { adminFetch, requireAdminSession } from '@/lib/directus-admin';

// GET /api/admin/posts/[id] — 获取单篇文章（编辑模式回填）
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const result = await adminFetch(
    `/items/posts/${params.id}?fields=*,category.id,tags.tags_id.id`
  );
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: result.data?.data });
}

// PATCH /api/admin/posts/[id] — 更新文章
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  // 白名单字段（只允许更新这些）
  const allowed: Record<string, any> = {};
  const fields = ['title', 'slug', 'summary', 'content', 'status', 'published_at', 'category', 'tags'];
  for (const f of fields) {
    if (f in body) {
      if (f === 'status') {
        allowed[f] = body[f] === 'published' ? 'published' : 'draft';
      } else if (f === 'tags') {
        allowed[f] = Array.isArray(body[f]) ? body[f] : [];
      } else {
        allowed[f] = body[f];
      }
    }
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 });
  }

  const result = await adminFetch(`/items/posts/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(allowed),
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: result.data?.data });
}

// DELETE /api/admin/posts/[id] — 删除文章
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const result = await adminFetch(`/items/posts/${params.id}`, {
    method: 'DELETE',
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
