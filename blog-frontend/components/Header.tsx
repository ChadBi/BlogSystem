import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { Logo } from '@/components/Logo';
import { MobileNav } from '@/components/MobileNav';
import { ScrollProgress } from '@/components/ScrollProgress';
import { SearchHover } from '@/components/SearchHover';

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
    <header className="sticky top-0 z-40 mx-auto max-w-6xl px-4 pt-3 sm:px-8 sm:pt-5">
      <div className="relative flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--pixel-edge)] bg-[var(--surface)] px-3 py-2.5 shadow-pixel sm:px-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <Link href="/" aria-label="返回首页"><Logo /></Link>
        </div>
        {/* nav 绝对居中，不受左右 BackButton/Logo 影响 */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex">
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
        <SearchHover />
        <MobileNav />
        <ScrollProgress />
      </div>
    </header>
  );
}
