import { categories, friends, posts, tags } from '@/lib/mock-data';
import type { Category, Friend, Post, Tag } from '@/types/post';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

type DirectusItem = Record<string, any>;

async function fetchDirectus<T>(path: string): Promise<T | null> {
  if (!DIRECTUS_URL) return null;

  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
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
    : categories[0];

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
    publishedAt: item.published_at ?? item.date_created,
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
    `/items/posts?filter[slug][_eq]=${slug}&fields=*,category.*,tags.tags_id.*`
  );
  return data?.data?.[0] ? normalizePost(data.data[0]) : posts.find((post) => post.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchDirectus<{ data: Category[] }>('/items/categories?sort=name');
  return data?.data ?? categories;
}

export async function getTags(): Promise<Tag[]> {
  const data = await fetchDirectus<{ data: Tag[] }>('/items/tags?sort=name');
  return data?.data ?? tags;
}

export async function getFriends(): Promise<Friend[]> {
  const data = await fetchDirectus<{ data: Friend[] }>('/items/friends?sort=name');
  return data?.data ?? friends;
}
