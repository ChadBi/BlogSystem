'use client';

import { useState, type FormEvent } from 'react';
import { saveAbout } from '@/app/admin/about-actions';
import { PixelCard } from '@/components/PixelCard';
import type { About } from '@/lib/about';

const input = 'mt-2 w-full rounded-xl border-2 border-ocean-800/20 bg-white/70 px-4 py-3 text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:bg-surface-elevated';

export function AdminAbout({ initial }: { initial: About }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setFeedback(null);
    try {
      const result = await saveAbout(form);
      setFeedback(result.error ? { error: true, text: result.error } : { error: false, text: '关于我页面已更新。' });
    } catch {
      setFeedback({ error: true, text: '保存未完成，请重试。' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-3xl font-black">关于我设置</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">编辑公开页面中的个人介绍和技术栈。</p>
      </header>
      <PixelCard>
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
          <label className="block font-bold">页面简介<input className={input} name="intro" defaultValue={initial.intro} maxLength={200} required /></label>
          <label className="block font-bold">标语<input className={input} name="motto" defaultValue={initial.motto} maxLength={200} /></label>
          <label className="block font-bold">个人介绍<textarea className={input} name="bio" defaultValue={initial.bio} maxLength={5000} rows={6} required /></label>
          <label className="block font-bold">技术栈<span className="mt-1 block text-sm font-normal text-[var(--ink-soft)]">每行填写一项，按填写顺序展示。</span><textarea className={input} name="skills" defaultValue={initial.skills.join('\n')} rows={8} /></label>
          {feedback && <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? 'font-bold text-red-700' : 'font-bold text-emerald-700'}>{feedback.text}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={busy} className="rounded-xl bg-accent px-5 py-3 font-black text-white shadow-pixel-sm disabled:opacity-50">{busy ? '保存中…' : '保存设置'}</button>
            <a href="/about" target="_blank" rel="noreferrer" className="font-bold text-accent underline">查看关于我页面</a>
          </div>
        </form>
      </PixelCard>
    </section>
  );
}
