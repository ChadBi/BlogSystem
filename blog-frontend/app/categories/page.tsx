import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { TagPill } from '@/components/TagPill';
import { Reveal } from '@/components/Reveal';
import { CategoryIcon } from '@/components/icons';
import { getCategories, getTags } from '@/lib/directus';

export const metadata: Metadata = {
  title: '分类 - Shark Tech Blog',
  description: '按分类浏览文章。',
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const tags = await getTags();

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card rounded-3xl p-8">
          <h1 className="text-4xl font-black">分类与标签</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">探索知识海洋，发现感兴趣的技术领域。</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <PixelCard>
            <h2 className="mb-4 text-2xl font-black">分类</h2>
            <div className="grid gap-3">
              {categories.map((cat, i) => (
                <Reveal key={cat.id} delay={i * 50}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-ocean-800/15 bg-white/70 p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-pixel dark:border-ocean-400/15 dark:bg-surface/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
                        <CategoryIcon slug={cat.slug} size={20} />
                      </span>
                      <div>
                        <p className="font-black">{cat.name}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cat.description}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-accent/10 px-3 py-1 font-black text-accent dark:bg-accent-dark/10 dark:text-accent-dark">{cat.count ?? 0} 篇</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </PixelCard>
          <PixelCard>
            <h2 className="mb-4 text-2xl font-black">标签云</h2>
            <div className="flex flex-wrap gap-3">{tags.map((tag) => <TagPill key={tag.id} name={`${tag.name} (${tag.count ?? 0})`} color={tag.color} />)}</div>
          </PixelCard>
        </div>
      </div>
    </PageShell>
  );
}
