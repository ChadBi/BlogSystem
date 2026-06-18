import Link from 'next/link';
import { Logo } from '@/components/Logo';

const nav = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/categories', label: '分类' },
  { href: '/archive', label: '归档' },
  { href: '/friends', label: '好友' },
  { href: '/about', label: '关于' }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ocean-800/25 bg-shell/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="返回首页"><Logo /></Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-coral/10 hover:text-coral">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/search" className="hidden min-w-72 items-center rounded-xl border-2 border-ocean-800/25 bg-white/70 px-3 py-2 lg:flex">
          <input name="q" placeholder="搜索文章、标签、内容..." className="w-full bg-transparent text-sm outline-none" />
          <button className="font-black text-ocean-800">⌕</button>
        </form>
      </div>
    </header>
  );
}
