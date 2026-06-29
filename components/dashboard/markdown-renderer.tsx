"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content text-slate-100 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-3 mt-4 text-lg font-bold text-white" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-2 mt-3 text-base font-bold text-white" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="mb-2 mt-2 text-sm font-semibold text-slate-100"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed text-slate-100" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="mb-2 ml-4 space-y-1 text-slate-100" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-2 ml-4 space-y-1 text-slate-100" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="list-disc pl-2 text-slate-100" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-200" {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            return inline ? (
              <code
                className="rounded bg-slate-700/50 px-1.5 py-0.5 font-mono text-xs text-teal-300"
                {...props}
              />
            ) : (
              <code
                className="block overflow-x-auto rounded bg-slate-700/50 p-2 font-mono text-xs text-teal-300 my-2"
                {...props}
              />
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500 pl-3 italic text-slate-300 my-2"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <table
              className="mb-2 w-full border-collapse border border-slate-700 text-sm"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-slate-700 bg-slate-700/50 px-2 py-1 text-left font-semibold text-white"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-slate-700 px-2 py-1 text-slate-100"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-teal-400 hover:text-teal-300 hover:underline break-words"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
