'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';


type PostRow = {
  id: number | string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  date_updated: string | null;
  category?: { name: string } | null;
  views: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function AdminPostList({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pageSize = 8;

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...posts]
      .filter((post) => status === 'all' || post.status === status)
      .filter((post) => !normalizedQuery || `${post.title} ${post.slug}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aDate = new Date(a.date_updated || a.published_at || 0).getTime();
        const bDate = new Date(b.date_updated || b.published_at || 0).getTime();
        return sort === 'newest' ? bDate - aDate : aDate - bDate;
      });
  }, [posts, query, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateFilter(setter: () => void) {
    setter();
    setPage(1);
  }

  async function handleDelete(id: string | number, title: string) {
    if (deletingId !== null) return;
    if (!confirm(`确认删除文章「${title}」？删除后文章内容和公开页面都将移除，且无法恢复。`)) return;
    setError('');
    setSuccess('');
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '删除失败');
        return;
      }
      setSuccess(`已删除「${title}」`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px]">
        <label className="sr-only" htmlFor="admin-post-search">搜索文章</label>
        <input id="admin-post-search" value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder="搜索标题或 slug" className="rounded-xl border-2 border-ocean-800/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent" />
        <label className="sr-only" htmlFor="admin-post-status">文章状态</label>
        <select id="admin-post-status" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value as typeof status))} className="rounded-xl border-2 border-ocean-800/20 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent">
          <option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option>
        </select>
        <label className="sr-only" htmlFor="admin-post-sort">更新时间排序</label>
        <select id="admin-post-sort" value={sort} onChange={(event) => updateFilter(() => setSort(event.target.value as typeof sort))} className="rounded-xl border-2 border-ocean-800/20 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent">
          <option value="newest">最近更新</option><option value="oldest">最早更新</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p aria-live="polite">共 {filteredPosts.length} 篇文章{filteredPosts.length > 0 ? ` · 第 ${currentPage}/${totalPages} 页` : ''}</p>
        {(query || status !== 'all' || sort !== 'newest') && <button type="button" onClick={() => { setQuery(''); setStatus('all'); setSort('newest'); setPage(1); }} className="font-bold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">重置筛选</button>}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">文章管理列表</caption>
          <thead><tr className="border-b"><th className="py-3">标题</th><th>分类</th><th>状态</th><th>更新时间</th><th>访问</th><th>操作</th></tr></thead>
          <tbody>
            {visiblePosts.map((post) => (
              <tr key={post.id} className="border-b border-ocean-800/10">
                <td className="py-3 font-bold"><span className="line-clamp-2">{post.title}</span><span className="font-mono text-xs font-normal text-slate-400">/{post.slug}</span></td>
                <td className="text-slate-600">{post.category?.name ?? '—'}</td>
                <td>{post.status === 'published' ? <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">已发布</span> : <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">草稿</span>}</td>
                <td className="text-slate-600">{formatDate(post.date_updated || post.published_at)}{!post.date_updated && <span className="block text-xs text-slate-400">发布日期</span>}</td>
                <td className="text-slate-600">{post.views ?? 0}</td>
                <td><div className="flex gap-2 text-sm"><a href={`/admin?view=editor&id=${post.id}`} className="rounded-lg bg-ocean-100 px-2 py-1 font-bold text-ocean-800 hover:bg-ocean-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">✎ 编辑</a><button type="button" onClick={() => handleDelete(post.id, post.title)} disabled={deletingId === post.id} className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-600 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50" aria-label={`删除文章 ${post.title}`}>{deletingId === post.id ? '删除中...' : '✕ 删除'}</button></div></td>
              </tr>
            ))}
            {visiblePosts.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-500">{posts.length === 0 ? '暂无文章，点击「新建文章」开始写作。' : '没有符合条件的文章，请重置筛选。'}</td></tr>}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <nav className="flex items-center justify-center gap-3" aria-label="文章分页"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border px-3 py-1 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">上一页</button><span className="text-sm text-slate-500">{currentPage} / {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border px-3 py-1 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">下一页</button></nav>}
    </div>
  );
}
