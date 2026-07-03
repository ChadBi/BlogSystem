import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { Timeline } from '@/components/Timeline';
import { getPosts } from '@/lib/directus';

export const metadata: Metadata = {
  title: '归档 - Shark Tech Blog',
  description: '按时间线查看所有文章。',
};

export default async function ArchivePage() {
  const posts = await getPosts();
  return (
    <PageShell>
      <div className="space-y-6">
        <Reveal>
          <div className="pixel-card rounded-3xl p-8">
            <h1 className="text-4xl font-black dark:text-ocean-100">归档时间线</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              记录每一次探索的足迹，见证成长的每一步。
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <Timeline posts={posts} />
        </Reveal>
      </div>
    </PageShell>
  );
}
