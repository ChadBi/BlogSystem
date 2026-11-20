'use client';

import { useLinkStatus } from 'next/link';

export function ArticleNavLabel() {
  const { pending } = useLinkStatus();

  return (
    <span className="relative">
      文章
      {pending && <span aria-hidden="true" className="absolute left-full ml-0.5">…</span>}
      <span role="status" className="sr-only">{pending ? '正在打开文章列表' : ''}</span>
    </span>
  );
}
