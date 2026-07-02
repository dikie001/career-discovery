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
}

export function ChatOptions({
  options,
  onSelect,
  selected,
  multiple = false,
  isLoading = false,
}: ChatOptionsProps) {
  const isSelected = (optionId: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(optionId);
    }
    return selected === optionId;
  };

  // Check if there are any next buttons to layout inline
  const hasNextButton = options.some((opt) => opt.label.toLowerCase().includes("next"));

  return (
    <div className={`mt-4 w-full ${hasNextButton ? "flex flex-wrap gap-3" : "space-y-2"}`}>
      {options.map((option) => {
        const isNextButton = option.label.toLowerCase().includes("next");

        if (isNextButton) {
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 font-semibold text-sm shadow-lg ${
                isSelected(option.id)
                  ? "border-teal-500 bg-teal-500/20 text-teal-300"
                  : "border-teal-600 bg-teal-600 hover:bg-teal-700 text-white border-teal-500 hover:border-teal-400 active:scale-95"
              } disabled:opacity-50`}
            >
              <span>{option.label}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          );
        }

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={isLoading}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              isSelected(option.id)
                ? "border-teal-500 bg-teal-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
            } disabled:opacity-50`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-slate-400 mt-1">{option.description}</p>
                )}
              </div>
              {isSelected(option.id) && (
                <div className="flex-shrink-0 rounded-full bg-teal-500 p-1 mt-0.5">
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
