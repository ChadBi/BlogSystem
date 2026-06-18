import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { getPosts } from '@/lib/directus';
import { formatDate } from '@/lib/utils';

const metrics = [['文章总数', '24', '+2 本月'], ['总访问量', '42.7k', '+12.4%'], ['获赞总数', '1.2k', '+8.7%'], ['评论总数', '568', '+15.3%'], ['访客总数', '3.8k', '+10.1%'], ['资源文件', '312', '占用 1.2GB']];

export default async function DashboardPage() {
  const posts = await getPosts();
  return (
    <PageShell showSidebar={false}>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="pixel-card h-fit rounded-3xl p-4"><div className="flex items-center gap-3"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-ocean-100 text-3xl">🦈</div><div><p className="font-black">Shark</p><p className="text-sm text-slate-500">管理员</p></div></div><nav className="mt-6 grid gap-2 text-sm font-bold"><span className="rounded-xl bg-coral px-4 py-3 text-white">仪表盘</span><span className="px-4 py-3">文章管理</span><span className="px-4 py-3">分类标签</span><span className="px-4 py-3">评论管理</span><span className="px-4 py-3">访客统计</span><span className="px-4 py-3">设置</span></nav></aside>
        <section className="space-y-6">
          <header><h1 className="text-4xl font-black">欢迎回来，Shark! 👋</h1><p className="mt-2 text-slate-500">这是网站的实时数据概览。</p></header>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value, delta]) => <PixelCard key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-ocean-900">{value}</p><p className="mt-2 text-sm font-bold text-emerald-600">{delta}</p></PixelCard>)}</div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <PixelCard><h2 className="mb-4 text-2xl font-black">最新文章</h2><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b"><th className="py-3">标题</th><th>分类</th><th>状态</th><th>发布时间</th><th>访问量</th><th>操作</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id} className="border-b border-ocean-800/10"><td className="py-3 font-bold">{post.title}</td><td>{post.category.name}</td><td><span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">已发布</span></td><td>{formatDate(post.publishedAt)}</td><td>{post.views}</td><td>👁 ✎</td></tr>)}</tbody></table></div></PixelCard>
            <PixelCard><h2 className="mb-4 text-2xl font-black">近 7 天访问量趋势</h2><div className="flex h-56 items-end gap-3 rounded-2xl bg-ocean-50 p-4">{[90, 58, 128, 82, 88, 70, 142].map((h, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-gradient-to-t from-coral to-ocean-300" style={{ height: `${h}px` }} /><span className="text-xs text-slate-500">05-{String(i+6).padStart(2,'0')}</span></div>)}</div></PixelCard>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
