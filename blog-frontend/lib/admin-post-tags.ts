import 'server-only';
import { adminFetch } from '@/lib/directus-admin';

export async function preparePostTags(value: unknown, postId?: string) {
  if (!Array.isArray(value) || value.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return { error: '标签必须是有效的标签 ID 数组。', status: 400 };
  }
  const ids = [...new Set(value as number[])];
  if (ids.length) {
    const query = new URLSearchParams({ 'filter[id][_in]': ids.join(','), fields: 'id', limit: '-1' });
    const tags = await adminFetch<{ data: { id: number }[] }>(`/items/tags?${query}`);
    if (!tags.data) return { error: '暂时无法检查标签，请重试。', status: 503 };
    if (tags.data.data.length !== ids.length) return { error: '部分标签已删除，请刷新后重新选择。', status: 400 };
  }

  let links: { id: number; tags_id: number }[] = [];
  if (postId) {
    const current = await adminFetch<{ data: { tag_links: typeof links } }>(
      `/items/posts/${encodeURIComponent(postId)}?fields=tag_links.id,tag_links.tags_id`
    );
    if (!current.data) return { error: '文章标签读取失败，请重试。', status: current.status };
    links = current.data.data.tag_links;
  }
  const existing = new Map(links.map((link) => [link.tags_id, link.id]));
  return {
    payload: { tags: null, tag_links: ids.map((id) => existing.get(id) ?? { tags_id: id }) },
    status: 200,
  };
}
