'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch, requireAdminSession } from '@/lib/directus-admin';
import { readTaxonomyUsage, type TaxonomyCollection, type TaxonomyItem } from '@/lib/admin-taxonomy';

function isCollection(value: string): value is TaxonomyCollection {
  return value === 'categories' || value === 'tags';
}

function validId(id: number) {
  return Number.isSafeInteger(id) && id > 0;
}

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

// Directus does not enforce unique slugs in the existing schema.
let pendingWrite: Promise<unknown> = Promise.resolve();

function queueWrite<T>(write: () => Promise<T>) {
  const result = pendingWrite.then(write);
  pendingWrite = result.catch(() => undefined);
  return result;
}

export async function saveTaxonomy(collection: string, id: number | null, form: FormData) {
  const session = await requireAdminSession();
  if (!session.ok) return { error: session.error };
  if (!isCollection(collection) || (id !== null && !validId(id))) return { error: '无效的管理项。' };

  const name = field(form, 'name');
  const slug = field(form, 'slug');
  const description = field(form, 'description');
  const icon = field(form, 'icon');
  const color = field(form, 'color');
  if (!name || name.length > 100) return { error: '名称须为 1 至 100 个字符。' };
  if (slug.length > 100 || !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) {
    return { error: '链接标识可使用字母、中文或数字，词语之间用短横线连接。' };
  }
  if (collection === 'categories' && (description.length > 500 || icon.length > 24)) {
    return { error: '分类描述最多 500 个字符，图标最多 24 个字符。' };
  }
  if (collection === 'tags' && color && !/^#[0-9a-f]{6}$/i.test(color)) {
    return { error: '颜色请填写 # 后跟 6 位十六进制字符，例如 #2496ED。' };
  }

  return queueWrite(async () => {
    const query = new URLSearchParams({ 'filter[slug][_eq]': slug, limit: '1', fields: 'id' });
    if (id !== null) query.set('filter[id][_neq]', String(id));
    const duplicate = await adminFetch<{ data: { id: number }[] }>(`/items/${collection}?${query}`);
    if (!duplicate.data) return { error: '暂时无法检查链接标识，请重试。' };
    if (duplicate.data.data.length) return { error: '这个链接标识已被使用，请换一个。' };

    const details = collection === 'categories' ? { description, icon: icon || null } : { color: color || null };
    const path = id === null ? `/items/${collection}` : `/items/${collection}/${id}`;
    const result = await adminFetch<{ data: TaxonomyItem }>(path, {
      method: id === null ? 'POST' : 'PATCH',
      body: JSON.stringify({ name, slug, ...details }),
    });
    if (!result.data) return { error: '保存失败，请刷新列表后重试。' };

    revalidatePath('/', 'layout');
    return { item: result.data.data };
  });
}

export async function deleteTaxonomy(collection: string, id: number) {
  const session = await requireAdminSession();
  if (!session.ok) return { error: session.error };
  if (!isCollection(collection) || !validId(id)) return { error: '无效的管理项。' };

  return queueWrite(async () => {
    const usage = await readTaxonomyUsage(collection);
    if (!usage) return { error: '暂时无法检查文章引用，请重试。' };
    if (usage[id]) return { error: `仍有 ${usage[id]} 篇文章引用此条目，请先在文章中移除关联。` };
    const result = await adminFetch(`/items/${collection}/${id}`, { method: 'DELETE' });
    if (result.error) return { error: '删除失败，请刷新列表后重试。' };

    revalidatePath('/', 'layout');
    return { ok: true };
  });
}
