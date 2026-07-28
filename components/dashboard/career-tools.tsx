"use client";

import React from "react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

const tools: ToolItem[] = [
  {
    id: "discovery",
    title: "AI Discovery",
    description: "Chat & explore",
    icon: "💬",
    href: "#chat",
  },
  {
    id: "gap",
    title: "Skill Gap",
    description: "Find gaps",
    icon: "⚡",
    href: "#gap-analysis",
  },
  {
    id: "roadmap",
    title: "Roadmaps",
    description: "Step guides",
    icon: "🗺️",
    href: "#roadmap",
  },
  {
    id: "courses",
    title: "Courses",
    description: "Find paths",
    icon: "📚",
    href: "#courses",
  },
];

export function CareerTools() {
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">Your Tools</h2>

      <div className="grid gap-3 grid-cols-2">
        {tools.map((tool) => (
          <a
            key={tool.id}
            href={tool.href}
            className="rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md hover:border-teal-300 text-center"
          >
            <div className="text-2xl mb-1">{tool.icon}</div>
            <h3 className="font-medium text-gray-900 text-xs">{tool.title}</h3>
            <p className="text-xs text-gray-600">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
