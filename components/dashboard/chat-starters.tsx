"use client";

import React from "react";
import { Sparkles, TrendingUp, Lightbulb, Map, Zap } from "lucide-react";

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
    description: "Get personalized career recommendations",
    icon: <Sparkles className="h-5 w-5" />,
    prompt:
      "Based on my profile, what are the top career paths that would be a great match for me? Please provide specific recommendations with why each one fits my skills and interests.",
  },
  {
    id: "skill_gaps",
    label: "Skill Gaps",
    description: "Identify what skills you need to develop",
    icon: <Zap className="h-5 w-5" />,
    prompt:
      "Can you analyze the skills I need for my target role? What are the gaps between my current skills and what's required? What should I prioritize learning?",
  },
  {
    id: "learning_path",
    label: "Learning Path",
    description: "Get a structured learning roadmap",
    icon: <Map className="h-5 w-5" />,
    prompt:
      "Create a personalized learning roadmap for me. What courses, projects, and milestones should I focus on to reach my career goals? Give me a realistic timeline.",
  },
  {
    id: "salary_trends",
    label: "Salary & Trends",
    description: "Learn about compensation and market trends",
    icon: <TrendingUp className="h-5 w-5" />,
    prompt:
      "What are the current salary ranges and job market trends in the careers I'm interested in? What's the growth potential and how does it compare to other fields?",
  },
  {
    id: "ask_question",
    label: "Ask Anything",
    description: "Get answers to your career questions",
    icon: <Lightbulb className="h-5 w-5" />,
    prompt:
      "I have a question about my career development. Can you help me understand what I need to know to make the right decision?",
  },
];

export function ChatStarters({ onSelect, isLoading = false }: ChatStartersProps) {
  return (
    <div className="w-full space-y-3">
      <p className="text-sm font-medium text-slate-400 px-1">Quick Start</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STARTER_PROMPTS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => onSelect(starter.prompt)}
            disabled={isLoading}
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 p-3 text-left transition-all duration-200 hover:border-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="text-teal-400 group-hover:text-teal-300 transition-colors">
                  {starter.icon}
                </div>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  {starter.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                {starter.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
