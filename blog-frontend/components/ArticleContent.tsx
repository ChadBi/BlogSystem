export function ArticleContent({ content }: { content: string }) {
  const html = content
    .split('\n')
    .map((line) => {
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('> ')) return `<blockquote>${line.slice(2)}</blockquote>`;
      if (line.trim().startsWith('```')) return '';
      if (!line.trim()) return '';
      if (/^[├└│\s\w.\-/]+$/.test(line) || line.includes('pub ') || line.includes('impl ') || line.includes('fn ')) return `<pre><code>${line}</code></pre>`;
      return `<p>${line}</p>`;
    })
    .join('');

  return <article className="prose-lite" dangerouslySetInnerHTML={{ __html: html }} />;
}
