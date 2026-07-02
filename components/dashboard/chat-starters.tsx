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
    <div className="w-full max-w-2xl mx-auto space-y-2 mt-4 text-center">
      {/* <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3">Suggested Topics</p> */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-stretch">
        {STARTER_PROMPTS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => onSelect(starter.prompt)}
            disabled={isLoading}
            className="flex-1 group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/60 p-3 text-left transition-all duration-200 hover:border-teal-500/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-2.5"
          >
            <div className="relative text-teal-400 group-hover:text-teal-300 transition-colors p-1.5 rounded-lg bg-teal-500/10 flex-shrink-0">
              {starter.icon}
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="block text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                {starter.label}
              </span>
              <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-1 leading-normal">
                {starter.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
