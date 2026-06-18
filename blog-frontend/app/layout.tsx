import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shark Tech Blog',
  description: 'Retro × Ocean × Code 的个人技术博客',
  keywords: ['Next.js', 'Directus', 'Tech Blog', 'Pixel Art', 'Shark']
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
