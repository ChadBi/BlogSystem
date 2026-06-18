import Link from 'next/link';
import type { Post } from '@/types/post';
import { formatDate } from '@/lib/utils';
import { PostThumb } from '@/components/PostThumb';
import { TagPill } from '@/components/TagPill';

const iconBySlug: Record<string, string> = {
  'mini-rust-web-framework': '🦀',
  'typescript-prompt-generator': 'TS',
  'docker-best-practices': '🐳',
  'linux-performance-troubleshooting': '🐧',
  'axum-deep-dive': '🫧'
};

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block rounded-2xl border-2 border-ocean-800/25 bg-white/70 p-3 transition hover:-translate-y-1 hover:border-coral hover:shadow-pixel">
      <div className={compact ? 'grid grid-cols-[84px_1fr] gap-3' : 'space-y-3'}>
        <PostThumb icon={iconBySlug[post.slug] ?? '🦈'} />
        <div>
          <h3 className="line-clamp-2 font-black group-hover:text-coral">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">{post.tags.slice(0, 3).map((tag) => <TagPill key={tag.id} name={tag.name} color={tag.color} />)}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{formatDate(post.publishedAt)}</span>
            <span>👁 {post.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
