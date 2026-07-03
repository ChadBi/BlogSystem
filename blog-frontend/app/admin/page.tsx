import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { AdminShell } from '@/components/AdminShell';
import { AdminEditor } from '@/components/AdminEditor';
import { AdminPostList } from '@/components/AdminPostList';
import { getCategories, getPosts, getTags } from '@/lib/directus';
import { computeSiteStats, formatStat } from '@/lib/stats';
import { adminFetch } from '@/lib/directus-admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '管理后台 - Shark Tech Blog',
  robots: { index: false, follow: false },
};

// 编辑模式：通过 /admin?view=editor&id=xxx 加载现有文章
async function getPostForEdit(id: string) {
  const result = await adminFetch<{
    id: number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    status: 'draft' | 'published';
    published_at: string;
    category: number | { id: number } | null;
    tags: Array<{ tags_id: { id: number } } | number> | null;
  }>(`/items/posts/${id}?fields=id,title,slug,summary,content,status,published_at,category,tags.tags_id.id`);

  if (result.error || !result.data) return null;
  const item = result.data;
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
    : [];
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

  // 公共数据：分类、标签（编辑器侧栏需要）
  const [categories, tags, publishedPosts] = await Promise.all([
    getCategories(),
    getTags(),
    getPosts(),
  ]);

  if (view === 'editor') {
    // 编辑模式：尝试加载现有文章
    const editingPost = searchParams.id ? await getPostForEdit(searchParams.id) : null;

    return (
      <PageShell>
        <AdminShell view="editor">
          <AdminEditor
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
      category: { name: string } | null;
      views: number;
    }>;
  }>('/items/posts?sort=-published_at&fields=id,title,slug,status,published_at,category.name,views');

  const allPosts = allPostsResult.data?.data ?? [];
  const stats = computeSiteStats(publishedPosts);
  const metrics: [string, string, string][] = [
    ['文章总数', formatStat(stats.posts), `${allPosts.filter(p => p.status === 'draft').length} 草稿`],
    ['总访问量', formatStat(stats.views), '—'],
    ['访客总数', '3.8k', '示例数据'],
    ['资源文件', '312', '示例数据'],
  ];

  return (
    <PageShell>
      <AdminShell view="dashboard">
        <section className="space-y-6">
          <header>
            <h2 className="text-3xl font-black">欢迎回来，Shark</h2>
            <p className="mt-2 text-slate-500">这是网站的实时数据概览与文章管理。</p>
          </header>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map(([label, value, delta]) => (
              <PixelCard key={label}>
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-ocean-900">{value}</p>
                <p className="mt-2 text-sm font-bold text-slate-500">{delta}</p>
              </PixelCard>
            ))}
          </div>
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
            <AdminPostList posts={allPosts} />
          </PixelCard>
        </section>
      </AdminShell>
    </PageShell>
  );
}
