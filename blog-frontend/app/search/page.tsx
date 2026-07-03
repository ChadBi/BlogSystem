import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { Reveal } from '@/components/Reveal';
import { getPosts, getTags } from '@/lib/directus';
import { TagPill } from '@/components/TagPill';

export const metadata: Metadata = {
  title: '搜索 - Shark Tech Blog',
  description: '搜索站内文章。',
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string | string[] } }) {
  const rawQ = searchParams.q;
  const qStr = Array.isArray(rawQ) ? rawQ[0] ?? '' : rawQ ?? '';
  const q = qStr.toLowerCase();
  const posts = await getPosts();
  const tags = await getTags();
  const results = q ? posts.filter((p) => `${p.title} ${p.summary} ${p.tags.map((t) => t.name).join(' ')}`.toLowerCase().includes(q)) : posts;

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="pixel-card h-fit rounded-3xl p-5 dark:text-ink">
          <h2 className="mb-4 text-xl font-black dark:text-ocean-100">搜索过滤 / FILTER</h2>
          <form className="space-y-4">
            <input
              name="q"
              defaultValue={qStr}
              placeholder="输入关键词..."
              className="w-full rounded-xl border-2 border-ocean-800/25 bg-white px-4 py-3 outline-none focus:border-accent dark:border-ocean-400/25 dark:bg-surface-elevated dark:text-ink dark:placeholder:text-slate-400"
            />
            <button className="w-full rounded-xl bg-accent px-4 py-3 font-black text-white transition-transform hover:-translate-y-0.5 dark:bg-accent-dark dark:text-ocean-900">
              搜索
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">{tags.slice(0, 8).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
        </aside>
        <section className="pixel-card rounded-3xl p-6 dark:text-ink">
          <h1 className="text-3xl font-black dark:text-ocean-100">搜索结果 / SEARCH RESULTS</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">找到 {results.length} 条结果 {q && `：${qStr}`}</p>
          <div className="mt-6 space-y-4">
            {results.map((post, i) => (
              <Reveal key={post.id} delay={(i % 4) * 50}>
                <PostCard post={post} compact />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
