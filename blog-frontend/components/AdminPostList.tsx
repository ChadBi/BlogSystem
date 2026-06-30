'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type PostRow = {
  id: number | string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  category?: { name: string } | null;
  views: number;
  likes: number;
  comments: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AdminPostList({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');

  async function handleDelete(id: string | number, title: string) {
    if (!confirm(`确认删除文章「${title}」？此操作不可恢复。`)) return;
    setError('');
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '删除失败');
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3">标题</th>
              <th>分类</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>访问</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-ocean-800/10">
                <td className="py-3 font-bold">{post.title}</td>
                <td className="text-slate-600">{post.category?.name ?? '—'}</td>
                <td>
                  {post.status === 'published' ? (
                    <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">已发布</span>
                  ) : (
                    <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">草稿</span>
                  )}
                </td>
                <td className="text-slate-600">{formatDate(post.published_at)}</td>
                <td className="text-slate-600">{post.views}</td>
                <td>
                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/admin?view=editor&id=${post.id}`}
                      className="rounded-lg bg-ocean-100 px-2 py-1 font-bold text-ocean-800 hover:bg-ocean-200"
                    >
                      ✎ 编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === post.id ? '删除中...' : '✕ 删除'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  暂无文章，点击「写作」Tab 创建第一篇吧
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
