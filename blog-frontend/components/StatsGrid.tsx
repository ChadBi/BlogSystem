const stats = [
  ['文章数', '28', '篇', '📄'],
  ['总访问量', '42.7k', '次', '👁'],
  ['获赞总数', '1.2k', '次', '💗'],
  ['评论总数', '568', '条', '💬']
];

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([label, value, unit, icon]) => (
        <div key={label} className="pixel-card rounded-2xl p-5 text-center">
          <div className="text-3xl">{icon}</div>
          <div className="mt-2 text-3xl font-black text-ocean-900">{value}</div>
          <div className="mt-1 text-sm font-bold text-slate-500">{label} / {unit}</div>
        </div>
      ))}
    </div>
  );
}
