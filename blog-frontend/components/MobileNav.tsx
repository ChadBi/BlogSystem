'use client';

import { useState } from 'react';
import Link from 'next/link';
import { List, X, MagnifyingGlass } from '@/components/icons';

const navItems = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '分类', href: '/categories' },
  { label: '归档', href: '/archive' },
  { label: '友链', href: '/friends' },
  { label: '关于', href: '/about' }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="切换导航菜单"
        aria-expanded={open}
        className="rounded-lg border border-ocean-800/20 bg-white/70 p-2 text-ocean-900 dark:border-ocean-400/20 dark:bg-surface/70 dark:text-ocean-100"
      >
        {open ? <X size={20} /> : <List size={20} />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-ocean-800/20 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-ocean-400/20 dark:bg-surface/95">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-bold text-ocean-900 hover:bg-ocean-50 dark:text-ocean-100 dark:hover:bg-surface-elevated"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form role="search" aria-label="站内搜索" action="/search" className="mt-3">
            <div className="flex items-center gap-2 rounded-lg border border-ocean-800/20 bg-white px-3 py-2 text-sm dark:border-ocean-400/20 dark:bg-surface-elevated">
              <MagnifyingGlass size={16} className="text-slate-400" />
              <input
                type="search"
                name="q"
                placeholder="搜索文章..."
                className="w-full bg-transparent outline-none dark:text-slate-100"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
