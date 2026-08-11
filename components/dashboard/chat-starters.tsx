"use client";

import React from "react";
import { Sparkles, Zap, Map } from "lucide-react";

interface ChatStarterButton {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

interface ChatStartersProps {
  onSelect: (prompt: string) => void;
  isLoading?: boolean;
}

const STARTER_PROMPTS: ChatStarterButton[] = [
  {
    id: "career_match",
    label: "Career Matches",
    description: "Personalized career recommendation matches",
    icon: <Sparkles className="h-4 w-4" />,
    prompt:
      "Based on my profile, what are the top career paths that would be a great match for me? Please provide specific recommendations with why each one fits my skills and interests.",
  },
  {
    id: "skill_gaps",
    label: "Skill Gaps",
    description: "Identify key skills you need to build next",
    icon: <Zap className="h-4 w-4" />,
    prompt:
      "Can you analyze the skills I need for my target role? What are the gaps between my current skills and what's required? What should I prioritize learning?",
  },
  {
    id: "learning_path",
    label: "Learning Path",
    description: "Get a structured course & project roadmap",
    icon: <Map className="h-4 w-4" />,
    prompt:
      "Create a personalized learning roadmap for me. What courses, projects, and milestones should I focus on to reach my career goals? Give me a realistic timeline.",
  },
];

export function ChatStarters({ onSelect, isLoading = false }: ChatStartersProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 mt-4 px-2 sm:px-4 text-center">
      <div className="flex flex-col gap-2.5 justify-center items-stretch">
        {STARTER_PROMPTS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => onSelect(starter.prompt)}
            disabled={isLoading}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 p-3 sm:p-4 text-left transition-all duration-200 hover:border-teal-500 shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3.5"
          >
            <div className="relative text-teal-600 dark:text-teal-400 p-2.5 rounded-xl bg-teal-500/15 dark:bg-teal-500/20 shrink-0">
              {starter.icon}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="block text-sm font-black text-slate-900 dark:text-white transition-colors">
                {starter.label}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {starter.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
