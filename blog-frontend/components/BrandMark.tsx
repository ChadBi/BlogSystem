import Image from 'next/image';

type BrandMarkProps = {
  size?: number;
  className?: string;
  title?: string;
  priority?: boolean;
};

export function BrandMark({ size = 32, className = '', title = '', priority }: BrandMarkProps) {
  return (
    <Image
      src="/images/shark-girl-avatar.webp"
      alt={title}
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={priority}
      className={`h-auto ${className}`}
    />
  );
}
