import { CategoryIcon } from '@/components/icons';
import { BrandMark } from '@/components/BrandMark';

export function PostThumb({ slug = 'notes', compact = false }: { slug?: string; compact?: boolean }) {
  return (
    <div aria-hidden="true" className="relative isolate grid h-full min-h-24 place-items-center overflow-hidden rounded-xl border border-ocean-700/35 bg-[#9edff7]">
      {compact ? (
        <BrandMark size={64} />
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-[url('/images/sea-contours.svg')] bg-cover bg-center opacity-25" />
          <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-[#17648c] bg-[#dff8ff] text-[#17648c] shadow-[3px_3px_0_#17648c]">
            <CategoryIcon slug={slug} size={23} />
          </span>
        </>
      )}
    </div>
  );
}
