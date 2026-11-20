import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { PostCard } from '@/components/PostCard';
import { Reveal } from '@/components/Reveal';
import { CategoryIcon } from '@/components/icons';
import { getCategories, getPosts } from '@/lib/directus';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: '分类未找到' };
  return {
    title: `${category.name} - Shark Tech Blog`,
    description: category.description ?? `查看分类「${category.name}」下的所有文章`,
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const allPosts = await getPosts();
  const posts = allPosts.filter((p) => p.category.slug === slug);

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card rounded-3xl p-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/categories" className="hover:text-accent dark:hover:text-accent-dark">分类</Link>
            <span>/</span>
            <span className="font-bold text-ocean-900 dark:text-ocean-100">{category.name}</span>
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
              {category.icon ? <span className="text-xl" aria-hidden="true">{category.icon}</span> : <CategoryIcon slug={category.slug} size={24} />}
            </span>
            <h1 className="text-4xl font-black">{category.name}</h1>
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {category.description ?? `查看分类「${category.name}」下的所有文章`}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">共 {posts.length} 篇文章</p>
        </header>

        {posts.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 60}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </section>
        ) : (
          <div className="pixel-card rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400">
            该分类下暂时还没有文章。
          </div>
        )}
      </div>
    </PageShell>
  );
}
