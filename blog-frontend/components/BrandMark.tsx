type BrandMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

// 8-bit 像素拼接鲨鱼：用 rect 方块构成身体/背鳍/尾鳍/腹鳍，镂空方块作眼。
// 单色 currentColor，可继承文字色，适配 light/dark 与任意尺寸。
// 像素网格 9 列 x 8 行，每格 7px，viewBox 64x56（含尾鳍）。
export function BrandMark({ size = 32, className, title }: BrandMarkProps) {
  const P = 7;
  // 鲨鱼像素图（1=填充，2=眼睛镂空白，0=空）
  // 9 列 x 8 行：列 0-7 是身体，列 8 是尾鳍
  const map = [
    [0,0,0,0,0,0,1,1,0], // 背鳍尖
    [0,0,0,0,0,1,1,1,0], // 背鳍
    [0,0,1,1,1,1,1,1,0], // 背鳍底 + 身体上沿
    [1,1,1,1,1,1,1,1,1], // 身体（含眼行）
    [1,2,1,1,1,1,1,1,1], // 身体（眼在第 1 列）
    [0,1,1,1,1,1,1,1,0], // 身体下沿
    [0,0,1,1,1,1,1,0,0], // 腹部收窄 + 尾鳍上
    [0,0,0,1,1,0,0,0,0], // 腹鳍
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 63 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title ?? 'Shark Tech Blog 标志'}
      shapeRendering="crispEdges"
    >
      {title ? <title>{title}</title> : null}
      {map.map((row, y) =>
        row.map((cell, x) => {
          if (cell === 0) return null;
          if (cell === 2) {
            return <rect key={`${x}-${y}`} x={x * P} y={y * P} width={P} height={P} fill="#fff8e9" />;
          }
          return <rect key={`${x}-${y}`} x={x * P} y={y * P} width={P} height={P} fill="currentColor" />;
        })
      )}
      {/* 尾鳍外延方块（列 9-10，超出身体） */}
      <rect x={9 * P} y={3 * P} width={P} height={P} fill="currentColor" />
      <rect x={9 * P} y={4 * P} width={P} height={P} fill="currentColor" />
      <rect x={9 * P} y={5 * P} width={P} height={P} fill="currentColor" />
    </svg>
  );
}
