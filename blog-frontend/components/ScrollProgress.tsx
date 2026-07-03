'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 顶部滚动进度条：mint 色横条随滚动百分比 scaleX 0→1。
// 用 GSAP ScrollTrigger scrub，兼容性优于 CSS scroll-driven。
// reduce 模式：不动画，进度条隐藏（matchMedia 不匹配时 scaleX 保持 0）。
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            start: 0,
            end: 'max',
            scrub: 0.3,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="h-0.5 w-full origin-left bg-mint"
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    />
  );
}
