"use client";

import React from "react";
import { MessageCircle, Zap, Map, BookOpen } from "lucide-react";
import Link from "next/link";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const tools: ToolItem[] = [
  {
    id: "discovery",
    title: "AI Discovery",
    description: "Chat & explore careers",
    icon: <MessageCircle className="h-6 w-6" />,
    href: "#chat",
    color: "bg-teal-100",
  },
  {
    id: "gap",
    title: "Skill Gap Analysis",
    description: "Find & fix skill gaps",
    icon: <Zap className="h-6 w-6" />,
    href: "#gap-analysis",
    color: "bg-teal-100",
  },
  {
    id: "roadmap",
    title: "Career Roadmaps",
    description: "Step-by-step guides",
    icon: <Map className="h-6 w-6" />,
    href: "#roadmap",
    color: "bg-teal-100",
  },
  {
    id: "courses",
    title: "Courses & Scholarships",
    description: "Find opportunities",
    icon: <BookOpen className="h-6 w-6" />,
    href: "#courses",
    color: "bg-teal-100",
  },
];

export function CareerTools() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Your Tools</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md hover:border-teal-300"
          >
            <div
              className={`mb-3 inline-flex rounded-lg ${tool.color} p-3 text-teal-600`}
            >
              {tool.icon}
            </div>
            <h3 className="font-medium text-gray-900">{tool.title}</h3>
            <p className="text-xs text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
