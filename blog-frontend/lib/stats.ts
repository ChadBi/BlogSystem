import type { Post } from '@/types/post';

export interface SiteStats {
  posts: number;
  views: number;
  likes: number;
  comments: number;
}

export function computeSiteStats(posts: Post[]): SiteStats {
  return {
    posts: posts.length,
    views: posts.reduce((sum, p) => sum + (p.views ?? 0), 0),
    likes: posts.reduce((sum, p) => sum + (p.likes ?? 0), 0),
    comments: posts.reduce((sum, p) => sum + (p.comments ?? 0), 0)
  };
}

export function formatStat(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}
