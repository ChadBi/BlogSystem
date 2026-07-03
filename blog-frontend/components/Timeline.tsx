import type { Post } from '@/types/post';
import { formatDate, groupByYearMonth } from '@/lib/utils';
import { TagPill } from '@/components/TagPill';
import { TimelineLine } from '@/components/TimelineLine';

export function Timeline({ posts }: { posts: Post[] }) {
  const groups = groupByYearMonth(posts);
  return (
    <div className="space-y-10">
      {Object.entries(groups).map(([year, months]) => (
        <section key={year} className="relative pl-10">
          <h2 className="mb-5 text-3xl font-black text-ocean-900 dark:text-ocean-100">{year}</h2>
          <TimelineLine className="absolute bottom-0 left-4 top-12 w-0.5 bg-ocean-700/40 dark:bg-ocean-400/30" />
          {Object.entries(months).map(([month, items]) => (
            <div key={month} className="mb-8">
              <h3 className="mb-3 font-black text-accent dark:text-accent-dark">{month}</h3>
              <div className="space-y-3">
                {items.map((post) => (
                  <a
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="grid gap-3 rounded-2xl border border-ocean-800/20 bg-white/65 p-4 hover:border-accent md:grid-cols-[90px_1fr_auto] dark:border-ocean-400/20 dark:bg-surface/65 dark:hover:border-accent-dark"
                  >
                    <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{formatDate(post.publishedAt).slice(5)}</span>
                    <span className="font-bold dark:text-ink">{post.title}</span>
                    <span className="flex gap-2">{post.tags.slice(0, 1).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
