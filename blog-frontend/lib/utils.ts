export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

export function groupByYearMonth<T extends { publishedAt: string }>(items: T[]) {
  return items.reduce<Record<string, Record<string, T[]>>>((acc, item) => {
    const d = new Date(item.publishedAt);
    const year = String(d.getFullYear());
    const month = `${String(d.getMonth() + 1).padStart(2, '0')}月`;
    acc[year] ??= {};
    acc[year][month] ??= [];
    acc[year][month].push(item);
    return acc;
  }, {});
}
