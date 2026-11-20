import { Eye, FileText } from '@/components/icons';
import { type SiteStats } from '@/lib/stats';

export function StatsGrid({ stats }: { stats: SiteStats }) {
  const items = [
    { label: '文章数', value: stats.posts, unit: '篇', Icon: FileText },
    { label: '总访问量', value: stats.views, unit: '次', Icon: Eye }
  ];
  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map(({ label, value, unit, Icon }) => (
        <div key={label} className="min-w-0 rounded-xl border-2 border-[var(--line-soft)] bg-[var(--bg-soft)] p-3 sm:p-4">
          <dt className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
            <Icon size={17} className="shrink-0 text-accent dark:text-accent-dark" />{label}
          </dt>
          <dd className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
            <strong className="break-all text-2xl font-black tabular-nums tracking-tight sm:text-3xl">{value.toLocaleString('zh-CN')}</strong>
            <span className="text-xs text-[var(--ink-soft)]">{unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
