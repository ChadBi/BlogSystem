import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { Hero } from '@/components/Hero';
import { Eye, FileText, ArrowRight } from '@/components/icons';

function PixelBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border-2 border-[#17648c] bg-[#c5efff] px-2 py-1 font-mono text-[11px] font-bold text-[#17648c] shadow-[3px_3px_0_#17648c]">{children}</span>;
}

function DemoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border-2 border-[#17648c] bg-[#f8fdff] shadow-[5px_5px_0_#17648c] ${className}`}>{children}</div>;
}

export default function DesignDemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#dff6ff] text-[#123a5a]">
      <div className="pointer-events-none fixed inset-0 opacity-35 [background-image:linear-gradient(#8dd7f2_1px,transparent_1px),linear-gradient(90deg,#8dd7f2_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <nav className="mb-7 flex items-center justify-between rounded-2xl border-2 border-[#17648c] bg-[#f8fdff]/95 px-4 py-3 shadow-[4px_4px_0_#17648c]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#17648c] bg-[#8edbfa] text-[#12577e]">
              <BrandMark size={34} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#4c91b7]">SHARK TECH</p>
              <p className="font-black leading-none text-[#124b70]">浅海实验室</p>
            </div>
          </div>
          <div className="hidden gap-1 font-mono text-xs font-bold sm:flex">
            <span className="rounded-lg bg-[#c5efff] px-3 py-2 text-[#17648c]">首页</span>
            <Link href="/posts" className="rounded-lg px-3 py-2 text-[#17648c]">文章</Link>
            <Link href="/about" className="rounded-lg px-3 py-2 text-[#17648c]">关于</Link>
          </div>
          <Link href="/admin?view=editor" className="rounded-lg border-2 border-[#17648c] bg-[#17648c] px-3 py-2 font-mono text-xs font-bold text-white transition hover:-translate-y-0.5">返回后台</Link>
        </nav>

        <Hero />

        <section className="mt-10 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <DemoCard className="p-5 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#4c91b7]">LATEST LOGS</p><h2 className="mt-1 text-2xl font-black text-[#124b70]">最近文章</h2></div>
              <Link href="/posts" className="font-mono text-xs font-bold text-[#17648c]">全部文章 →</Link>
            </div>
            <div className="space-y-3">
              {[
                ['Docker 最佳实践 2026', '部署、镜像瘦身与生产环境的 12 条经验。', '运维'],
                ['TypeScript 类型体操实战', '从类型推导到模板字面量的练习记录。', '前端'],
                ['用 Rust 构建一个迷你 Web 框架', '从路由到中间件，理解 Web 框架的底层。', '后端'],
              ].map(([title, summary, tag], index) => (
                <div key={title} className="group flex items-center gap-4 rounded-xl border-2 border-[#b0dbea] bg-[#eefaff] p-3 transition hover:-translate-y-0.5 hover:border-[#17648c]">
                  <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-lg border-2 border-[#17648c] ${index === 1 ? 'bg-[#bdeeff]' : 'bg-[#9edff7]'}`}><BrandMark size={52} /></div>
                  <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="truncate font-black text-[#174d70]">{title}</h3><PixelBadge>{tag}</PixelBadge></div><p className="line-clamp-1 text-sm text-[#53809a]">{summary}</p><p className="mt-2 font-mono text-[10px] font-bold text-[#78a7bd]">2026.06.28 · 8 min read</p></div>
                </div>
              ))}
            </div>
          </DemoCard>
          <div className="space-y-6">
            <DemoCard className="p-5 sm:p-7"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#4c91b7]">TIDE STATS</p><h2 className="mt-1 text-2xl font-black text-[#124b70]">博客数据（示例）</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border-2 border-[#b0dbea] bg-[#eefaff] p-3"><FileText size={18} className="text-[#17648c]" /><strong className="mt-2 block text-3xl font-black text-[#124b70]">04</strong><span className="font-mono text-[10px] font-bold text-[#78a7bd]">篇文章</span></div><div className="rounded-xl border-2 border-[#b0dbea] bg-[#eefaff] p-3"><Eye size={18} className="text-[#17648c]" /><strong className="mt-2 block text-3xl font-black text-[#124b70]">473</strong><span className="font-mono text-[10px] font-bold text-[#78a7bd]">次访问</span></div></div></DemoCard>
            <DemoCard className="p-5 sm:p-7"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#4c91b7]">ADMIN PREVIEW</p><h2 className="mt-1 text-2xl font-black text-[#124b70]">编辑工作台</h2><div className="mt-5 rounded-xl border-2 border-[#b0dbea] bg-[#eefaff] p-3"><div className="mb-3 flex items-center justify-between"><span className="font-bold text-[#174d70]">文章状态</span><span className="rounded-md bg-[#c8f5dc] px-2 py-1 font-mono text-[10px] font-bold text-[#317b58]">已保存</span></div><div className="grid grid-cols-2 gap-2"><span className="rounded-lg border-2 border-[#17648c] bg-[#c5efff] px-2 py-2 text-center text-xs font-bold text-[#17648c]">草稿</span><span className="rounded-lg border-2 border-[#b0dbea] bg-white px-2 py-2 text-center text-xs font-bold text-[#78a7bd]">已发布</span></div></div></DemoCard>
          </div>
        </section>
      </div>
    </main>
  );
}
