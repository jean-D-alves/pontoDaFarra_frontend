import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mb-4 mt-8 text-2xl font-bold text-stone-strong first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="mb-3 mt-8 text-xl font-bold text-stone-strong first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 mt-6 text-lg font-semibold text-stone-strong first:mt-0">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mb-2 mt-6 text-base font-semibold text-stone-strong first:mt-0">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-[16px] leading-relaxed text-body last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-6 text-[16px] leading-relaxed text-body">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-[16px] leading-relaxed text-body">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-stone-strong">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-brand-deep underline decoration-brand-deep/40 underline-offset-2 transition hover:text-stone-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-brand pl-4 text-[16px] italic text-stone">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-stone-strong">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-surface p-4 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-line" />,
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-line bg-surface px-3 py-2 font-semibold text-stone-strong">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-line px-3 py-2 text-body">{children}</td>
  ),
};

export default function LegalMarkdown({ content }: { content: string }) {
  return (
    <div className="break-words">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
