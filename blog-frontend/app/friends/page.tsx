import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { getFriends } from '@/lib/directus';
import { SharkMascot } from '@/components/SharkMascot';

export default async function FriendsPage() {
  const friends = await getFriends();
  return (
    <PageShell>
      <div className="space-y-6">
        <header className="pixel-card ocean-floor grid items-center gap-6 rounded-3xl p-8 pb-14 md:grid-cols-[1fr_320px]">
          <div><h1 className="text-5xl font-black">好友 / FRIENDS 💗</h1><p className="mt-4 text-lg font-bold text-slate-700">在这里发现有趣的开发者、技术创作者和开源项目。</p></div>
          <SharkMascot variant="laptop" />
        </header>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{friends.map((friend) => <PixelCard key={friend.id}><div className="flex gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ocean-100 text-3xl">{friend.avatar}</div><div><h3 className="font-black">{friend.name}</h3><p className="text-sm font-bold text-coral">{friend.role}</p><p className="mt-2 text-sm leading-6 text-slate-600">{friend.description}</p><a href={friend.url} className="mt-3 block font-mono text-xs text-ocean-700">{friend.url}</a></div></div></PixelCard>)}</section>
        <PixelCard className="text-center"><h2 className="text-2xl font-black">加入社区，一起探索技术的海洋！</h2><button className="mt-5 rounded-xl bg-coral px-8 py-3 font-black text-white shadow-pixel">申请加入 💙</button></PixelCard>
      </div>
    </PageShell>
  );
}
