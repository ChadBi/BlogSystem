'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 后台布局壳：顶部标题 + 退出按钮 + Tab 导航 + 主体内容
export function AdminShell({
  view,
  children,
}: {
  view: 'dashboard' | 'editor';
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
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black">管理后台 / ADMIN</h1>
        <button
          type="button"
          data-leave-editor
          onClick={handleLogout}
          className="rounded-xl border-2 border-ocean-800/25 px-4 py-2 text-sm font-black hover:bg-ocean-100"
        >
          退出登录
        </button>
      </header>
      <nav className="flex gap-2 border-b-2 border-ocean-800/15">
        <Link
          href="/admin"
          className={`rounded-t-xl px-5 py-3 text-sm font-black ${
            view === 'dashboard' ? 'bg-accent text-white dark:bg-accent-dark dark:text-ocean-900' : 'hover:bg-ocean-100'
          }`}
        >
          仪表盘
        </Link>
        <a data-document-navigation
          href="/admin?view=editor"
          className={`rounded-t-xl px-5 py-3 text-sm font-black ${
            view === 'editor' ? 'bg-accent text-white dark:bg-accent-dark dark:text-ocean-900' : 'hover:bg-ocean-100'
          }`}
        >
          写作
        </a>
      </nav>
      <div>{children}</div>
    </div>
  );
}
