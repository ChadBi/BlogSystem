'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const adminNav = [
  { view: 'dashboard', href: '/admin', label: '仪表盘' },
  { view: 'editor', href: '/admin?view=editor', label: '写作' },
  { view: 'categories', href: '/admin?view=categories', label: '分类' },
  { view: 'tags', href: '/admin?view=tags', label: '标签' },
  { view: 'about', href: '/admin?view=about', label: '关于我' },
] as const;

export function AdminShell({
  view,
  children,
}: {
  view: (typeof adminNav)[number]['view'];
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-black">管理后台</h1>
        <button
          type="button"
          data-leave-editor
          onClick={handleLogout}
          className="rounded-xl border-2 border-ocean-800/25 px-4 py-2 text-sm font-black hover:bg-ocean-100"
        >
          退出登录
        </button>
      </header>
      <nav aria-label="后台导航" className="flex flex-wrap gap-1.5 border-b-2 border-[var(--pixel-edge)] pb-1.5">
        {adminNav.map((item) => {
          const className = `rounded-lg px-3 py-2 text-sm font-black sm:px-5 ${
            view === item.view ? 'bg-accent text-white shadow-pixel-sm dark:bg-accent-dark dark:text-ocean-900' : 'hover:bg-[var(--surface)]'
          }`;
          return item.view === 'editor' ? (
            <a key={item.view} href={item.href} data-document-navigation aria-current={view === item.view ? 'page' : undefined} className={className}>{item.label}</a>
          ) : (
            <Link key={item.view} href={item.href} aria-current={view === item.view ? 'page' : undefined} className={className}>{item.label}</Link>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
}
