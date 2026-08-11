"use client";

import React from "react";
import { MessageSquare, Target, Map, Briefcase } from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const tools: ToolItem[] = [
  {
    id: "discovery",
    title: "AI Discovery",
    description: "Chat & explore",
    icon: MessageSquare,
    href: "#chat",
    color: "text-teal-600 dark:text-teal-400",
  },
  {
    id: "gap",
    title: "Skill Gap",
    description: "Find gaps",
    icon: Target,
    href: "#gap-analysis",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "roadmap",
    title: "Roadmaps",
    description: "Step guides",
    icon: Map,
    href: "#roadmap",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "opportunities",
    title: "Opportunities",
    description: "Jobs & events",
    icon: Briefcase,
    href: "/dashboard/opportunities",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

export function CareerTools() {
  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-xs">
      <h2 className="mb-3 text-sm font-bold text-foreground">Your Tools</h2>

      <div className="grid gap-3 grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <a
              key={tool.id}
              href={tool.href}
              className="rounded-xl border border-border p-3 transition-all hover:shadow-md hover:border-teal-400 bg-muted/30 hover:bg-muted/50 text-center flex flex-col items-center justify-center group"
            >
              <div className={`p-2.5 rounded-xl bg-card border border-border/60 mb-2 ${tool.color} group-hover:scale-105 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-xs">{tool.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{tool.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
