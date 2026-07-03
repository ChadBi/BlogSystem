import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { StatsGrid } from '@/components/StatsGrid';
import { getPosts } from '@/lib/directus';
import { computeSiteStats } from '@/lib/stats';

const skills = ['Rust', 'TypeScript', 'Python', 'Linux', 'Docker', 'Git', 'Web', 'Nginx', 'SQLite', 'TailwindCSS', 'Vite', 'Markdown'];

export const metadata: Metadata = {
  title: '关于 - Shark Tech Blog',
  description: '关于我、技能与联系方式。',
};

export default async function AboutPage() {
  const posts = await getPosts();
  const stats = computeSiteStats(posts);
  return (
    <PageShell>
      <div className="space-y-6">
        <Reveal>
          <header className="pixel-card grid items-center gap-6 rounded-3xl p-8 md:grid-cols-[1fr_260px]">
            <div>
              <h1 className="text-4xl font-black md:text-5xl dark:text-ocean-100">关于我</h1>
              <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">
                一名热爱代码的开发者，在像素世界里探索技术与未知。
              </p>
              <p className="mt-4 font-mono font-black text-accent dark:text-accent-dark">
                DIVE INTO THE OCEAN OF CODE!
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
              <p className="leading-8 text-slate-600 dark:text-slate-300">
                你好！我是 Shark，一名计算机科学专业的学生和独立开发者。我热爱编程、探索新技术，也喜欢潜入像素海洋，构建有趣的应用与工具。这里记录了我的学习笔记、项目实践和技术思考。
              </p>
            </PixelCard>
          </Reveal>
          <Reveal delay={200}>
            <PixelCard>
              <h2 className="mb-4 text-2xl font-black dark:text-ocean-100">技术栈 / TECH STACK</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
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
