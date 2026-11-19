'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MagnifyingGlass } from '@/components/icons';

// 平时只显示放大镜图标，hover/focus 时用 GSAP 流畅展开搜索框。
// reduce 模式直接显示完整搜索框（无动画）。
export function SearchHover() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const wrap = inputWrapRef.current;
      if (!wrap) return;

      const form = formRef.current;
      if (!form) return;

      // 初始状态：只显示外层触发按钮
      gsap.set(form, { width: 0, autoAlpha: 0, overflow: 'hidden' });
      gsap.set(wrap, { width: 0, autoAlpha: 0 });

      const mm = gsap.matchMedia();
      // reduce 模式：直接显示完整搜索框
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(form, { width: 260, autoAlpha: 1 });
        gsap.set(wrap, { width: 'auto', autoAlpha: 1 });
        return () => {
          gsap.set(form, { width: 0, autoAlpha: 0 });
          gsap.set(wrap, { width: 0, autoAlpha: 0 });
        };
      });
      // 正常模式：GSAP timeline 控制
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        tlRef.current = gsap.timeline({ paused: true });
        tlRef.current
          .to(form, {
            width: 260,
            autoAlpha: 1,
            duration: 0.45,
            ease: 'power3.out',
          })
          .to(wrap, {
            width: 220,
            autoAlpha: 1,
            duration: 0.35,
            ease: 'power3.out',
          }, '<');
        return () => {
          tlRef.current?.kill();
          tlRef.current = null;
        };
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  const expand = () => tlRef.current?.play();
  const collapse = () => {
    if (inputRef.current && !inputRef.current.value) {
      tlRef.current?.reverse();
    }
  };

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={expand}
      onMouseLeave={collapse}
    >
      {/* 放大镜触发按钮：占位，始终可见 */}
      <button
        type="button"
        onClick={() => {
          expand();
          inputRef.current?.focus();
        }}
        aria-label="搜索"
        className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ocean-800/20 bg-white/70 text-slate-400 transition-colors hover:border-accent hover:text-accent dark:border-ocean-400/20 dark:bg-surface/60 dark:hover:border-accent-dark dark:hover:text-accent-dark"
      >
        <MagnifyingGlass size={18} />
      </button>
      {/* 浮层搜索框：absolute 定位，向左展开，不挤压 nav */}
      <form
        id="search-form"
        ref={formRef}
        role="search"
        aria-label="站内搜索"
        action="/search"
        onSubmit={(event) => {
          if (!inputRef.current?.value.trim()) event.preventDefault();
        }}
        className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-2 items-center gap-2 rounded-xl border-2 border-ocean-800/20 bg-white/95 px-2 py-2 shadow-lg backdrop-blur-xl dark:border-ocean-400/20 dark:bg-surface/95"
      >
        <button
          type="submit"
          aria-label="搜索"
          className="grid place-items-center text-slate-400 transition-colors hover:text-accent dark:hover:text-accent-dark"
        >
          <MagnifyingGlass size={18} />
        </button>
        <div ref={inputWrapRef} className="overflow-hidden">
          <input
            ref={inputRef}
            name="q"
            aria-label="搜索关键词"
            placeholder="搜索文章、标签、内容..."
            onFocus={expand}
            onBlur={collapse}
            className="w-[220px] bg-transparent text-sm outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </form>
    </div>
  );
}
