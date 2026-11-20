import { PageShell } from '@/components/PageShell';

export default function PostsLoading() {
  return (
    <PageShell>
      <div role="status" className="pixel-card rounded-3xl p-8 text-slate-600 dark:text-slate-300">
        正在加载文章…
      </div>
    </PageShell>
  );
}
