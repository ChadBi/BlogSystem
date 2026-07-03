import { Eye, FileText } from '@/components/icons';
import { type SiteStats } from '@/lib/stats';

// 极客数字：StatsGrid 大数字用 0x 十六进制前缀（装饰性），下方小字保留十进制（实用性）。
// 互动功能（点赞/评论）已移除，仅保留文章数与访问量。
export function StatsGrid({ stats }: { stats: SiteStats }) {
  const items = [
    { label: '文章数', value: stats.posts, unit: '篇', Icon: FileText },
    { label: '总访问量', value: stats.views, unit: '次', Icon: Eye }
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, value, unit, Icon }) => (
        <div key={label} className="pixel-card flex flex-col items-center rounded-2xl p-5 text-center">
          <Icon size={26} className="text-accent dark:text-accent-dark" />
          <div className="mt-2 font-mono text-3xl font-black text-ocean-900 dark:text-ocean-100">
            0x{Number(value).toString(16)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {value} {unit} · {label}
          </div>
        </div>
      ))}
    </div>
  );
}
