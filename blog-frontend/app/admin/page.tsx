import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { AdminShell } from '@/components/AdminShell';
import { AdminEditor } from '@/components/AdminEditor';
import { AdminPostList } from '@/components/AdminPostList';
import { AdminTaxonomy } from '@/components/AdminTaxonomy';
import { readTaxonomy, readTaxonomyUsage } from '@/lib/admin-taxonomy';
import { adminFetch, requireAdminSession } from '@/lib/directus-admin';
import { getPostTagIds } from '@/lib/post-tags';
import { AdminAbout } from '@/components/AdminAbout';
import { normalizeAbout, type AboutRecord } from '@/lib/about';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '管理后台 - Shark Tech Blog',
  robots: { index: false, follow: false },
};

// 编辑模式：通过 /admin?view=editor&id=xxx 加载现有文章
async function getPostForEdit(id: string) {
  const result = await adminFetch<{
    data: {
      id: number;
      title: string;
      slug: string;
      summary: string;
      content: string;
      status: 'draft' | 'published';
      published_at: string;
      category: number | { id: number } | null;
      tags: Array<{ tags_id: { id: number } | number } | number> | { id: number } | number | null;
      tag_links: Array<{ tags_id: number }>;
    };
  }>(`/items/posts/${id}?fields=id,title,slug,summary,content,status,published_at,category,tags.*,tag_links.*`);

  if (result.error || !result.data?.data) {
    console.error('[admin] getPostForEdit 失败:', { id, status: result.status, error: result.error });
    return null;
  }
  const item = result.data.data;
  // 规范化 category 和 tags（Directus 可能返回对象或 ID）
  const categoryId =
    typeof item.category === 'number' ? item.category
    : item.category && typeof item.category === 'object' && 'id' in item.category ? item.category.id
    : null;
  const tagIds = getPostTagIds(item);
  return {
    id: item.id,
    title: item.title ?? '',
    slug: item.slug ?? '',
    summary: item.summary ?? '',
    content: item.content ?? '',
    status: (item.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    published_at: item.published_at ?? new Date().toISOString(),
    category: categoryId,
    tags: tagIds,
  };
}

export default async function AdminPage({
  searchParams: pendingSearchParams,
}: {
  searchParams: Promise<{ view?: string; id?: string }>;
}) {
  if (!(await requireAdminSession()).ok) redirect('/login');
  const searchParams = await pendingSearchParams;
  const view = searchParams.view;

  if (view === 'about') {
    const result = await adminFetch<{ data: AboutRecord }>('/items/about_settings/1');
    return (
      <PageShell>
        <AdminShell view="about">
          {result.data?.data ? <AdminAbout initial={normalizeAbout(result.data.data)} /> : (
            <PixelCard>
              <h2 className="text-2xl font-black">关于我设置读取失败</h2>
              <p role="alert" className="mt-2 text-sm text-[var(--ink-soft)]">请检查 Directus 连接和设置初始化。</p>
              <a href="/admin?view=about" className="mt-4 inline-flex rounded-lg border px-3 py-2 text-sm font-bold">重试</a>
            </PixelCard>
          )}
        </AdminShell>
      </PageShell>
    );
  }

  if (view === 'categories' || view === 'tags') {
    const [result, usage] = await Promise.all([readTaxonomy(view), readTaxonomyUsage(view)]);
    return (
      <PageShell>
        <AdminShell view={view}>
          {result.data ? (
            <AdminTaxonomy key={view} collection={view} items={result.data.data} usage={usage} />
          ) : (
            <PixelCard>
              <h2 className="text-2xl font-black">{view === 'categories' ? '分类' : '标签'}读取失败</h2>
              <p role="alert" className="mt-2 text-sm text-[var(--ink-soft)]">暂时无法从 Directus 加载数据。</p>
              <a href={`/admin?view=${view}`} className="mt-4 inline-flex rounded-lg border px-3 py-2 text-sm font-bold">重试</a>
            </PixelCard>
          )}
        </AdminShell>
      </PageShell>
    );
  }

  if (view === 'editor') {
    const [categories, tags, editingPost] = await Promise.all([
      readTaxonomy('categories'),
      readTaxonomy('tags'),
      searchParams.id ? getPostForEdit(searchParams.id) : null,
    ]);
    const postLoadFailed = Boolean(searchParams.id && !editingPost);

    if (postLoadFailed || !categories.data || !tags.data) {
      return (
        <PageShell>
          <AdminShell view="editor">
            <section className="mx-auto max-w-2xl rounded-3xl border-2 border-red-200 bg-white p-8 text-center shadow-pixel">
              <h2 className="text-2xl font-black">{postLoadFailed ? '文章读取失败' : '分类或标签读取失败'}</h2>
              <p role="alert" className="mt-3 text-[var(--ink-soft)]">{postLoadFailed ? '文章可能已删除，或暂时无法从 Directus 读取。' : '编辑器需要先从 Directus 读取分类和标签。'}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a href={`/admin?view=editor${searchParams.id ? `&id=${encodeURIComponent(searchParams.id)}` : ''}`} className="rounded-xl bg-accent px-4 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">重试</a>
                <a href="/admin" className="rounded-xl border-2 border-ocean-800/20 px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">返回文章管理</a>
              </div>
            </section>
          </AdminShell>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <AdminShell view="editor">
          <AdminEditor
            key={editingPost?.id ?? 'new'}
            categories={categories.data.data.map((item) => ({
              id: String(item.id),
              name: item.name || `未命名 #${item.id}`,
              slug: item.slug ?? '',
              icon: item.icon || '📁',
              description: item.description ?? '',
            }))}
            tags={tags.data.data.map((item) => ({
              id: String(item.id),
              name: item.name || `未命名 #${item.id}`,
              slug: item.slug ?? '',
              color: item.color ?? undefined,
            }))}
            post={editingPost}
          />
        </AdminShell>
      </PageShell>
    );
  }

  // 仪表盘视图：拉取包含草稿的完整文章列表
  const allPostsResult = await adminFetch<{
    data: Array<{
      id: number;
      title: string;
      slug: string;
      status: 'draft' | 'published';
      published_at: string | null;
      date_updated: string | null;
      category: { name: string } | null;
      views: number;
    }>;
  }>('/items/posts?limit=-1&sort=-published_at&fields=*,category.name');

  const allPosts = allPostsResult.data?.data ?? [];
  const drafts = allPosts.filter((post) => post.status === 'draft').length;
  const totalViews = allPosts.reduce((total, post) => total + (post.views ?? 0), 0);

  return (
    <PageShell>
      <AdminShell view="dashboard">
        <section className="space-y-6">
          <header>
            <h2 className="text-3xl font-black">欢迎回来，Shark</h2>
            <p className="mt-2 text-slate-500">这是网站的实时数据概览与文章管理。</p>
          </header>
          {allPostsResult.error ? (
            <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              暂时无法读取 Directus 管理数据，统计和文章列表未加载。{allPostsResult.error}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <PixelCard>
                <p className="text-sm font-bold text-slate-500">文章总数</p>
                <p className="mt-2 text-3xl font-black text-ocean-900">{allPosts.length}</p>
                <p className="mt-2 text-sm font-bold text-slate-500">{drafts} 篇草稿</p>
              </PixelCard>
              <PixelCard>
                <p className="text-sm font-bold text-slate-500">总访问量</p>
                <p className="mt-2 text-3xl font-black text-ocean-900">{totalViews.toLocaleString('zh-CN')}</p>
                <p className="mt-2 text-sm font-bold text-slate-500">所有文章累计</p>
              </PixelCard>
            </div>
          )}
          <PixelCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">文章管理</h2>
              <a
                href="/admin?view=editor"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-black text-white shadow-pixel hover:opacity-90 dark:bg-accent-dark dark:text-ocean-900"
              >
                + 新建文章
              </a>
            </div>
            {allPostsResult.error ? (
              <a href="/admin" className="inline-flex rounded-lg border px-3 py-2 text-sm font-bold hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">重试读取</a>
            ) : (
              <AdminPostList posts={allPosts} />
            )}
          </PixelCard>
        </section>
      </AdminShell>
    </PageShell>
  );
}
