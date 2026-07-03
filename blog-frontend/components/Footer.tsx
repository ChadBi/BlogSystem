import Link from 'next/link';
import { Heart } from '@/components/icons';
import { SharkSwimAnimated } from '@/components/SharkSwimAnimated';

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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-black text-ink dark:text-[var(--ink)]">Shark Tech Blog</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Retro × Ocean × Code 的个人技术博客，记录探索与思考。
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
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 md:justify-end">
            Made with <Heart size={14} className="text-accent dark:text-accent-dark" /> in Ocean
          </p>
          <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">&gt; code · dive · share · keep exploring</p>
          <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} Shark Tech Blog</p>
        </div>
      </div>
      <div className="pointer-events-none mt-8 flex justify-center opacity-[0.06] dark:opacity-[0.08]">
        <SharkSwimAnimated size={240} className="text-ocean-900 dark:text-ocean-100" />
      </div>
    </footer>
  );
}
