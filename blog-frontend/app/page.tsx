import Link from 'next/link';
import Image from 'next/image';
import { getPostCollection, getTags } from '@/lib/directus';
import { computeSiteStats } from '@/lib/stats';
import { Hero } from '@/components/Hero';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { PostCard } from '@/components/PostCard';
import { StatsGrid } from '@/components/StatsGrid';
import { TagPill } from '@/components/TagPill';
import { Reveal } from '@/components/Reveal';
import { ArrowRight } from '@/components/icons';
import { PostThumb } from '@/components/PostThumb';

export default async function HomePage() {
  const { posts: allPosts, notice } = await getPostCollection();
  const allTags = await getTags();
  const stats = computeSiteStats(allPosts);
  const topTags = [...allTags].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).slice(0, 8);
  const featured = allPosts[0];
  const recent = allPosts.slice(1, 5);

  return (
    <PageShell notice={notice}>
      <div className="space-y-6">
        <Hero />

        <section className="grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
          <PixelCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">最新文章</h2>
              <Link href="/posts" className="flex items-center gap-1 text-sm font-bold text-accent transition-colors hover:text-accent-dark dark:text-accent-dark">
                查看全部 <ArrowRight size={14} />
              </Link>
            </div>
              {recent.length > 0 ? (
                <div className="space-y-3">{recent.map((post, i) => <Reveal key={post.id} delay={i * 60}><PostCard post={post} compact /></Reveal>)}</div>
              ) : (
                <div className="rounded-2xl border border-dashed border-ocean-800/20 p-6 text-center dark:border-ocean-400/20">
                  <p className="font-bold">还没有公开文章</p>
                  <p className="mt-1 text-sm text-slate-500">新文章发布后会显示在这里。</p>
                </div>
              )}
          </PixelCard>
          <div className="space-y-6">
            <PixelCard>
              <h2 className="mb-4 text-xl font-black">个人数据</h2>
              <StatsGrid stats={stats} />
            </PixelCard>
            <PixelCard>
              <h2 className="mb-4 text-xl font-black">人气标签</h2>
              <div className="flex flex-wrap gap-2">{topTags.map((tag) => <TagPill key={tag.id} name={`${tag.name} ${tag.count ?? ''}`} color={tag.color} href={`/posts?tag=${encodeURIComponent(tag.slug)}`} />)}</div>
            </PixelCard>
          </div>
        </section>

        {featured ? (
          <Reveal>
            <PixelCard className="overflow-hidden p-0" corner>
              <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
                <div className="relative min-h-56">
                  {featured.cover ? (
                    <Image
                      src={featured.cover}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : <PostThumb slug={featured.category?.slug} />}
                </div>
                <div className="p-6 md:p-8">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent dark:text-accent-dark">精选文章</p>
                  <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">{featured.title}</h2>
                  <p className="mt-3 line-clamp-3 text-slate-600 dark:text-slate-300">{featured.summary}</p>
                  <Link
                    href={`/posts/${featured.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 font-black text-white transition-transform duration-200 hover:-translate-y-0.5 dark:bg-accent-dark dark:text-ocean-900"
                  >
                    阅读全文 <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </PixelCard>
          </Reveal>
        ) : null}
      </div>
    </PageShell>
  );
}
