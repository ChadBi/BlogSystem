import { CategoryIcon } from '@/components/icons';

// 文章占位缩略图：深海蓝渐变 + 分类图标 + 像素装饰点。
// 不再使用 emoji，改用分类 slug 映射的 SVG 图标。
export function PostThumb({ slug }: { slug?: string }) {
  return (
    <div className="relative grid h-full min-h-24 place-items-center overflow-hidden rounded-xl border-2 border-ocean-900/70 bg-gradient-to-br from-[#0b1b3d] via-[#173b7a] to-[#3a2d8f] dark:border-ocean-400/30">
      {slug ? (
        <CategoryIcon slug={slug} size={32} className="text-mint" />
      ) : null}
      <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-mint" />
      <span className="absolute bottom-3 right-4 h-3 w-3 rounded-full bg-accent dark:bg-accent-dark" />
      <span className="absolute bottom-0 left-0 h-6 w-full bg-gradient-to-r from-ocean-400/40 to-accent/30" />
    </div>
  );
}
