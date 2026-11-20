import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { StatsGrid } from '@/components/StatsGrid';
import { getPosts } from '@/lib/directus';
import { computeSiteStats } from '@/lib/stats';
import { getAbout } from '@/lib/about';
import { authorLinks } from '@/lib/site-profile';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '关于 - Shark Tech Blog',
  description: '关于我、技能与联系方式。',
};

export default async function AboutPage() {
  const [posts, about] = await Promise.all([getPosts(), getAbout()]);
  const stats = computeSiteStats(posts);
  return (
    <PageShell>
      <div className="space-y-6">
        <Reveal>
          <header className="pixel-card grid items-center gap-6 rounded-3xl p-8 md:grid-cols-[1fr_260px]">
            <div>
              <h1 className="text-4xl font-black md:text-5xl dark:text-ocean-100">关于我</h1>
              <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">
                {about.intro}
              </p>
              <p className="mt-4 font-mono font-black text-accent dark:text-accent-dark">
                {about.motto}
              </p>
            </div>
            <div className="hidden justify-center md:flex">
              <BrandMark size={200} className="text-mint" />
            </div>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <StatsGrid stats={stats} />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal delay={120}>
            <PixelCard>
              <h2 className="mb-4 text-2xl font-black dark:text-ocean-100">关于我 / BIO</h2>
              <p className="whitespace-pre-wrap leading-8 text-slate-600 dark:text-slate-300">
                {about.bio}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {authorLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm font-bold text-accent underline dark:text-accent-dark">{label}</a>
                  </li>
                ))}
              </ul>
            </PixelCard>
          </Reveal>
          <Reveal delay={200}>
            <PixelCard>
              <h2 className="mb-4 text-2xl font-black dark:text-ocean-100">技术栈 / TECH STACK</h2>
              <div className="flex flex-wrap gap-3">
                {about.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl border-2 border-ocean-800/20 bg-white/70 px-4 py-2 font-bold dark:border-ocean-400/20 dark:bg-surface-elevated dark:text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </PixelCard>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
