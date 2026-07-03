'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SharkSwim } from '@/components/SharkSilhouette';

type Props = { size?: number; className?: string };

// Footer 鲨鱼剪影：GSAP timeline yoyo 缓慢左右游动 + 微微上下浮动（鱼鳍划水意象）。
// reduce 模式：matchMedia 不匹配，鲨鱼静止。
export function SharkSwimAnimated({ size, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(el, {
        x: 30,
        y: -3,
        duration: 4,
        ease: 'sine.inOut',
      }).to(el, {
        x: -10,
        y: 2,
        duration: 3,
        ease: 'sine.inOut',
      });
      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} style={{ willChange: 'transform' }}>
      <SharkSwim size={size} className={className} />
    </div>
  );
}
