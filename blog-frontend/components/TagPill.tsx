import Link from 'next/link';

const colorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  mint: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  sand: 'bg-amber-100 text-amber-700 border-amber-200',
  coral: 'bg-rose-100 text-rose-700 border-rose-200'
};

export function TagPill({ name, color, href }: { name: string; color?: string; href?: string }) {
  const hex = color && /^#[0-9a-f]{6}$/i.test(color) ? color : undefined;
  const palette = (color && Object.prototype.hasOwnProperty.call(colorMap, color) ? colorMap[color] : '')
    || 'border-ocean-200 bg-ocean-50 text-ocean-800 dark:border-ocean-400/25 dark:bg-ocean-800/25 dark:text-ocean-100';
  const className = `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${palette} ${href ? 'hover:border-[var(--accent)] hover:underline' : ''}`;
  const content = <>{hex && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[2px] border border-black/25" style={{ backgroundColor: hex }} />}{name}</>;
  return href ? <Link href={href} className={className}>{content}</Link> : <span className={className}>{content}</span>;
}
