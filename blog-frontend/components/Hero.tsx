import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from '@/components/icons';
import { authorName } from '@/lib/site-profile';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border-2 border-[var(--pixel-edge)] bg-[#8edbfa] px-6 py-8 text-[#124b70] shadow-[7px_7px_0_var(--pixel-edge)] sm:px-10 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border-[24px] border-[#bff0ff]/75" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-[760px] -rotate-[8deg] border-t-4 border-[#b7ebff]" />
      <div className="relative grid items-center gap-6 sm:grid-cols-[1.15fr_.85fr]">
        <div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">你好，我是<span className="block text-[#17648c]">{authorName}</span></h1>
          <p className="mt-5 max-w-md text-base font-semibold leading-8 text-[#205c7d]">我是一个在数据和算法的浩瀚宇宙中摸索前行的学生。用一行行代码，记录自己的学习旅程。</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/posts" className="inline-flex items-center gap-2 rounded-lg border-2 border-[#17648c] bg-[#17648c] px-4 py-2.5 font-mono text-sm font-bold text-white shadow-[4px_4px_0_#0d4768] transition hover:-translate-y-0.5 focus-visible:outline-[#124b70]">浏览文章 <ArrowRight size={16} /></Link>
            <Link href="/about" className="rounded-lg border-2 border-[#17648c] bg-[#dff8ff] px-4 py-2.5 font-mono text-sm font-bold text-[#17648c] shadow-[4px_4px_0_#17648c] transition hover:-translate-y-0.5 focus-visible:outline-[#124b70]">关于本站</Link>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
          <div aria-hidden="true" className="absolute h-56 w-56 rounded-full border-2 border-[#b7ebff] bg-[#c9f2ff] sm:h-64 sm:w-64 lg:h-72 lg:w-72" />
          <Image
            src="/images/shark-girl.webp"
            width={621}
            height={1120}
            sizes="(min-width: 1024px) 222px, (min-width: 640px) 200px, 156px"
            alt="穿蓝色鲨鱼连帽衫、系薄荷色蝴蝶结的白发鲨鱼娘"
            priority
            className="relative h-[280px] w-auto drop-shadow-[0_8px_0_#17648c18] sm:h-[360px] lg:h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}
