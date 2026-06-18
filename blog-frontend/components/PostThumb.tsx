export function PostThumb({ icon = '🦈' }: { icon?: string }) {
  return (
    <div className="relative grid h-full min-h-24 place-items-center overflow-hidden rounded-xl border-2 border-ocean-900 bg-gradient-to-br from-[#0b1b3d] via-[#173b7a] to-[#6b4bdb]">
      <span className="text-4xl drop-shadow-lg">{icon}</span>
      <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-mint" />
      <span className="absolute bottom-3 right-4 h-3 w-3 rounded-full bg-coral" />
      <span className="absolute bottom-0 left-0 h-6 w-full bg-gradient-to-r from-ocean-400/40 to-purple-400/30" />
    </div>
  );
}
