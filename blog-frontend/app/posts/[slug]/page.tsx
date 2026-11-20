import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArticleContent } from '@/components/ArticleContent';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { PostThumb } from '@/components/PostThumb';
import { TagPill } from '@/components/TagPill';
import { Reveal } from '@/components/Reveal';
import { getPostBySlug, getPostCollection, getPosts } from '@/lib/directus';
import { formatDate } from '@/lib/utils';
import { Eye } from '@/components/icons';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };
  return {
    title: `${post.title} - Shark Tech Blog`,
    description: post.summary,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const { posts, notice } = await getPostCollection();

  const relatedPosts = posts
    .filter((p) => p.slug !== post.slug)
    .map((candidate) => {
      const sameCategory = candidate.category.id !== 'uncategorized' && candidate.category.id === post.category.id;
      const sharedTags = candidate.tags.filter((tag) => post.tags.some((current) => current.slug === tag.slug)).length;
      return { candidate, score: (sameCategory ? 2 : 0) + sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);

  return (
    <PageShell notice={notice}>
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/posts"
          className="inline-flex items-center rounded-xl border-2 border-ocean-800/20 bg-white/60 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-ocean-400/20 dark:bg-surface/60 dark:text-slate-300"
        >
          ← 返回文章列表
        </Link>
        <section className="pixel-card rounded-3xl p-6 md:p-8">
          <div className="mb-6 grid gap-6 border-b border-[var(--line-soft)] pb-6 md:grid-cols-[1fr_220px]">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.category ? (
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent transition hover:bg-accent/25 dark:bg-accent-dark/15 dark:text-accent-dark"
                  >
                    分类: {post.category.name}
                  </Link>
                ) : null}
                {post.tags.map((tag) => (
                  <TagPill key={tag.id} name={tag.name} color={tag.color} href={`/posts?tag=${encodeURIComponent(tag.slug)}`} />
                ))}
              </div>
              <h1 className="break-words text-3xl font-black leading-tight sm:text-4xl">{post.title}</h1>
              <section aria-label="文章摘要" className="mt-5 border-l-[3px] border-accent/50 pl-4">
                <h2 className="text-xs font-bold text-accent dark:text-accent-dark">摘要</h2>
                <p className="mt-1 max-w-prose leading-7 text-[var(--ink-soft)]">{post.summary || '这篇文章暂未提供摘要。'}</p>
              </section>
              <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDate(post.publishedAt)} · Shark</span>
                <span className="flex items-center gap-1"><Eye size={14} /> {post.views} 浏览</span>
              </p>
            </div>
            {post.cover ? (
              <div className="relative h-full min-h-44">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="220px"
                  className="rounded-xl border-2 border-ocean-900/60 object-cover dark:border-ocean-400/20"
                />
              </div>
            ) : (
              <PostThumb slug={post.category?.slug} />
            )}
          </div>
          <ArticleContent content={post.content} />
        </section>
        {relatedPosts.length > 0 ? (
          <Reveal>
            <PixelCard>
              <h3 className="mb-3 font-black">相关文章</h3>
              <div className="space-y-3">
                {relatedPosts.map((p) => (
                  <Link key={p.id} href={`/posts/${p.slug}`} className="block rounded-xl bg-white/60 p-3 text-sm font-bold transition-colors hover:text-accent dark:bg-surface-elevated/60 dark:hover:text-accent-dark">
                    {p.title}
                  </Link>
                ))}
              </div>
            </PixelCard>
          </Reveal>
        ) : null}
      </div>
    </PageShell>
  );
}
