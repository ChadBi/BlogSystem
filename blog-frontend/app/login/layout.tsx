import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 - Shark Tech Blog',
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
