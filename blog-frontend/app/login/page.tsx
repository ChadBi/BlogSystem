'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <PixelCard>
          <h1 className="text-3xl font-black">管理员登录</h1>
          <p className="mt-2 text-sm text-slate-500">请输入密码以进入后台。</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              autoFocus
              required
              className="w-full rounded-xl border-2 border-ocean-800/20 bg-white px-4 py-3 font-bold outline-none focus:border-accent dark:border-ocean-400/25 dark:bg-surface-elevated dark:text-ink"
            />
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-5 py-3 font-black text-white shadow-pixel disabled:opacity-50 dark:bg-accent-dark dark:text-ocean-900"
            >
              {loading ? '登录中...' : '进入后台'}
            </button>
          </form>
        </PixelCard>
      </div>
    </PageShell>
  );
}
