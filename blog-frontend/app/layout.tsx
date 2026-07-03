import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrlStr = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
let siteUrl: URL;
try {
  siteUrl = new URL(siteUrlStr);
} catch {
  siteUrl = new URL('http://localhost:3000');
}

// 字体：沙箱环境无法下载 Google Fonts（next/font/google 会卡住），
// --font-sans / --font-mono 在 globals.css 用系统字体栈定义。

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'Shark Tech Blog',
  description: 'Retro × Ocean × Code 的个人技术博客',
  keywords: ['Next.js', 'Directus', 'Tech Blog', 'Pixel Art', 'Shark'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrlStr,
    siteName: 'Shark Tech Blog',
    title: 'Shark Tech Blog',
    description: '像素鲨客 · Retro × Ocean × Code - 一个个人技术博客',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shark Tech Blog',
    description: '像素鲨客 · Retro × Ocean × Code - 一个个人技术博客',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#132447',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
