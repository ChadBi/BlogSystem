import type { SVGProps } from 'react';

// 自包含图标集（环境无法安装 @phosphor-icons/react，以 inline SVG 实现）。
// 全部 24x24 viewBox，stroke=currentColor，strokeWidth=1.8，可继承文字色。
// 风格统一参考 Phosphor Regular/Bold 几何。

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Eye({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function ChatCircle({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M19 12a7 7 0 0 1-10.1 6.3L4 20l1.7-4.9A7 7 0 1 1 19 12Z" />
    </Base>
  );
}

export function MagnifyingGlass({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </Base>
  );
}

export function List({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </Base>
  );
}

export function X({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Base>
  );
}

export function Heart({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" />
    </Base>
  );
}

export function ArrowRight({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </Base>
  );
}

export function ArrowUpRight({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="9 7 17 7 17 15" />
    </Base>
  );
}

// 分类图标映射
export function Code({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </Base>
  );
}

export function Cube({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </Base>
  );
}

export function Terminal({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <polyline points="4 5 9 10 4 15" />
      <line x1="12" y1="15" x2="20" y2="15" />
    </Base>
  );
}

export function Wrench({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M14.5 3a5.5 5.5 0 0 0-5 7.7L3 17.2V21h3.8l6.5-6.5a5.5 5.5 0 0 0 7.7-5 4.5 4.5 0 0 1-6-6Z" />
    </Base>
  );
}

export function Graph({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="8" y1="16" x2="10.5" y2="13.5" />
      <line x1="13.5" y1="10.5" x2="16" y2="8" />
    </Base>
  );
}

export function Notebook({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="12" y1="8" x2="16" y2="8" />
      <line x1="12" y1="12" x2="16" y2="12" />
    </Base>
  );
}

// 按 category.slug 映射图标
const categoryIconMap = {
  backend: Code,
  frontend: Cube,
  ops: Terminal,
  tools: Wrench,
  algorithm: Graph,
  notes: Notebook
} as const;

export function CategoryIcon({ slug, size, ...p }: { slug: string } & IconProps) {
  const Cmp = (categoryIconMap as Record<string, typeof Code>)[slug] ?? Notebook;
  return <Cmp size={size} {...p} />;
}

export function FileText({ size, ...p }: IconProps) {
  return (
    <Base size={size} {...p}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
      <polyline points="14 3 14 9 20 9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </Base>
  );
}
