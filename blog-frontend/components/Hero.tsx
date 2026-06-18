import Link from 'next/link';
import { SharkMascot } from '@/components/SharkMascot';

export function Hero() {
  return (
    <section className="pixel-border ocean-floor relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-700 via-blue-700 to-coral p-8 text-white shadow-soft">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_360px]">
        <div>
          <p className="font-mono text-sm font-black text-mint">RETRO × OCEAN × CODE</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Hi! 我是 Shark 🐾</h2>
          <p className="mt-4 max-w-xl text-lg font-bold text-blue-50">热爱代码，探索技术，分享知识。这里记录我的学习路线、项目实践和工程思考。</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/posts" className="rounded-xl bg-mint px-5 py-3 font-black text-ocean-900 shadow-pixel">最新文章 ✦</Link>
            <Link href="/about" className="rounded-xl bg-white px-5 py-3 font-black text-coral">关于我 ♟</Link>
          </div>
          <div className="mt-6 flex gap-2 text-2xl"><span>💗</span><span>💜</span><span>💙</span></div>
        </div>
        <div className="hidden md:block"><SharkMascot variant="laptop" /></div>
      </div>
    </section>
  );
}
