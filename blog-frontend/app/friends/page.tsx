import type { Metadata } from 'next';
import Image from 'next/image';
import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { ArrowUpRight } from '@/components/icons';
import { getFriends } from '@/lib/directus';
import { authorEmail } from '@/lib/site-profile';

export const metadata: Metadata = {
  title: '友链 - Shark Tech Blog',
  description: '我的好友与推荐站点。',
};

export default async function FriendsPage() {
  const friends = await getFriends();
  return (
    <PageShell>
      <div className="space-y-6">
        <Reveal>
          <header className="pixel-card grid items-center gap-6 rounded-3xl p-8 md:grid-cols-[1fr_220px]">
            <div>
              <h1 className="text-4xl font-black md:text-5xl dark:text-ocean-100">好友 / FRIENDS</h1>
              <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">
                我的朋友们
              </p>
            </div>
            <div className="hidden justify-center md:flex">
              <BrandMark size={180} className="text-accent dark:text-accent-dark" />
            </div>
          </header>
        </Reveal>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {friends.map((friend, i) => (
            <Reveal key={friend.id} delay={(i % 3) * 60}>
              <PixelCard>
                <div className="flex gap-4">
                  <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ocean-100 dark:bg-ocean-900/40">
                    {friend.avatar.startsWith('/images/friends/') || friend.avatar.startsWith('http') ? (
                      <Image src={friend.avatar} alt={friend.name} fill sizes="64px" unoptimized={friend.avatar.startsWith('/images/friends/')} className="object-cover" />
                    ) : (
                      <BrandMark size={28} className="text-ocean-700 dark:text-ocean-200" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black dark:text-ink">{friend.name}</h3>
                    <p className="text-sm font-bold text-accent dark:text-accent-dark">{friend.role}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{friend.description}</p>
                    <a
                      href={friend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-ocean-700 hover:text-accent dark:text-ocean-300 dark:hover:text-accent-dark"
                    >
                      {friend.url} <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              </PixelCard>
            </Reveal>
          ))}
        </section>

        <Reveal>
          <PixelCard className="text-center">
            <h2 className="text-2xl font-black dark:text-ocean-100">交换友链</h2>
            <p className="mt-4 break-all font-mono text-sm text-accent dark:text-accent-dark">{authorEmail}</p>
          </PixelCard>
        </Reveal>
      </div>
    </PageShell>
  );
}
