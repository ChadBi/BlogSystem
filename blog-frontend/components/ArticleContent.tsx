import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { ArticleReader, CopyCodeButton } from '@/components/ArticleReader';
import 'highlight.js/styles/github-dark.css';

export function ArticleContent({ content }: { content: string }) {
  return (
    <ArticleReader>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => (
            <div className="group relative">
              <pre>{children}</pre>
              <CopyCodeButton />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </ArticleReader>
  );
}
