import Link from 'next/link';

const colorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  mint: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  sand: 'bg-amber-100 text-amber-700 border-amber-200',
  coral: 'bg-rose-100 text-rose-700 border-rose-200'
};

export function TagPill({ name, color, href }: { name: string; color?: string; href?: string }) {
  const className = `rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${colorMap[color ?? 'purple'] ?? colorMap.purple} ${href ? 'hover:border-accent hover:text-accent' : ''}`;
  return href ? <Link href={href} className={className}>{name}</Link> : <span className={className}>{name}</span>;
}
