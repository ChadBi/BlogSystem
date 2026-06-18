import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/directus';
import { TagPill } from '@/components/TagPill';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').toLowerCase();
  const posts = await getPosts();
  const tags = await getTags();
  const results = q ? posts.filter((p) => `${p.title} ${p.summary} ${p.tags.map((t) => t.name).join(' ')}`.toLowerCase().includes(q)) : posts;

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="pixel-card h-fit rounded-3xl p-5">
          <h2 className="mb-4 text-xl font-black">搜索过滤 / FILTER</h2>
          <form className="space-y-4">
            <input name="q" defaultValue={searchParams.q} placeholder="输入关键词..." className="w-full rounded-xl border-2 border-ocean-800/25 bg-white px-4 py-3 outline-none focus:border-coral" />
            <button className="w-full rounded-xl bg-coral px-4 py-3 font-black text-white">搜索</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">{tags.slice(0, 8).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
        </aside>
        <section className="pixel-card rounded-3xl p-6">
          <h1 className="text-3xl font-black">搜索结果 / SEARCH RESULTS</h1>
          <p className="mt-2 text-slate-500">找到 {results.length} 条结果 {q && `：${searchParams.q}`}</p>
          <div className="mt-6 space-y-4">{results.map((post) => <PostCard key={post.id} post={post} compact />)}</div>
        </section>
      </div>
    </PageShell>
  );
}
