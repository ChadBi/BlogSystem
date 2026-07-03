'use client';
import { useEffect, useRef } from 'react';
import p5 from 'p5';

// 算法艺术：Ocean Drift / 海流漂移
// - p5 Perlin noise 生成 2D 向量场，粒子沿流场流动
// - 80 粒子，半透明覆盖造拖尾；5% "鲨鱼"大粒子：mint 色、速度 ×1.8、半径 ×2.5
// - seed 固定（Art Blocks 模式），同 seed 同流场
// - reduce 模式：noLoop()，只渲染一帧静态分布
export function HeroFlowField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sketch = (p: p5) => {
      const SEED = 42;
      const PARTICLE_COUNT = 80;
      const SHARK_RATIO = 0.05;

      type Particle = {
        x: number; y: number; vx: number; vy: number;
        life: number; maxLife: number; isShark: boolean;
      };
      let particles: Particle[] = [];

      p.setup = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        p.createCanvas(rect.width, rect.height);
        p.noiseSeed(SEED);
        p.randomSeed(SEED);
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
          vx: 0,
          vy: 0,
          life: p.random(100),
          maxLife: 80 + p.random(60),
          isShark: p.random() < SHARK_RATIO,
        }));
        if (reduce) p.noLoop();
      };

      p.draw = () => {
        // 半透明覆盖造拖尾
        p.noStroke();
        p.fill(11, 88, 122, 20); // ocean-800 半透明
        p.rect(0, 0, p.width, p.height);

        const t = p.frameCount * 0.002;
        for (const pt of particles) {
          // Perlin noise 向量场：noise → [0,1]，映射到 [0, 2π] 角度
          const angle = p.noise(pt.x * 0.003, pt.y * 0.003, t) * p.TWO_PI;
          const speed = pt.isShark ? 1.8 : 1.0;
          pt.vx = p.cos(angle) * speed;
          pt.vy = p.sin(angle) * speed;
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;

          // 寿命到期或越界则重生
          if (pt.life > pt.maxLife || pt.x < 0 || pt.x > p.width || pt.y < 0 || pt.y > p.height) {
            pt.x = p.random(p.width);
            pt.y = p.random(p.height);
            pt.life = 0;
          }

          const alpha = p.sin((pt.life / pt.maxLife) * p.PI) * 0.6;
          if (pt.isShark) {
            p.fill(181, 234, 215, alpha * 255); // mint
            p.circle(pt.x, pt.y, 5);
          } else {
            p.fill(140, 108, 255, alpha * 128); // accent 紫，半透明
            p.circle(pt.x, pt.y, 2);
          }
        }
      };

      p.windowResized = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        p.resizeCanvas(rect.width, rect.height);
      };
    };

    const instance = new p5(sketch, containerRef.current);
    return () => instance.remove();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: 'none', willChange: 'transform' }}
    />
  );
}
