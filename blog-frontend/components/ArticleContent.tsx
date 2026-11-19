'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

type Heading = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string, index: number): string {
  const slug = text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  return `section-${slug || 'heading'}-${index}`;
}

export function ArticleContent({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = articleRef.current?.querySelectorAll<HTMLHeadingElement>('h2, h3');
    setHeadings(Array.from(elements ?? [], (element, index) => {
      const text = element.textContent?.trim() ?? '';
      const id = slugifyHeading(text, index);
      element.id = id;
      element.style.scrollMarginTop = '6rem';
      return { id, text, level: element.tagName === 'H2' ? 2 : 3 };
    }));
  }, [content]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const article = articleRef.current;
      if (!article) return;

      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = article.offsetHeight - window.innerHeight;
      const progress = scrollableDistance <= 0
        ? 100
        : ((window.scrollY - articleTop) / scrollableDistance) * 100;
      setReadingProgress(Math.min(100, Math.max(0, Math.round(progress))));
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);
    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, [content]);

  async function copyCode(code: string, key: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopyError(null);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => current === key ? null : current), 1800);
    } catch {
      setCopied(null);
      setCopyError(key);
    }
  }

  return (
    <div className={`grid gap-8 ${headings.length ? 'lg:grid-cols-[minmax(0,1fr)_220px]' : ''}`}>
      <span role="status" className="sr-only">{copied ? '代码已复制' : copyError ? '复制失败，请手动选择代码复制' : ''}</span>
      <article ref={articleRef} className="prose-lite min-w-0">
        <div
          role="progressbar"
          aria-label="文章阅读进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readingProgress}
          className="fixed left-0 top-0 z-50 h-1 bg-accent transition-[width] dark:bg-accent-dark"
          style={{ width: `${readingProgress}%` }}
        />
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre: ({ children, node }) => {
              const key = `code-${node?.position?.start.offset}`;
              return (
                <div className="group relative">
                  <pre>{children}</pre>
                  <button
                    type="button"
                    onClick={(event) => {
                      const code = event.currentTarget.parentElement?.querySelector('code')?.textContent ?? '';
                      void copyCode(code.replace(/\n$/, ''), key);
                    }}
                    className="absolute right-2 top-2 rounded-lg border border-white/20 bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white transition sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                    aria-label="复制代码"
                  >
                    {copied === key ? '已复制' : copyError === key ? '复制失败' : '复制'}
                  </button>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
      {headings.length > 0 && (
        <aside className="h-fit lg:sticky lg:top-24" aria-label="文章目录">
          <div className="rounded-2xl border-2 border-ocean-800/15 bg-white/60 p-4 dark:border-ocean-400/15 dark:bg-surface/60">
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide">目录</h2>
            <nav>
              <ol className="space-y-2 text-sm">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? 'pl-3 text-xs' : ''}>
                    <a href={`#${heading.id}`} className="text-slate-600 underline-offset-4 hover:text-accent hover:underline dark:text-slate-300 dark:hover:text-accent-dark">{heading.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
