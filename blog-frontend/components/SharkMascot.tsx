export function SharkMascot({ variant = 'default' }: { variant?: 'default' | 'laptop' | 'read' | 'fin' }) {
  if (variant === 'fin') {
    return <div className="mx-auto h-16 w-24 rounded-t-[70%] border-4 border-ocean-900 bg-gradient-to-br from-ocean-300 to-ocean-700 shadow-pixel" aria-label="像素鲨鱼鳍" />;
  }

  return (
    <div className="relative mx-auto h-44 max-w-64 overflow-visible" aria-label="像素鲨鱼角色">
      <div className="absolute left-5 top-16 h-16 w-24 -rotate-12 rounded-[55%] border-4 border-ocean-900 bg-gradient-to-br from-ocean-300 to-ocean-700" />
      <div className="absolute left-20 top-8 h-28 w-28 rounded-[48%] border-4 border-ocean-900 bg-gradient-to-br from-ocean-400 to-ocean-700">
        <div className="absolute bottom-0 right-2 h-16 w-20 rounded-[50%] bg-shell" />
        <div className="absolute left-9 top-9 h-12 w-20 rounded-xl border-4 border-purple-800 bg-purple-500/80 shadow-[inset_0_0_0_4px_rgba(255,255,255,.25)]" />
        <span className="absolute left-14 top-12 h-3 w-3 rounded-full bg-white" />
        <span className="absolute left-24 top-12 h-3 w-3 rounded-full bg-white" />
        <span className="absolute bottom-8 right-5 text-xl">◡</span>
      </div>
      <div className="absolute left-24 top-2 h-16 w-12 -rotate-12 rounded-t-full border-4 border-ocean-900 bg-ocean-600" />
      <div className="absolute left-2 top-16 h-20 w-10 -rotate-[25deg] rounded-l-full border-4 border-ocean-900 bg-ocean-600" />
      {(variant === 'laptop' || variant === 'default') && (
        <div className="absolute bottom-5 right-5 h-20 w-28 rounded-lg border-4 border-slate-900 bg-gradient-to-br from-indigo-500 to-slate-900">
          <span className="absolute left-10 top-6 text-white">⌘</span>
        </div>
      )}
      {variant === 'read' && <div className="absolute bottom-6 right-4 h-20 w-28 rotate-3 rounded-lg border-4 border-emerald-900 bg-emerald-600" />}
    </div>
  );
}
