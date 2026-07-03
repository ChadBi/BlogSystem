import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/directus';
import { TagPill } from '@/components/TagPill';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: '文章 - Shark Tech Blog',
  description: '浏览所有文章，按时间倒序排列。',
};

export default async function PostsPage() {
  const posts = await getPosts();
  const tags = await getTags();
  const [featured, ...rest] = posts;

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card rounded-3xl p-8">
          <h1 className="text-4xl font-black">文章</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">记录每一次探索，整理每一次思考。</p>
          <div className="mt-5 flex flex-wrap gap-2">{tags.slice(0, 10).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
        </header>

        {featured ? (
          <Reveal>
            <PostCard post={featured} />
          </Reveal>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 60}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
