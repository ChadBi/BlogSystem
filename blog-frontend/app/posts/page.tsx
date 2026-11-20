import type { Metadata } from 'next';
import Link from 'next/link';
import { FilterSelect } from '@/components/FilterSelect';
import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { getCategories, getPostCollection, getTags } from '@/lib/directus';

export const metadata: Metadata = {
  title: '文章 - Shark Tech Blog',
  description: '浏览技术文章，按关键词、分类和标签查找内容。',
};

type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;

function valueOf(value: SearchValue): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function pageHref(params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete('page');
  else next.set('page', String(page));
  const query = next.toString();
  return query ? `/posts?${query}` : '/posts';
}

export default async function PostsPage({ searchParams: pendingSearchParams }: { searchParams: Promise<SearchParams> }) {
  const searchParams = await pendingSearchParams;
  const q = valueOf(searchParams.q).trim();
  const category = valueOf(searchParams.category);
  const tag = valueOf(searchParams.tag);
  const sort = valueOf(searchParams.sort) === 'oldest' ? 'oldest' : 'newest';
  const requestedPage = Math.max(1, Number.parseInt(valueOf(searchParams.page), 10) || 1);
  const [{ posts, notice }, categories, tags] = await Promise.all([getPostCollection(), getCategories(), getTags()]);

  const normalizedQuery = q.toLocaleLowerCase();
  const filtered = posts
    .filter((post) => !normalizedQuery || `${post.title} ${post.summary} ${post.content} ${post.tags.map((item) => item.name).join(' ')}`.toLocaleLowerCase().includes(normalizedQuery))
    .filter((post) => !category || post.category?.slug === category)
    .filter((post) => !tag || post.tags.some((item) => item.slug === tag))
    .sort((a, b) => {
      const difference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return sort === 'oldest' ? difference : -difference;
    });

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visiblePosts = filtered.slice((page - 1) * pageSize, page * pageSize);
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  if (sort !== 'newest') params.set('sort', sort);
  const activeCategory = categories.find((item) => item.slug === category);
  const activeTag = tags.find((item) => item.slug === tag);

  return (
    <PageShell notice={notice}>
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-accent dark:text-accent-dark">文章归档 / ARCHIVE</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">找到值得读的内容</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">按关键词、分类或标签筛选，筛选条件会保存在当前链接中。</p>
        </header>

        <form key={params.toString()} action="/posts" className="pixel-card grid gap-4 rounded-3xl p-5 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto] xl:items-end">
          <label className="block text-sm font-bold">
            关键词
            <input name="q" defaultValue={q} placeholder="搜索标题、摘要和正文" className="mt-2 w-full rounded-xl border border-ocean-800/20 bg-white px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent dark:bg-surface-elevated" />
          </label>
          <FilterSelect label="分类" name="category" defaultValue={category} options={[
            { value: '', label: '全部分类' }, ...categories.map((item) => ({ value: item.slug, label: item.name })),
          ]} />
          <FilterSelect label="标签" name="tag" defaultValue={tag} options={[
            { value: '', label: '全部标签' }, ...tags.map((item) => ({ value: item.slug, label: item.name })),
          ]} />
          <FilterSelect label="排序" name="sort" defaultValue={sort} options={[
            { value: 'newest', label: '最新发布' }, { value: 'oldest', label: '最早发布' },
          ]} />
          <button className="rounded-xl bg-accent px-5 py-2.5 font-black text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-accent-dark dark:text-ocean-900">应用筛选</button>
        </form>

        <section aria-live="polite" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold">共 {filtered.length} 篇文章{visiblePosts.length ? ` · 第 ${page} / ${pageCount} 页` : ''}</p>
            {(q || category || tag || sort !== 'newest') && <Link href="/posts" className="rounded-lg px-3 py-2 text-sm font-bold text-accent underline-offset-4 hover:underline dark:text-accent-dark">清除筛选</Link>}
          </div>
          {(activeCategory || activeTag || q) && <p className="text-sm text-slate-500">当前条件：{[q && `关键词“${q}”`, activeCategory?.name, activeTag?.name].filter(Boolean).join(' · ')}</p>}
          {visiblePosts.length ? (
            <div className="grid gap-4 md:grid-cols-2">{visiblePosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
          ) : (
            <div className="pixel-card rounded-3xl p-10 text-center">
              <h2 className="text-2xl font-black">没有找到相关文章</h2>
              <p className="mt-2 text-slate-500">试试更短的关键词，或清除部分筛选条件。</p>
              <Link href="/posts" className="mt-5 inline-flex rounded-xl bg-accent px-4 py-2.5 font-bold text-white dark:bg-accent-dark dark:text-ocean-900">查看全部文章</Link>
            </div>
          )}
          {pageCount > 1 && <nav aria-label="文章分页" className="flex items-center justify-center gap-3 pt-3">
            {page > 1 && <Link rel="prev" href={pageHref(params, page - 1)} className="rounded-xl border px-4 py-2 font-bold hover:border-accent">上一页</Link>}
            <span aria-current="page" className="px-2 text-sm text-slate-500">{page} / {pageCount}</span>
            {page < pageCount && <Link rel="next" href={pageHref(params, page + 1)} className="rounded-xl border px-4 py-2 font-bold hover:border-accent">下一页</Link>}
          </nav>}
        </section>
      </div>
    </PageShell>
  );
}
