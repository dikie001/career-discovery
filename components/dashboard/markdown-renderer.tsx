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
    <div className={`markdown-content text-slate-200 leading-relaxed text-xs space-y-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-4 mt-5 text-base font-extrabold text-slate-100 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-3 mt-4 text-sm font-bold text-slate-100" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="mb-2 mt-3 text-xs font-semibold text-slate-200"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2.5 leading-relaxed text-slate-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="mb-3 ml-5 space-y-1.5 text-slate-350 list-disc" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-3 ml-5 space-y-1.5 text-slate-350 list-decimal" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1 text-slate-300 leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-50" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-300" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-teal-300 border border-slate-700/50"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="block overflow-x-auto rounded-xl bg-slate-900/60 p-3 font-mono text-[10px] text-teal-300 my-2.5 border border-slate-800/80"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-3 border-teal-500/80 pl-3 italic text-slate-400 my-3 bg-slate-900/10 py-1 rounded-r-lg"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-800 bg-slate-900/10">
              <table
                className="w-full border-collapse text-left text-xs"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border-b border-slate-800 bg-slate-900/40 px-3.5 py-2.5 font-bold text-slate-200"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border-b border-slate-850 px-3.5 py-2.5 text-slate-350"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-teal-400 hover:text-teal-300 hover:underline break-words font-semibold"
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
