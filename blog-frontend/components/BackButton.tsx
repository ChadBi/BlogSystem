'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from '@/components/icons';

// 左上角返回按钮：首页占位隐藏（保留布局空间），其他页面显示，点击 router.back()。
// 占位保证首页与非首页的 Logo/nav 位置完全一致。
const BUTTON_CLASS =
  'flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 text-sm font-bold';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // 首页：保留相同尺寸的占位，视觉隐藏但占据布局空间
  if (pathname === '/') {
    return (
      <div
        aria-hidden="true"
        className={`${BUTTON_CLASS} invisible border-transparent`}
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">返回</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-leave-editor
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }}
      aria-label="返回上一页"
      className={`group ${BUTTON_CLASS} border-ocean-800/20 bg-white/60 text-slate-600 transition-colors hover:border-accent hover:text-accent dark:border-ocean-400/20 dark:bg-surface/60 dark:text-slate-300 dark:hover:border-accent-dark dark:hover:text-accent-dark`}
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      <span className="hidden sm:inline">返回</span>
    </button>
  );
}
