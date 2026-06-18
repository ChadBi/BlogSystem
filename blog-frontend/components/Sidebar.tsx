import Link from 'next/link';
import { SharkMascot } from '@/components/SharkMascot';

const menu = [
  ['首页', '/', '⌂'],
  ['文章', '/posts', '▤'],
  ['分类', '/categories', '▦'],
  ['归档', '/archive', '◷'],
  ['搜索', '/search', '⌕'],
  ['好友', '/friends', '♡'],
  ['关于', '/about', '☻'],
  ['写作', '/editor', '✎'],
  ['后台', '/dashboard', '▣']
];

export function Sidebar() {
  return (
    <aside className="side-panel sticky top-24 h-fit space-y-4">
      <section className="pixel-card ocean-floor rounded-2xl p-4 pb-12">
        <h1 className="pixel-title text-4xl font-black leading-tight">像素鲨客</h1>
        <p className="mt-1 text-sm font-bold text-coral">RETRO × OCEAN × CODE</p>
        <div className="my-4 rounded-2xl bg-ocean-100 p-3"><SharkMascot variant="laptop" /></div>
        <p className="rounded-xl bg-coral px-4 py-3 text-center text-sm font-bold text-white">一个热爱代码与海洋的开发者，在像素世界里探索技术与未知。</p>
      </section>
      <section className="pixel-card rounded-2xl p-3">
        <nav className="grid gap-1">
          {menu.map(([label, href, icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold hover:bg-ocean-100">
              <span className="w-6 text-center text-coral">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </section>
      <section className="pixel-card rounded-2xl p-4">
        <h3 className="font-black">今日一句 / DAILY QUOTE</h3>
        <p className="mt-3 whitespace-pre-line rounded-xl bg-white/60 p-3 font-mono text-sm">Stay hungry.\nStay foolish.\n— Steve Jobs</p>
      </section>
    </aside>
  );
}
