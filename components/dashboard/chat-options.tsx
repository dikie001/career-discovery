"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";

export interface ChatOption {
  id: string;
  label: string;
  description?: string;
}

interface ChatOptionsProps {
  options: ChatOption[];
  onSelect: (optionId: string) => void;
  selected?: string;
  multiple?: boolean;
  isLoading?: boolean;
  themeAccent?: "teal" | "amber" | "sky" | "emerald";
}

export function ChatOptions({
  options,
  onSelect,
  selected,
  multiple = false,
  isLoading = false,
  themeAccent = "teal",
}: ChatOptionsProps) {
  const isSelected = (optionId: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(optionId);
    }
    return selected === optionId;
  };

  const accentStyles = {
    teal: {
      selected: "border-teal-500 bg-teal-500/20 text-teal-300",
      button: "bg-teal-600 hover:bg-teal-700 border-teal-500 hover:border-teal-400",
      checkbox: "bg-teal-500",
      optionSelected: "border-teal-500 bg-teal-500/10",
    },
    amber: {
      selected: "border-amber-500 bg-amber-500/20 text-amber-300",
      button: "bg-amber-600 hover:bg-amber-700 border-amber-500 hover:border-amber-400",
      checkbox: "bg-amber-500",
      optionSelected: "border-amber-500 bg-amber-500/10",
    },
    sky: {
      selected: "border-sky-500 bg-sky-500/20 text-sky-300",
      button: "bg-sky-600 hover:bg-sky-700 border-sky-500 hover:border-sky-400",
      checkbox: "bg-sky-500",
      optionSelected: "border-sky-500 bg-sky-500/10",
    },
    emerald: {
      selected: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
      button: "bg-emerald-600 hover:bg-emerald-700 border-emerald-500 hover:border-emerald-400",
      checkbox: "bg-emerald-500",
      optionSelected: "border-emerald-500 bg-emerald-500/10",
    },
  };

  const currentAccent = accentStyles[themeAccent] || accentStyles.teal;

  // Check if there are any next buttons to layout inline
  const hasNextButton = options.some((opt) => opt.label.toLowerCase().includes("next"));

  return (
    <div className={`mt-3 w-full ${hasNextButton ? "flex flex-wrap gap-2.5" : "space-y-2"}`}>
      {options.map((option) => {
        const isNextButton = option.label.toLowerCase().includes("next");

        if (isNextButton) {
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 font-semibold text-xs shadow-md ${
                isSelected(option.id)
                  ? currentAccent.selected
                  : `${currentAccent.button} text-white active:scale-95`
              } disabled:opacity-50`}
            >
              <span>{option.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          );
        }

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={isLoading}
            className={`w-full text-left p-3.5 rounded-xl border transition-all ${
              isSelected(option.id)
                ? currentAccent.optionSelected
                : "border-slate-800/80 bg-slate-900/30 hover:border-slate-700/60 hover:bg-slate-900/60"
            } disabled:opacity-50`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-slate-100 text-xs">{option.label}</p>
                {option.description && (
                  <p className="text-[10px] text-slate-400 mt-1">{option.description}</p>
                )}
              </div>
              {isSelected(option.id) && (
                <div className={`flex-shrink-0 rounded-full p-0.5 mt-0.5 ${currentAccent.checkbox}`}>
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
