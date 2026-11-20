// tag_links is the junction relation. tags supports articles from older installs.
export function getPostTagIds(post: { tag_links?: unknown; tags?: unknown }): number[] {
  const source = post.tag_links ?? post.tags;
  const rows = Array.isArray(source) ? source : source ? [source] : [];
  const ids = rows.map((row) => {
    const value = row && typeof row === 'object' && 'tags_id' in row ? row.tags_id : row;
    return Number(value && typeof value === 'object' && 'id' in value ? value.id : value);
  });
  return [...new Set(ids.filter((id) => Number.isSafeInteger(id) && id > 0))];
}
