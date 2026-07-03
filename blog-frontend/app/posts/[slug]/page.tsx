import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArticleContent } from '@/components/ArticleContent';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { PostThumb } from '@/components/PostThumb';
import { TagPill } from '@/components/TagPill';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { getPostBySlug, getPosts } from '@/lib/directus';
import { formatDate } from '@/lib/utils';
import { Eye } from '@/components/icons';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const posts = await getPosts();
  if (!post) notFound();

  const relatedPosts = posts
    .filter((p) => p.slug !== post.slug && p.category?.slug === post.category?.slug)
    .slice(0, 3);

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <main className="pixel-card rounded-3xl p-6 md:p-8">
          <div className="mb-6 grid gap-6 md:grid-cols-[1fr_220px]">
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
                {post.tags.map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}
              </div>
              <h1 className="text-4xl font-black leading-tight">{post.title}</h1>
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
          <div className="mb-6 rounded-2xl border-2 border-dashed border-accent bg-accent/5 p-4 font-bold text-ocean-900 dark:text-ocean-100">
            TL;DR：{post.summary}
          </div>
          <ArticleContent content={post.content} />
        </main>
        <aside className="space-y-4">
          <Reveal>
            <PixelCard>
              <h3 className="mb-3 font-black">作者信息</h3>
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ocean-100 text-ocean-900 dark:bg-ocean-900/40 dark:text-ocean-100">
                  <BrandMark size={32} />
                </div>
                <div>
                  <p className="font-black">Shark</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">开发者 / 设计师</p>
                </div>
              </div>
            </PixelCard>
          </Reveal>
          {relatedPosts.length > 0 ? (
            <Reveal delay={80}>
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
        </aside>
      </div>
    </PageShell>
  );
}
