import { notFound } from 'next/navigation';
import { ArticleContent } from '@/components/ArticleContent';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { PostThumb } from '@/components/PostThumb';
import { TagPill } from '@/components/TagPill';
import { getPostBySlug, getPosts } from '@/lib/directus';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const posts = await getPosts();
  if (!post) notFound();

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <main className="pixel-card rounded-3xl p-6 md:p-8">
          <div className="mb-6 grid gap-6 md:grid-cols-[1fr_220px]">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">{post.tags.map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
              <h1 className="text-4xl font-black leading-tight">{post.title}</h1>
              <p className="mt-4 text-sm text-slate-500">{formatDate(post.publishedAt)} · Shark · 👁 {post.views} 浏览 · 💬 {post.comments} 评论</p>
            </div>
            {post.cover ? (
              <img
                src={post.cover}
                alt={post.title}
                className="h-full w-full rounded-xl border-2 border-ocean-900 object-cover"
              />
            ) : (
              <PostThumb icon="🦀" />
            )}
          </div>
          <div className="mb-6 rounded-2xl border-2 border-dashed border-coral bg-coral/5 p-4 font-bold text-ocean-900">TL;DR：{post.summary}</div>
          <ArticleContent content={post.content} />
        </main>
        <aside className="space-y-4">
          <PixelCard>
            <h3 className="mb-3 font-black">作者信息</h3>
            <div className="flex items-center gap-3"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-ocean-100 text-3xl">🦈</div><div><p className="font-black">Shark</p><p className="text-sm text-slate-500">开发者 / 设计师</p></div></div>
          </PixelCard>
          <PixelCard>
            <h3 className="mb-3 font-black">相关文章</h3>
            <div className="space-y-3">{posts.filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => <a key={p.id} href={`/posts/${p.slug}`} className="block rounded-xl bg-white/60 p-3 text-sm font-bold hover:text-coral">{p.title}</a>)}</div>
          </PixelCard>
        </aside>
      </div>
    </PageShell>
  );
}
