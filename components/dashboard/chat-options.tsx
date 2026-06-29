"use client";

import React from "react";
import { Check } from "lucide-react";

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

  return (
    <div className="space-y-2 w-full mt-4">
      {options.map((option) => (
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
      ))}
    </div>
  );
}
