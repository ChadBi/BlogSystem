import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { HeroFlowField } from '@/components/HeroFlowField';
import { HeroTitle } from '@/components/HeroTitle';
import { SharkFin } from '@/components/SharkSilhouette';
import { Reveal } from '@/components/Reveal';
import { Typewriter } from '@/components/Typewriter';

export function Hero() {
  return (
    <section className="ocean-floor relative overflow-hidden rounded-3xl border-2 border-ocean-900/40 bg-ocean-800 p-8 text-white shadow-soft dark:border-ocean-400/20 dark:bg-ocean-900">
      <HeroFlowField className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <Reveal as="div" className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-mint">
            <span className="text-accent dark:text-accent-dark">&gt;</span> shark@blog:~$ init
          </Reveal>
          <HeroTitle />
          <Reveal as="p" delay={160} className="mt-4 max-w-xl text-lg font-medium text-blue-50/90">
            <Typewriter text="热爱代码，探索技术，分享知识。这里记录我的学习路线、项目实践和工程思考。" />
          </Reveal>
          <Reveal as="div" delay={240} className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/posts"
              className="rounded-xl bg-mint px-5 py-3 font-mono font-black text-ocean-900 shadow-pixel transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              &gt; 最新文章
            </Link>
            <Link
              href="/about"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-5 py-3 font-mono font-black text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              &gt; 关于我
            </Link>
          </Reveal>
        </div>
        <Reveal delay={300} className="hidden justify-center md:flex">
          <div className="scanlines code-window relative grid h-56 w-56 place-items-center rounded-xl">
            <div className="absolute left-3 top-3 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <BrandMark size={160} className="text-mint" />
          </div>
        </Reveal>
      </div>
      <div className="relative z-10 mt-8">
        <div className="pixel-divider" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SharkFin size={36} className="text-mint [background:var(--bg)]" />
        </div>
      </div>
    </section>
  );
}
