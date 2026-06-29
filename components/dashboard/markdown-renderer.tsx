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
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-4 mt-6 text-2xl font-bold text-white" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-3 mt-5 text-xl font-bold text-white" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="mb-2 mt-4 text-lg font-semibold text-slate-100"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed text-slate-200" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="mb-3 ml-4 space-y-2 text-slate-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-3 ml-4 space-y-2 text-slate-200" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="list-disc pl-2" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-300" {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            return inline ? (
              <code
                className="rounded bg-slate-800 px-2 py-1 font-mono text-sm text-teal-300"
                {...props}
              />
            ) : (
              <code
                className="block overflow-x-auto rounded-lg bg-slate-800 p-4 font-mono text-sm text-teal-300"
                {...props}
              />
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500 pl-4 italic text-slate-300"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <table
              className="mb-3 w-full border-collapse border border-slate-700"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-slate-700 bg-slate-800 px-3 py-2 text-left font-semibold text-white"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-slate-700 px-3 py-2 text-slate-200"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-teal-400 hover:text-teal-300 hover:underline"
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
