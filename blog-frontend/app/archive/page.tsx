import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { Timeline } from '@/components/Timeline';
import { getPosts } from '@/lib/directus';

export default async function ArchivePage() {
  const posts = await getPosts();
  return (
    <PageShell>
      <PixelCard className="ocean-floor rounded-3xl p-8 pb-16">
        <h1 className="text-4xl font-black">归档时间线</h1>
        <p className="mt-3 text-slate-600">记录每一次探索的足迹，见证成长的每一步。</p>
        <div className="mt-8"><Timeline posts={posts} /></div>
      </PixelCard>
    </PageShell>
  );
}
