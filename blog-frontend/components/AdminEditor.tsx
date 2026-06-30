'use client';

import { useState, useRef, useEffect } from 'react';
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
    const after = content.slice(start);
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
    setError('');
    setSuccess('');
    if (!title.trim()) { setError('标题必填'); return; }
    if (!slug.trim()) { setError('slug 必填'); return; }

    setSubmitting(true);
    setStatus(targetStatus);
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
      setSuccess(targetStatus === 'published' ? '文章已发布' : '草稿已保存');
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
    if (!post) return;
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
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="pixel-card rounded-3xl p-6">
        <h2 className="mb-5 text-3xl font-black">
          {post ? '编辑文章' : '写作编辑器'} / WRITING
        </h2>

        {/* 标题 */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题（必填）"
          className="mb-4 w-full rounded-xl border-2 border-ocean-800/20 bg-white px-4 py-4 text-xl font-bold outline-none focus:border-coral"
        />

        {/* Slug */}
        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
              className="accent-coral"
            />
            自动生成
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
            disabled={autoSlug}
            className="flex-1 rounded-xl border-2 border-ocean-800/20 bg-white px-4 py-2 font-mono text-sm outline-none focus:border-coral disabled:bg-ocean-50 disabled:text-slate-500"
          />
        </div>

        {/* 工具栏 */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border-2 border-ocean-800/20 bg-white/70 p-2 text-sm font-bold">
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
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'在这里开始写作吧...\n支持 Markdown 语法'}
          className="min-h-[520px] w-full rounded-2xl border-2 border-ocean-800/20 bg-white/70 p-5 font-mono text-sm outline-none focus:border-coral"
        />

        {/* 摘要 */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-bold text-slate-600">摘要 / SUMMARY</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="一句话总结这篇文章"
            className="min-h-[80px] w-full rounded-xl border-2 border-ocean-800/20 bg-white/70 p-3 text-sm outline-none focus:border-coral"
          />
        </div>

        {/* 反馈与操作 */}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</p>}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
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
            className="rounded-xl bg-coral px-5 py-3 font-black text-white shadow-pixel disabled:opacity-50"
          >
            {submitting ? '发布中...' : '发布文章'}
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        {/* 状态 */}
        <div className="pixel-card">
          <h3 className="mb-3 font-black">文章状态 / STATUS</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${status === 'draft' ? 'bg-ocean-200 text-ocean-900' : 'bg-white/60 text-slate-600'}`}
            >
              草稿
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${status === 'published' ? 'bg-coral text-white' : 'bg-white/60 text-slate-600'}`}
            >
              已发布
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            点击下方按钮提交时，状态会同步为按钮对应的状态。
          </p>
        </div>

        {/* 分类 */}
        <div className="pixel-card">
          <h3 className="mb-3 font-black">分类 / CATEGORY</h3>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-xl border-2 border-ocean-800/20 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-coral"
          >
            <option value="">未分类</option>
            {categories.map((c) => (
              <option key={c.id} value={Number(c.id)}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* 标签 */}
        <div className="pixel-card">
          <h3 className="mb-3 font-black">标签 / TAGS</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(Number(t.id))}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  tagIds.includes(Number(t.id))
                    ? 'bg-coral text-white'
                    : 'bg-white/60 text-slate-600 hover:bg-ocean-100'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          {tags.length === 0 && <p className="text-xs text-slate-500">暂无标签</p>}
        </div>

        {/* 小贴士 */}
        <div className="pixel-card">
          <h3 className="mb-3 font-black">写作小贴士 / TIPS</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>使用 Markdown 提升写作效率</li>
            <li>合理使用标题层级 H2-H3</li>
            <li>slug 影响文章 URL，建议用英文</li>
            <li>保存草稿不会出现在前台</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
