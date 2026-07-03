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
      className="group block rounded-2xl border-2 border-ocean-800/15 bg-white/70 p-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:rotate-1 hover:border-accent hover:shadow-pixel dark:border-ocean-400/15 dark:bg-surface/60"
    >
      <div className={compact ? 'grid grid-cols-[84px_1fr] gap-3' : 'space-y-3'}>
        {post.cover ? (
          <div className={compact ? 'relative h-full min-h-24' : 'relative h-48'}>
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes={compact ? '84px' : '(max-width: 768px) 100vw, 33vw'}
              className="rounded-xl border-2 border-ocean-900/60 object-cover dark:border-ocean-400/20"
            />
          </div>
        ) : (
          <PostThumb slug={post.category?.slug} />
        )}
        <div>
          <h3 className="line-clamp-2 font-black transition-colors group-hover:text-accent dark:group-hover:text-accent-dark">{post.title}</h3>
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
