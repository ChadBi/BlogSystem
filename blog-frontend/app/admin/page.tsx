import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { AdminShell } from '@/components/AdminShell';
import { AdminEditor } from '@/components/AdminEditor';
import { AdminPostList } from '@/components/AdminPostList';
import { getCategories, getTags } from '@/lib/directus';
import { adminFetch, usesSinglePostTag } from '@/lib/directus-admin';

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
    };
  }>(`/items/posts/${id}?fields=id,title,slug,summary,content,status,published_at,category,tags.*`);

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
  const tagIds = Array.isArray(item.tags)
    ? item.tags.map((t) => {
        if (typeof t === 'number') return t;
        if (t && typeof t === 'object' && 'tags_id' in t && t.tags_id) {
          return typeof t.tags_id === 'number' ? t.tags_id : t.tags_id.id;
        }
        return null;
      }).filter((x): x is number => x !== null)
    : item.tags ? [typeof item.tags === 'number' ? item.tags : item.tags.id] : [];
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
  searchParams,
}: {
  searchParams: { view?: string; id?: string };
}) {
  const view = searchParams.view === 'editor' ? 'editor' : 'dashboard';

  if (view === 'editor') {
    const [categories, tags, singleTag] = await Promise.all([getCategories(), getTags(), usesSinglePostTag()]);
    // 编辑模式：尝试加载现有文章
    const editingPost = searchParams.id ? await getPostForEdit(searchParams.id) : null;

    if (searchParams.id && !editingPost) {
      return (
        <PageShell>
          <AdminShell view="editor">
            <section className="mx-auto max-w-2xl rounded-3xl border-2 border-red-200 bg-white p-8 text-center shadow-pixel">
              <h2 className="text-2xl font-black">文章读取失败</h2>
              <p className="mt-3 text-slate-600">文章可能已删除，或暂时无法从 Directus 读取。为避免误覆盖内容，编辑器未加载。</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a href={`/admin?view=editor&id=${encodeURIComponent(searchParams.id)}`} className="rounded-xl bg-accent px-4 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">重试</a>
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
            singleTag={singleTag}
            categories={categories}
            tags={tags}
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
