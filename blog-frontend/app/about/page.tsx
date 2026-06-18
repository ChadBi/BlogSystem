import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { SharkMascot } from '@/components/SharkMascot';
import { StatsGrid } from '@/components/StatsGrid';

const skills = ['Rust', 'TypeScript', 'Python', 'Linux', 'Docker', 'Git', 'Web', 'Nginx', 'SQLite', 'TailwindCSS', 'Vite', 'Markdown'];

export default function AboutPage() {
  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card ocean-floor grid items-center gap-6 rounded-3xl p-8 pb-14 md:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-5xl font-black">关于我</h1>
            <p className="mt-4 text-lg font-bold text-slate-700">一名热爱代码的开发者，在像素世界里探索技术与未知。</p>
            <p className="mt-4 font-mono font-black text-coral">DIVE INTO THE OCEAN OF CODE!</p>
          </div>
          <SharkMascot variant="laptop" />
        </header>
        <StatsGrid />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <PixelCard><h2 className="mb-4 text-2xl font-black">关于我 / BIO</h2><p className="leading-8 text-slate-600">你好！我是 Shark，一名计算机科学专业的学生和独立开发者。我热爱编程、探索新技术，也喜欢潜入像素海洋，构建有趣的应用与工具。这里记录了我的学习笔记、项目实践和技术思考。</p></PixelCard>
          <PixelCard><h2 className="mb-4 text-2xl font-black">技术栈 / TECH STACK</h2><div className="flex flex-wrap gap-3">{skills.map((skill) => <span key={skill} className="rounded-xl border-2 border-ocean-800/20 bg-white/70 px-4 py-2 font-bold">{skill}</span>)}</div></PixelCard>
        </div>
      </div>
    </PageShell>
  );
}
