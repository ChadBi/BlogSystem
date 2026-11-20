import Link from 'next/link';
import { authorName } from '@/lib/site-profile';

const footerNav = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '分类', href: '/categories' },
  { label: '归档', href: '/archive' },
  { label: '友链', href: '/friends' },
  { label: '关于', href: '/about' }
];

export function Footer() {
  return (
    <footer className="relative mt-16 border-t-2 border-ocean-800/15 bg-shell/60 py-10 dark:border-ocean-400/10 dark:bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-black text-ink dark:text-[var(--ink)]">Shark Tech Blog</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            记录数据、算法和代码里的学习旅程。
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-slate-600 transition-colors hover:text-accent dark:text-slate-300 dark:hover:text-accent-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} {authorName}</p>
          <a href="https://beian.miit.gov.cn/" className="mt-2 block text-xs text-slate-500 hover:underline dark:text-slate-400">滇ICP备2026000183号</a>
          <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=53000002076006" className="mt-2 block text-xs text-slate-500 hover:underline dark:text-slate-400">滇公网安备53000002076006号</a>
        </div>
      </div>
    </footer>
  );
}
