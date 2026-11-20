import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { Reveal } from '@/components/Reveal';
import { getPostCollection, getTags } from '@/lib/directus';
import { TagPill } from '@/components/TagPill';

export const metadata: Metadata = {
  title: '搜索 - Shark Tech Blog',
  description: '搜索站内文章。',
};

export default async function SearchPage({ searchParams: pendingSearchParams }: {
  searchParams: Promise<{ q?: string | string[]; tag?: string | string[] }>;
}) {
  const searchParams = await pendingSearchParams;
  const rawQ = searchParams.q;
  const qStr = Array.isArray(rawQ) ? rawQ[0] ?? '' : rawQ ?? '';
  const q = qStr.toLowerCase();
  const rawTag = searchParams.tag;
  const tagSlug = Array.isArray(rawTag) ? rawTag[0] ?? '' : rawTag ?? '';
  const { posts, notice } = await getPostCollection();
  const tags = await getTags();
  const results = posts.filter((p) => (!q || `${p.title} ${p.summary} ${p.tags.map((t) => t.name).join(' ')}`.toLowerCase().includes(q)) && (!tagSlug || p.tags.some((tag) => tag.slug === tagSlug)));
  const selectedTag = tags.find((tag) => tag.slug === tagSlug);

  return (
    <PageShell notice={notice}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="pixel-card h-fit rounded-3xl p-5 dark:text-ink">
          <h2 className="mb-4 text-xl font-black dark:text-ocean-100">搜索过滤 / FILTER</h2>
          <form className="space-y-4">
            {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
            <input
              aria-label="搜索关键词"
              name="q"
              defaultValue={qStr}
              placeholder="输入关键词..."
              className="w-full rounded-xl border-2 border-ocean-800/25 bg-white px-4 py-3 outline-none focus:border-accent dark:border-ocean-400/25 dark:bg-surface-elevated dark:text-ink dark:placeholder:text-slate-400"
            />
            <button className="w-full rounded-xl bg-accent px-4 py-3 font-black text-white transition-transform hover:-translate-y-0.5 dark:bg-accent-dark dark:text-ocean-900">
              搜索
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">{tags.slice(0, 8).map((tag) => <a key={tag.id} href={`/search?tag=${encodeURIComponent(tag.slug)}`} aria-current={tag.slug === tagSlug ? 'true' : undefined}><TagPill name={tag.name} color={tag.color} /></a>)}</div>
        </aside>
        <section className="pixel-card rounded-3xl p-6 dark:text-ink">
          <h1 className="text-3xl font-black dark:text-ocean-100">搜索结果 / SEARCH RESULTS</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">找到 {results.length} 条结果 {q && `：${qStr}`} {selectedTag && `· 标签：${selectedTag.name}`}</p>
          <div className="mt-6 space-y-4">
            {results.map((post, i) => (
              <Reveal key={post.id} delay={(i % 4) * 50}>
                <PostCard post={post} compact />
              </Reveal>
            ))}
            {results.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">没有找到匹配的文章。试试其他关键词或清除标签筛选。</div>}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
