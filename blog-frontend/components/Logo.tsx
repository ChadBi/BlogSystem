import { BrandMark } from '@/components/BrandMark';

export function Logo() {
  return (
    <div className="flex items-center gap-3 font-black text-ink dark:text-[var(--ink)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ocean-800 bg-ocean-100 text-ocean-900 shadow-[3px_3px_0_#24406f22] dark:border-ocean-400 dark:bg-ocean-900/40 dark:text-ocean-100">
        <BrandMark size={22} />
      </span>
      <span className="text-xl tracking-tight">Shark Tech Blog</span>
    </div>
  );
}
