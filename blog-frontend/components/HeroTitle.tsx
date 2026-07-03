'use client';
import { motion, useReducedMotion } from 'motion/react';

const TITLE = '你好，我是 Shark';

// Hero 标题：字符 stagger 弹簧入场。
// reduce 模式：initial={false} 跳过动画，直接显示。
export function HeroTitle() {
  const reduce = useReducedMotion();

  return (
    <motion.h2
      className="mt-4 font-mono text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
      initial={reduce ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
      }}
    >
      {TITLE.split('').map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            },
          }}
        >
          {c === ' ' ? '\u00A0' : c}
        </motion.span>
      ))}
      <span
        className="ml-2 inline-block h-8 w-3 animate-pulse bg-mint align-middle md:h-12"
        aria-hidden="true"
      />
    </motion.h2>
  );
}
