import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/directus';
import { TagPill } from '@/components/TagPill';

export default async function PostsPage() {
  const posts = await getPosts();
  const tags = await getTags();

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card ocean-floor rounded-3xl p-8 pb-14">
          <h1 className="text-4xl font-black">文章 / POSTS</h1>
          <p className="mt-3 text-slate-600">记录每一次探索，整理每一次思考。</p>
          <div className="mt-5 flex flex-wrap gap-2">{tags.slice(0, 10).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
        </header>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</section>
      </div>
    </PageShell>
  );
}
