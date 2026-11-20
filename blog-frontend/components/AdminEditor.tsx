'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Category, Tag } from '@/types/post';

type AdminPost = {
  id: number | string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: 'draft' | 'published';
  published_at: string;
  category: number | null;
  tags: number[];
};

// 简单的 slug 生成：中文转拼音超出范围，这里只做英文/数字/连字符规范化
function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminEditor({
  categories,
  tags,
  post,
}: {
  categories: Category[];
  tags: Tag[];
  post: AdminPost | null;
}) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [summary, setSummary] = useState(post?.summary ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(post?.category ?? '');
  const [tagIds, setTagIds] = useState<number[]>(post?.tags ?? []);
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft');
  const [autoSlug, setAutoSlug] = useState(!post); // 新建时自动生成 slug

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const initialSnapshot = useRef(JSON.stringify({ title: post?.title ?? '', slug: post?.slug ?? '', summary: post?.summary ?? '', content: post?.content ?? '', categoryId: post?.category ?? '', tagIds: post?.tags ?? [], status: post?.status ?? 'draft' }));
  const currentSnapshot = useMemo(() => JSON.stringify({ title, slug, summary, content, categoryId, tagIds, status }), [title, slug, summary, content, categoryId, tagIds, status]);
  const hasUnsavedChanges = currentSnapshot !== initialSnapshot.current;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges && !submitting) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const handleNavigation = (event: MouseEvent) => {
      if ((!hasUnsavedChanges && !submitting) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element
        ? event.target.closest('a[href], button[data-leave-editor]')
        : null;
      if (!target) return;
      if (target instanceof HTMLAnchorElement) {
        if (target.target === '_blank' || target.hasAttribute('download') || target.hasAttribute('data-document-navigation')) return;
        const destination = new URL(target.href);
        if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      }
      if (!confirm('当前内容尚未保存，确定离开吗？')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleNavigation, true);
    };
  }, [hasUnsavedChanges, submitting]);

  function leaveEditor() {
    if (hasUnsavedChanges && !confirm('当前内容尚未保存，确定离开吗？')) return;
    router.push('/admin');
  }

  // 标题变化时自动同步 slug（仅新建模式）
  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  function toggleTag(id: number) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  // 工具栏：在 textarea 光标处插入 Markdown 语法
  function wrapSelection(prefix: string, suffix: string = prefix) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newText = before + prefix + selected + suffix + after;
    setContent(newText);
    // 还原光标位置
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + prefix.length;
      ta.selectionEnd = end + prefix.length;
    });
  }

  function insertLine(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = content.slice(0, start);
    // 找到当前行行首
    const lineStart = before.lastIndexOf('\n') + 1;
    const newText = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    });
  }

  async function handleSubmit(targetStatus: 'draft' | 'published') {
    if (submitting || deleting || success) return;
    setError('');
    setSuccess('');
    if (!title.trim()) { setError('标题必填'); return; }
    if (!slug.trim()) { setError('slug 必填'); return; }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      summary,
      content,
      status: targetStatus,
      published_at: post?.published_at ?? new Date().toISOString(),
      category: categoryId === '' ? null : Number(categoryId),
      tags: tagIds,
    };

    try {
      const url = post ? `/api/admin/posts/${post.id}` : '/api/admin/posts';
      const method = post ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存失败');
        return;
      }
      initialSnapshot.current = JSON.stringify({ title, slug, summary, content, categoryId, tagIds, status: targetStatus });
      setStatus(targetStatus);
      setSuccess(targetStatus === 'published' ? '文章已发布，即将返回文章管理' : '草稿已保存，即将返回文章管理');
      // 保存成功后跳回仪表盘
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!post || submitting || deleting) return;
    if (!confirm(`确认删除文章「${post.title}」？此操作不可恢复。`)) return;
    setError('');
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '删除失败');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <fieldset disabled={submitting || deleting || Boolean(success)} className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="pixel-card min-w-0 rounded-3xl p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-black">
          {post ? '编辑文章' : '写作编辑器'}
          </h2>
          <span className={`text-sm font-bold ${error ? 'text-red-600 dark:text-red-400' : submitting ? 'text-accent' : hasUnsavedChanges ? 'text-amber-600' : 'text-emerald-600'}`} aria-live="polite">
            {submitting ? '保存中…' : error ? '保存失败，请重试' : hasUnsavedChanges ? '有未保存修改' : post || success ? '已保存' : '新建文章'}
          </span>
        </div>

        {/* 标题 */}
        <label htmlFor="editor-title" className="sr-only">文章标题</label>
        <input
          id="editor-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题（必填）"
          className="mb-4 w-full rounded-xl border border-ocean-800/25 dark:border-white/20 bg-white dark:bg-surface-elevated px-4 py-4 text-xl font-bold outline-none focus:border-accent"
        />

        {/* Slug */}
        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
              className="[accent-color:var(--accent)]"
            />
            自动生成
          </label>
          <label htmlFor="editor-slug" className="sr-only">文章 slug</label>
          <input
            id="editor-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
            disabled={autoSlug}
            className="min-w-0 flex-1 rounded-xl border border-ocean-800/25 dark:border-white/20 bg-white dark:bg-surface-elevated px-4 py-2 font-mono text-sm outline-none focus:border-accent disabled:bg-ocean-50 disabled:text-slate-500 dark:disabled:bg-surface dark:disabled:text-slate-400"
          />
        </div>

        {/* 摘要 */}
        <div className="mb-5">
          <label htmlFor="editor-summary" className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">文章摘要</label>
          <textarea
            id="editor-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="一句话总结这篇文章"
            className="min-h-[80px] w-full rounded-xl border border-ocean-800/25 dark:border-white/20 bg-white/70 dark:bg-surface-elevated p-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <label htmlFor="editor-content" className="mb-2 block text-sm font-bold">正文</label>
        {/* 工具栏 */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-ocean-800/25 dark:border-white/20 bg-white/70 dark:bg-surface-elevated p-2 text-sm font-bold">
          <button type="button" onClick={() => insertLine('## ')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">H2</button>
          <button type="button" onClick={() => insertLine('### ')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">H3</button>
          <button type="button" onClick={() => wrapSelection('**')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">B</button>
          <button type="button" onClick={() => wrapSelection('*')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">I</button>
          <button type="button" onClick={() => wrapSelection('`')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">{'</>'}</button>
          <button type="button" onClick={() => insertLine('> ')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">引用</button>
          <button type="button" onClick={() => insertLine('- ')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">列表</button>
          <button type="button" onClick={() => wrapSelection('[', '](url)')} className="rounded-lg px-3 py-1 hover:bg-ocean-100">链接</button>
        </div>

        {/* 正文 */}
        <textarea
          id="editor-content"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'在这里开始写作吧...\n支持 Markdown 语法'}
          className="min-h-[520px] w-full rounded-2xl border border-ocean-800/25 dark:border-white/20 bg-white/70 dark:bg-surface-elevated p-5 font-mono text-sm outline-none focus:border-accent"
        />

        {/* 反馈与操作 */}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
        {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</p>}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={leaveEditor} className="rounded-xl border border-ocean-800/25 dark:border-white/20 px-5 py-3 font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            返回管理
          </button>
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border-2 border-red-300 px-5 py-3 font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? '删除中...' : '删除'}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="rounded-xl border-2 border-ocean-800/25 px-5 py-3 font-black disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存草稿'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={submitting}
            className="rounded-xl bg-accent px-5 py-3 font-black text-white shadow-pixel disabled:opacity-50 dark:bg-accent-dark dark:text-ocean-900"
          >
            {submitting ? '发布中...' : '发布文章'}
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        {/* 状态 - 视觉化状态轨道 */}
        <div className="pixel-card rounded-3xl p-5">
          <header className="mb-3 flex items-baseline justify-between">
            <h3 className="font-black tracking-tight">文章状态</h3>
          </header>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={status === 'draft'}
              onClick={() => setStatus('draft')}
              className={`group relative overflow-hidden rounded-xl border-2 px-3 py-3 text-left transition ${
                status === 'draft'
                  ? 'border-ocean-400 bg-ocean-100 dark:border-ocean-500 dark:bg-ocean-900/40'
                  : 'border-ocean-800/15 bg-white/60 hover:border-ocean-300 dark:border-ocean-400/15 dark:bg-surface/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${status === 'draft' ? 'bg-ocean-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-black">草稿</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400">仅博主可见</p>
            </button>
            <button
              type="button"
              aria-pressed={status === 'published'}
              onClick={() => setStatus('published')}
              className={`group relative overflow-hidden rounded-xl border-2 px-3 py-3 text-left transition ${
                status === 'published'
                  ? 'border-accent bg-accent/10 dark:border-accent-dark dark:bg-accent-dark/15'
                  : 'border-ocean-800/15 bg-white/60 hover:border-accent/50 dark:border-ocean-400/15 dark:bg-surface/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${status === 'published' ? 'bg-accent dark:bg-accent-dark' : 'bg-slate-300'}`} />
                <span className="text-sm font-black">已发布</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400">前台可见</p>
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            下方「保存草稿 / 发布文章」按钮会同步此状态。
          </p>
        </div>

        {/* 分类 - chip 网格 + select fallback */}
        <div className="pixel-card rounded-3xl p-5">
          <header className="mb-3 flex items-baseline justify-between">
            <h3 className="font-black tracking-tight">分类</h3>
            <Link href="/admin?view=categories" className="text-xs font-bold text-accent hover:underline dark:text-accent-dark">管理分类</Link>
          </header>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              aria-pressed={categoryId === ''}
              onClick={() => setCategoryId('')}
              className={`rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition ${
                categoryId === ''
                  ? 'border-accent bg-accent/10 text-accent dark:border-accent-dark dark:bg-accent-dark/15 dark:text-accent-dark'
                  : 'border-ocean-800/15 bg-white/50 text-slate-600 hover:border-ocean-300 dark:border-ocean-400/15 dark:bg-surface/50 dark:text-slate-300'
              }`}
            >
              未分类
            </button>
            {categories.map((c) => {
              const active = categoryId === Number(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryId(Number(c.id))}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition ${
                    active
                      ? 'border-accent bg-accent/10 text-accent dark:border-accent-dark dark:bg-accent-dark/15 dark:text-accent-dark'
                      : 'border-ocean-800/15 bg-white/50 text-slate-600 hover:border-ocean-300 dark:border-ocean-400/15 dark:bg-surface/50 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm leading-none">{c.icon}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
          {categories.length === 0 && (
            <p className="mt-2 text-xs text-[var(--ink-soft)]">可在分类管理中添加分类。</p>
          )}
        </div>

        {/* 标签 - 计数 + 选中态 */}
        <div className="pixel-card rounded-3xl p-5">
          <header className="mb-3 flex items-baseline justify-between">
            <h3 className="font-black tracking-tight">标签</h3>
            <Link href="/admin?view=tags" className="text-xs font-bold text-accent hover:underline dark:text-accent-dark">管理标签</Link>
          </header>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="文章标签（可多选）">
            {tags.map((t) => {
              const active = tagIds.includes(Number(t.id));
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(Number(t.id))}
                  className={`inline-flex max-w-full items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    active
                      ? 'border-accent bg-accent text-white dark:border-accent-dark dark:bg-accent-dark dark:text-ocean-900'
                      : 'border-ocean-800/15 bg-white/50 text-slate-600 hover:border-accent/50 hover:text-accent dark:border-ocean-400/15 dark:bg-surface/50 dark:text-slate-300 dark:hover:text-accent-dark'
                  }`}
                >
                  <span aria-hidden="true" className={`inline-block w-3 shrink-0 text-center font-mono text-[10px] ${active ? 'visible' : 'invisible'}`}>✓</span>
                  <span className="min-w-0 break-all text-left">{t.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-soft)]" aria-live="polite">可多选，已选 {tagIds.length} 个标签。</p>
          {tags.length === 0 && (
            <p className="mt-2 text-xs text-[var(--ink-soft)]">可在标签管理中添加标签。</p>
          )}
        </div>

        <div className="pixel-card rounded-3xl p-5">
          <h3 className="mb-3 font-black">写作提示</h3>
          <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-slate-600 marker:text-accent dark:text-slate-300">
            <li>正文支持 Markdown，可用二级和三级标题生成目录。</li>
            <li>文章地址建议使用英文单词，以短横线分隔。</li>
            <li>保存为草稿后，仅自己可见。</li>
          </ul>
        </div>
      </aside>
    </fieldset>
  );
}
