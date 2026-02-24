import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type MarkdownViewerProps = {
  content: string;
};

export const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  return (
    <div className="prose prose-sm max-w-none prose-headings:mb-2 prose-ul:mt-2 prose-ol:mt-2 prose-a:text-primary prose-a:underline-offset-4 prose-a:transition-colors prose-a:duration-300 prose-a:hover:text-primary/70">
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
};
