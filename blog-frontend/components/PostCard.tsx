import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types/post';
import { formatDate } from '@/lib/utils';
import { PostThumb } from '@/components/PostThumb';
import { TagPill } from '@/components/TagPill';
import { Eye } from '@/components/icons';

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block rounded-xl border-2 border-[var(--line-soft)] bg-[var(--surface-elevated)] p-3 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-pixel-sm"
    >
      <div className={compact ? 'grid grid-cols-[84px_minmax(0,1fr)] gap-3' : 'space-y-3'}>
        {post.cover ? (
          <div className={compact ? 'relative h-full min-h-24' : 'relative h-48'}>
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes={compact ? '84px' : '(max-width: 768px) 100vw, 33vw'}
              className="rounded-xl border border-ocean-900/10 object-cover dark:border-ocean-400/20"
            />
          </div>
        ) : (
          <div className={compact ? 'min-h-24' : 'h-48'}><PostThumb slug={post.category?.slug} compact={compact} /></div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="line-clamp-2 font-black transition-colors group-hover:text-accent dark:group-hover:text-accent-dark">{post.title}</h3>
            <span className="rounded-md bg-ocean-100 px-2 py-0.5 text-xs font-bold text-ocean-800 dark:bg-ocean-700/30 dark:text-ocean-100">{post.category.name}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">{post.tags.slice(0, 3).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
          <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1"><Eye size={13} /> {post.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
