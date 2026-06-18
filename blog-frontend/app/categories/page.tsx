import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { TagPill } from '@/components/TagPill';
import { getCategories, getTags } from '@/lib/directus';

export default async function CategoriesPage() {
  const categories = await getCategories();
  const tags = await getTags();

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card ocean-floor rounded-3xl p-8 pb-14">
          <h1 className="text-4xl font-black">分类 & 标签</h1>
          <p className="mt-3 text-slate-600">探索知识海洋，发现感兴趣的技术领域。</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <PixelCard><h2 className="mb-4 text-2xl font-black">分类 / CATEGORIES</h2><div className="grid gap-3">{categories.map((cat) => <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-ocean-800/20 bg-white/70 p-4"><div><p className="font-black">{cat.icon} {cat.name}</p><p className="mt-1 text-sm text-slate-500">{cat.description}</p></div><span className="rounded-lg bg-coral/10 px-3 py-1 font-black text-coral">{cat.count ?? 0} 篇</span></div>)}</div></PixelCard>
          <PixelCard><h2 className="mb-4 text-2xl font-black">标签云 / TAG CLOUD</h2><div className="flex flex-wrap gap-3">{tags.map((tag) => <TagPill key={tag.id} name={`${tag.name} (${tag.count ?? 0})`} color={tag.color} />)}</div></PixelCard>
        </div>
      </div>
    </PageShell>
  );
}
