type Props = { className?: string; size?: number };

// 鲨鱼鳍剪影：三角形 + 锯齿底，极简单色 currentColor。
// 用于章节分隔、角落水印装饰。
export function SharkFin({ className, size = 120 }: Props) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* 鳍主体：三角形 */}
      <path d="M10 70 L 60 8 L 110 70 Z" fill="currentColor" />
      {/* 鳍底锯齿 */}
      <path
        d="M30 70 L 40 64 L 50 70 L 60 64 L 70 70 L 80 64 L 90 70"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

// 完整鲨鱼剪影（侧视，游动姿态），用于页脚装饰条。
export function SharkSwim({ className, size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 流线身体 */}
      <path
        d="M10 40 C 30 20, 80 15, 130 25 C 160 30, 180 35, 195 40 C 180 45, 160 50, 130 55 C 80 65, 30 60, 10 40 Z"
        fill="currentColor"
      />
      {/* 尾鳍 */}
      <path d="M195 40 L 200 30 L 198 40 L 200 50 Z" fill="currentColor" />
      {/* 背鳍 */}
      <path d="M70 22 L 80 10 L 95 22 Z" fill="currentColor" />
    </svg>
  );
}
