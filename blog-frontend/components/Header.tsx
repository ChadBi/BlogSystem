import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { MobileNav } from '@/components/MobileNav';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MagnifyingGlass } from '@/components/icons';

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
    <header className="sticky top-0 z-40 border-b-2 border-ocean-800/20 bg-shell/88 backdrop-blur-xl dark:border-ocean-400/15 dark:bg-[var(--bg)]/88">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="返回首页"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3.5 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-accent/10 hover:text-accent dark:text-slate-200 dark:hover:text-accent-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          role="search"
          aria-label="站内搜索"
          action="/search"
          className="hidden min-w-64 items-center gap-2 rounded-xl border-2 border-ocean-800/20 bg-white/70 px-3 py-2 lg:flex dark:border-ocean-400/20 dark:bg-surface/60"
        >
          <MagnifyingGlass size={16} className="text-slate-400" />
          <input
            name="q"
            aria-label="搜索关键词"
            placeholder="搜索文章、标签、内容..."
            className="w-full bg-transparent text-sm outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </form>
        <MobileNav />
      </div>
      <ScrollProgress />
    </header>
  );
}
