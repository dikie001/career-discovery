"use client";

import React from "react";
import { Check } from "lucide-react";

export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectionCardsProps {
  options: SelectionOption[];
  onSelect: (optionId: string) => void;
  selected?: string | string[];
  multiple?: boolean;
  isLoading?: boolean;
  title?: string;
}

export function SelectionCards({
  options,
  onSelect,
  selected,
  multiple = false,
  isLoading = false,
  title,
}: SelectionCardsProps) {
  const selectedIds = Array.isArray(selected)
    ? selected
    : selected
      ? [selected]
      : [];

  const isSelected = (optionId: string) => selectedIds.includes(optionId);

  const handleClick = (optionId: string) => {
    if (multiple) {
      if (isSelected(optionId)) {
        onSelect(optionId); // Toggle off
      } else {
        onSelect(optionId); // Toggle on
      }
    } else {
      onSelect(optionId);
    }
  };

  return (
    <div className="w-full space-y-3">
      {title && <p className="text-sm font-medium text-muted-foreground">{title}</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isSelectedItem = isSelected(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleClick(option.id)}
              disabled={isLoading}
              className={`group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                isSelectedItem
                  ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20"
                  : "border-border bg-muted/50 hover:border-input hover:bg-muted"
              } disabled:opacity-50`}
            >
              {/* Animated background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/0 transition-all duration-300 ${
                  isSelectedItem
                    ? "from-teal-500/10 to-transparent"
                    : "group-hover:from-teal-500/5 group-hover:to-transparent"
                }`}
              />

              {/* Content */}
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className="text-lg">{option.icon}</span>
                    )}
                    <p className="font-semibold text-white">{option.label}</p>
                  </div>
                  {option.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>

                {/* Checkmark indicator */}
                {isSelectedItem && (
                  <div className="ml-2 flex-shrink-0 rounded-full bg-teal-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
