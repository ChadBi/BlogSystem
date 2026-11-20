import 'server-only';
import { adminFetch } from '@/lib/directus-admin';
import { getPostTagIds } from '@/lib/post-tags';

export type TaxonomyCollection = 'categories' | 'tags';

export type TaxonomyItem = {
  id: number;
  name: string | null;
  slug: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
};

type RelationId = number | string;
type RelationValue = RelationId | { id: RelationId } | null;
type TagValue = RelationValue | { tags_id: RelationValue };
type PostReferences = {
  category: RelationValue;
  tags: TagValue | TagValue[];
  tag_links?: unknown;
};

function relationId(value: RelationValue) {
  return value && typeof value === 'object' ? value.id : value;
}

export async function readTaxonomy(collection: TaxonomyCollection) {
  const fields = collection === 'categories' ? 'id,name,slug,description,icon' : 'id,name,slug,color';
  return adminFetch<{ data: TaxonomyItem[] }>(`/items/${collection}?limit=-1&sort=name,id&fields=${fields}`);
}

export async function readTaxonomyUsage(collection: TaxonomyCollection) {
  const fields = collection === 'categories' ? 'category' : 'tags.*,tag_links.*';
  const result = await adminFetch<{ data: PostReferences[] }>(`/items/posts?limit=-1&fields=id,${fields}`);
  if (!result.data) return null;

  const counts: Record<string, number> = {};
  for (const post of result.data.data) {
    const ids = collection === 'categories'
      ? [relationId(post.category)]
      : getPostTagIds(post);

    for (const id of new Set(ids)) {
      if (id != null) counts[String(id)] = (counts[String(id)] ?? 0) + 1;
    }
  }
  return counts;
}
