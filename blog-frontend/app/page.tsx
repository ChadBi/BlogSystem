import { getPosts, getTags } from '@/lib/directus';
import { Hero } from '@/components/Hero';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { PostCard } from '@/components/PostCard';
import { StatsGrid } from '@/components/StatsGrid';
import { TagPill } from '@/components/TagPill';

export default async function HomePage() {
  const allPosts = await getPosts();
  const allTags = await getTags();

  return (
    <PageShell>
      <div className="space-y-6">
        <Hero />
        <section className="grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
          <PixelCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">最新文章</h2>
              <a href="/posts" className="text-sm font-bold text-coral">查看全部 →</a>
            </div>
            <div className="space-y-3">{allPosts.slice(0, 4).map((post) => <PostCard key={post.id} post={post} compact />)}</div>
          </PixelCard>
          <div className="space-y-6">
            <PixelCard><h2 className="mb-4 text-xl font-black">个人数据 / STATS</h2><StatsGrid /></PixelCard>
            <PixelCard>
              <h2 className="mb-4 text-xl font-black">人气标签 TOP 8</h2>
              <div className="flex flex-wrap gap-2">{allTags.slice(0, 8).map((tag) => <TagPill key={tag.id} name={`${tag.name} ${tag.count ?? ''}`} color={tag.color} />)}</div>
            </PixelCard>
          </div>
        </section>
        <PixelCard>
          <h2 className="mb-4 text-2xl font-black">代码片段 / CODE SNIPPET</h2>
          <pre className="code-window rounded-2xl p-5 text-sm"><code>{`fn main() {\n  let ocean = "Ocean of Internet";\n  let passion = vec!["Code", "Design", "Share"];\n\n  for thing in passion {\n    println!("Dive into {} 🌊", thing);\n  }\n}`}</code></pre>
        </PixelCard>
      </div>
    </PageShell>
  );
}
