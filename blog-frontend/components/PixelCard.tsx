import { cn } from '@/lib/utils';

export function PixelCard({
  children,
  className = '',
  corner = false
}: {
  children: React.ReactNode;
  className?: string;
  corner?: boolean;
}) {
  return <div className={cn('pixel-card rounded-2xl p-5', corner && 'pixel-corner', className)}>{children}</div>;
}
