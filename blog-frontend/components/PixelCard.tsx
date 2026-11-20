import { cn } from '@/lib/utils';

export function PixelCard({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('pixel-card rounded-2xl p-5', className)}>{children}</div>;
}
