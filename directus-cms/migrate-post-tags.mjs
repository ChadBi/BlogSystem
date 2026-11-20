// Run from blog-frontend with node --env-file=.env ../directus-cms/migrate-post-tags.mjs
// Adds a junction relation and moves legacy single-tag associations into it.
const url = process.env.DIRECTUS_URL || 'http://localhost:8055';
let token;

async function api(path, method = 'GET', data) {
  const response = await fetch(url + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${result.errors?.[0]?.message}`);
  return result.data;
}

async function main() {
  const auth = await api('/auth/login', 'POST', {
    email: process.env.DIRECTUS_ADMIN_EMAIL,
    password: process.env.DIRECTUS_ADMIN_PASSWORD,
  });
  token = auth.access_token;
  const collections = await api('/collections');
  if (!collections.some((item) => item.collection === 'posts_tags')) {
    await api('/collections', 'POST', {
      collection: 'posts_tags',
      meta: { hidden: true },
      schema: {},
      fields: [{ field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } }],
    });
  }
  const junctionFields = await api('/fields/posts_tags');
  for (const field of ['posts_id', 'tags_id']) {
    if (!junctionFields.some((item) => item.field === field)) {
      await api('/fields/posts_tags', 'POST', { field, type: 'integer', meta: { special: ['m2o'], interface: 'select-dropdown-m2o' } });
    }
  }
  const fields = await api('/fields/posts');
  if (!fields.some((item) => item.field === 'tag_links')) {
    await api('/fields/posts', 'POST', {
      field: 'tag_links', type: 'alias',
      meta: { special: ['m2m'], interface: 'list-m2m', translations: [{ language: 'zh-CN', translation: '标签' }] },
    });
  }
  const relations = await api('/relations');
  for (const relation of [
    { collection: 'posts_tags', field: 'tags_id', related_collection: 'tags', schema: { on_delete: 'CASCADE' } },
    { collection: 'posts_tags', field: 'posts_id', related_collection: 'posts', schema: { on_delete: 'CASCADE' },
      meta: { one_field: 'tag_links', junction_field: 'tags_id', one_deselect_action: 'delete' } },
  ]) {
    if (!relations.some((item) => item.collection === relation.collection && item.field === relation.field)) {
      await api('/relations', 'POST', relation);
    }
  }

  const policies = await api('/policies');
  const publicPolicy = policies.find((item) => item.name === '$t:public_label' || item.name === 'public');
  if (!publicPolicy) throw new Error('Public policy missing. Run the initial seed first.');
  const permissions = await api('/permissions?limit=-1');
  if (!permissions.some((item) => item.policy === publicPolicy.id && item.collection === 'posts_tags' && item.action === 'read')) {
    await api('/permissions', 'POST', {
      policy: publicPolicy.id, collection: 'posts_tags', action: 'read', fields: ['*'],
      permissions: {},
    });
  }

  const posts = await api('/items/posts?limit=-1&fields=id,tags,tag_links.id,tag_links.tags_id');
  let migrated = 0;
  for (const post of posts) {
    if (!post.tags) continue;
    const legacy = Array.isArray(post.tags) ? post.tags : [post.tags];
    const ids = legacy.map((item) => Number(item?.tags_id?.id ?? item?.tags_id ?? item?.id ?? item));
    if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error(`Invalid legacy tag on post ${post.id}`);
    const links = post.tag_links ?? [];
    const existing = new Set(links.map((item) => item.tags_id));
    await api(`/items/posts/${post.id}`, 'PATCH', {
      tags: null,
      tag_links: [...links.map((item) => item.id), ...[...new Set(ids)].filter((id) => !existing.has(id)).map((id) => ({ tags_id: id }))],
    });
    migrated++;
  }
  console.log(`Multi-tag relation ready. Migrated ${migrated} legacy posts.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
