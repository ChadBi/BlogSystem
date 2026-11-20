'use client';

import { useRef, useState, type FormEvent } from 'react';
import { deleteTaxonomy, saveTaxonomy } from '@/app/admin/taxonomy-actions';
import { PixelCard } from '@/components/PixelCard';
import type { TaxonomyCollection, TaxonomyItem } from '@/lib/admin-taxonomy';

const inputClass = 'mt-1 w-full rounded-lg border border-[var(--line-soft)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--ink)]';
const secondaryButton = 'rounded-lg border border-[var(--line-soft)] px-3 py-1.5 text-sm font-bold hover:border-[var(--accent)] disabled:opacity-50';

export function AdminTaxonomy({
  collection,
  items,
  usage,
}: {
  collection: TaxonomyCollection;
  items: TaxonomyItem[];
  usage: Record<string, number> | null;
}) {
  const isCategory = collection === 'categories';
  const label = isCategory ? '分类' : '标签';
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const search = query.trim().toLocaleLowerCase();
  const filtered = items.filter((item) => [item.name ?? '', item.slug ?? ''].some((value) => value.toLocaleLowerCase().includes(search)));

  function openForm(item: TaxonomyItem | null) {
    setEditing(item);
    setFormVersion((version) => version + 1);
    setFeedback(null);
    editor.current?.focus();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enteredSlug = String(form.get('slug') ?? '').trim();
    const name = String(form.get('name') ?? '');
    const slug = name.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
    form.set('slug', enteredSlug || slug);
    setBusy(true);
    setFeedback(null);
    try {
      const result = await saveTaxonomy(collection, editing?.id ?? null, form);
      if (result.error) {
        setFeedback({ error: true, text: result.error });
        return;
      }
      setFeedback({ error: false, text: `已${editing ? '保存' : '创建'}「${name.trim()}」。` });
      setQuery('');
      setEditing(null);
      setFormVersion((version) => version + 1);
    } catch {
      setFeedback({ error: true, text: '保存未完成，请重试。' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: TaxonomyItem) {
    const name = item.name || `未命名 #${item.id}`;
    if (!window.confirm(`确定删除${label}「${name}」？删除后，其筛选链接将失效。`)) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await deleteTaxonomy(collection, item.id);
      if (result.error) {
        setFeedback({ error: true, text: result.error });
        return;
      }
      if (editing?.id === item.id) openForm(null);
      setFeedback({ error: false, text: `已删除「${name}」。` });
    } catch {
      setFeedback({ error: true, text: '删除未完成，请重试。' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="taxonomy-heading">
      <header>
        <h2 id="taxonomy-heading" className="text-3xl font-black">{label}管理</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{isCategory ? '用分类组织博客主题，可为每个分类添加描述和图标。' : '用标签标记文章的技术关键词，可为每个标签设置颜色。'}</p>
      </header>

      {feedback && (
        <p role={feedback.error ? 'alert' : 'status'} className={feedback.error
          ? 'sticky top-24 z-20 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800'
          : 'sticky top-24 z-20 rounded-xl border border-ocean-300 bg-ocean-50 px-4 py-3 text-sm font-bold text-ocean-900'}>
          {feedback.text}
        </p>
      )}

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <PixelCard className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">{label}列表</h3>
              <p className="mt-1 font-mono text-xs text-[var(--ink-soft)]">{search ? `${filtered.length} / ` : ''}{items.length} 项</p>
            </div>
            <button type="button" className={secondaryButton} disabled={busy} onClick={() => openForm(null)}>新建{label}</button>
          </div>
          <label className="mt-4 block text-sm font-bold">
            搜索{label}
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入名称或链接标识" className={inputClass} />
          </label>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            {usage ? '引用数包含草稿。请先移除文章中的关联，再删除条目。' : '暂时无法读取引用数。刷新页面后可重试。'}
          </p>
          {filtered.length ? (
            <ul className="mt-3 space-y-2">
              {filtered.map((item) => {
                const count = usage?.[item.id] ?? 0;
                const canDelete = usage !== null && count === 0;
                const name = item.name || `未命名 #${item.id}`;
                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--surface-elevated)] p-3">
                    <div className="flex min-w-0 items-start gap-2">
                      {isCategory && item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
                      {!isCategory && item.color && /^#[0-9a-f]{6}$/i.test(item.color) ? <span aria-hidden="true" style={{ backgroundColor: item.color }} className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-black/25" /> : null}
                      <div className="min-w-0">
                        <p className="break-all font-black">{name}</p>
                        <p className="break-all font-mono text-xs text-[var(--ink-soft)]">{item.slug || '未设置链接标识'} · {usage ? `${count} 篇文章` : '引用数未知'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" disabled={busy} aria-label={`编辑 ${name}`} className={secondaryButton} onClick={() => openForm(item)}>编辑</button>
                      <button type="button" disabled={busy || !canDelete} aria-label={`删除 ${name}`} className={`${secondaryButton} text-red-700 dark:text-red-300`} onClick={() => handleDelete(item)}>删除</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-4 rounded-xl border border-dashed border-[var(--line-soft)] p-5 text-sm text-[var(--ink-soft)]">{search ? '没有匹配的结果。' : `暂无${label}。`}</p>}
        </PixelCard>

        <div ref={editor} tabIndex={-1} aria-labelledby="taxonomy-form-heading" className="scroll-mt-24 rounded-2xl">
          <PixelCard>
            <h3 id="taxonomy-form-heading" className="text-xl font-black">{editing ? `编辑${label}` : `新建${label}`}</h3>
            <form key={formVersion} onSubmit={handleSave} aria-labelledby="taxonomy-form-heading" className="mt-4">
              <fieldset disabled={busy} className="min-w-0 space-y-4 disabled:opacity-60">
                <label className="block text-sm font-bold">名称
                  <input name="name" defaultValue={editing?.name ?? ''} required maxLength={100} className={inputClass} />
                </label>
                <label className="block text-sm font-bold">链接标识
                  <input name="slug" defaultValue={editing?.slug ?? ''} maxLength={100} required={Boolean(editing)} aria-describedby="taxonomy-slug-help" className={inputClass} />
                </label>
                <p id="taxonomy-slug-help" className="!mt-1 text-xs text-[var(--ink-soft)]">{editing ? '修改后，原有链接将失效。' : '用于文章筛选链接，留空会根据名称生成。'}</p>
                {isCategory ? (
                  <>
                    <label className="block text-sm font-bold">描述
                      <textarea name="description" defaultValue={editing?.description ?? ''} maxLength={500} rows={3} className={inputClass} />
                    </label>
                    <label className="block text-sm font-bold">图标
                      <input name="icon" defaultValue={editing?.icon ?? ''} maxLength={24} placeholder="例如 🦈" className={inputClass} />
                    </label>
                  </>
                ) : (
                  <label className="block text-sm font-bold">颜色（选填）
                    <input name="color" defaultValue={editing?.color ?? ''} placeholder="#2496ED" maxLength={7} className={inputClass} />
                  </label>
                )}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-black text-white shadow-pixel-sm hover:opacity-90 dark:bg-accent-dark dark:text-ocean-900">{busy ? '处理中…' : `保存${label}`}</button>
                  {editing && <button type="button" onClick={() => openForm(null)} className={secondaryButton}>取消编辑</button>}
                </div>
              </fieldset>
            </form>
          </PixelCard>
        </div>
      </div>
    </section>
  );
}
