'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type Props = { text: string; speed?: number; className?: string; startDelay?: number };

// 打字机效果：SSR 渲染纯文本（SEO/无障碍友好），hydrate 后用 GSAP 替换为字符 spans 并 stagger 出现。
// reduce 模式：保留纯文本，不动画。
export function Typewriter({ text, speed = 0.05, className, startDelay = 0.6 }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // 保留 SSR 纯文本

    const chars = text.split('');
    el.setAttribute('aria-label', text);
    el.innerHTML = chars
      .map((c) => `<span class="tw-char">${c === ' ' ? '&nbsp;' : c}</span>`)
      .join('');

    const tl = gsap.timeline({ delay: startDelay });
    tl.fromTo(
      '.tw-char',
      { opacity: 0 },
      { opacity: 1, duration: speed, stagger: speed, ease: 'none' }
    );

    return () => {
      tl.kill();
      if (containerRef.current) {
        containerRef.current.removeAttribute('aria-label');
        containerRef.current.textContent = text;
      }
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      <span ref={containerRef}>{text}</span>
      <span
        className="ml-0.5 inline-block h-[1em] w-1.5 animate-pulse bg-mint align-middle"
        aria-hidden="true"
      />
    </span>
  );
}
