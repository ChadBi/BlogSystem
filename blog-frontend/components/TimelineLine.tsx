'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Props = { className?: string };

// Timeline 竖线 scroll-draw：高度随滚动进度从 0 增长到 100%。
// trigger 为父级 section（Timeline 的 year 区块）。
// reduce 模式：竖线直接 scaleY:1 全显示（fallback）。
export function TimelineLine({ className }: Props) {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement!,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 0.5,
          },
        }
      );
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(el, { scaleY: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={lineRef}
      className={className}
      style={{ transformOrigin: 'top', willChange: 'transform' }}
    />
  );
}
