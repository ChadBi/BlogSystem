import { BrandMark } from '@/components/BrandMark';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 font-black text-[var(--ink)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-[var(--pixel-edge)] bg-[#8edbfa]">
        <BrandMark size={34} />
      </span>
      <span className="leading-none">
        <span className="block font-mono text-[10px] tracking-[.14em] text-accent dark:text-accent-dark">SHARK TECH</span>
        <span className="mt-1 block whitespace-nowrap tracking-tight">浅海实验室</span>
      </span>
    </div>
  );
}
