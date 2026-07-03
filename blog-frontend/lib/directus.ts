import 'server-only';

import { categories, friends, posts, tags } from '@/lib/mock-data';
import type { Category, Friend, Post, Tag } from '@/types/post';

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

type DirectusItem = Record<string, any>;

async function fetchDirectus<T>(path: string): Promise<T | null> {
  if (!DIRECTUS_URL) {
    console.error('[directus] DIRECTUS_URL 未配置，回退到 mock 数据');
    return null;
  }

  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: 60 }
    });
    if (!res.ok) {
      const hint = res.status === 401 || res.status === 403
        ? '（鉴权失败：若 DIRECTUS_STATIC_TOKEN 已配置但无效，请清空它走 public 角色）'
        : res.status === 404
          ? '（集合不存在：请运行 node directus-cms/seed.mjs 初始化 schema）'
          : '';
      console.error(`[directus] 请求失败: ${res.status} ${res.statusText} - ${path} ${hint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[directus] 网络异常: ${path}`, err instanceof Error ? err.message : err);
    return null;
  }
}

function normalizePost(item: DirectusItem): Post {
  const category: Category = item.category
    ? {
        id: String(item.category.id ?? item.category.slug),
        name: item.category.name,
        slug: item.category.slug,
        description: item.category.description ?? '',
        icon: item.category.icon ?? '🧱'
      }
    : {
        id: 'uncategorized',
        name: '未分类',
        slug: 'uncategorized',
        description: '',
        icon: '📦'
      };

  const normalizedTags: Tag[] = Array.isArray(item.tags)
    ? item.tags.map((row: any) => {
        const tag = row.tags_id ?? row;
        return {
          id: String(tag.id ?? tag.slug),
          name: tag.name,
          slug: tag.slug,
          color: tag.color
        };
      })
    : [];

  return {
    id: String(item.id),
    title: item.title,
    slug: item.slug,
    summary: item.summary ?? '',
    content: item.content ?? '',
    cover: item.cover ? `${DIRECTUS_URL}/assets/${item.cover}` : undefined,
    status: item.status ?? 'published',
    publishedAt: item.published_at ?? item.date_created ?? new Date().toISOString(),
    category,
    tags: normalizedTags,
    views: item.views ?? 0,
    likes: item.likes ?? 0,
    comments: item.comments ?? 0
  };
}

export async function getPosts(): Promise<Post[]> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>(
    '/items/posts?filter[status][_eq]=published&sort=-published_at&fields=*,category.*,tags.tags_id.*'
  );
  return data?.data?.map(normalizePost) ?? posts;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>(
    `/items/posts?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=*,category.*,tags.tags_id.*&limit=1`
  );
  // Directus 已配置但返回空（文章不存在或未发布）→ 返回 undefined 触发 notFound()
  // 仅当 Directus 完全不可达（data === null）时才回退 mock
  if (data === null) {
    return posts.find((post) => post.slug === slug);
  }
  return data.data?.[0] ? normalizePost(data.data[0]) : undefined;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>('/items/categories?sort=name');
  const raw: Category[] = data
    ? data.data.map((item) => ({
        id: String(item.id),
        name: item.name,
        slug: item.slug,
        description: item.description ?? '',
        icon: item.icon ?? '🧱'
      }))
    : categories;
  // 从 posts 聚合 count（Directus 不自动返回关联计数）
  const allPosts = await getPosts();
  const countMap = new Map<string, number>();
  for (const post of allPosts) {
    const key = post.category?.id ?? post.category?.slug;
    if (key) countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }
  return raw.map((c) => ({ ...c, count: countMap.get(c.id ?? c.slug) ?? 0 }));
}

function computeTagCounts(tags: Tag[], posts: Post[]): Tag[] {
  const countMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const key = tag.id ?? tag.name;
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }
  }
  return tags.map((t) => ({ ...t, count: countMap.get(t.id ?? t.name) ?? 0 }));
}

export async function getTags(): Promise<Tag[]> {
  const fallback = async () => {
    const allPosts = await getPosts();
    return computeTagCounts(tags, allPosts);
  };
  const data = await fetchDirectus<{ data: Tag[] }>('/items/tags?sort=name');
  if (!data) return fallback();
  const allPosts = await getPosts();
  return computeTagCounts(data.data, allPosts);
}

export async function getFriends(): Promise<Friend[]> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>('/items/friends?sort=name');
  if (!data) return friends;
  return data.data.map((item) => ({
    id: String(item.id),
    name: item.name,
    role: item.role ?? '',
    description: item.description ?? '',
    url: item.url ?? '#',
    avatar: item.avatar ? `${DIRECTUS_URL}/assets/${item.avatar}` : '🦈',
    tags: Array.isArray(item.tags) ? item.tags : []
  }));
}
