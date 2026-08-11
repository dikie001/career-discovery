"use client";

import React, { useState } from "react";
import { useDeviceMode } from "@/contexts/device-mode-context";
import { Monitor, Smartphone, EyeOff } from "lucide-react";

export function ViewSwitcher() {
  const { viewMode, setViewMode, isRealMobile } = useDeviceMode();
  const [isHidden, setIsHidden] = useState(false);

  // Hide switcher on small screens where native mobile screen applies, or if user explicitly hid it
  if (isRealMobile || isHidden) return null;

  const toggleMode = () => {
    setViewMode(viewMode === "web" ? "mobile" : "web");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[99999] flex items-center gap-1.5 group opacity-30 hover:opacity-100 transition-all duration-300">
      {/* Tiny mode toggle button */}
      <button
        type="button"
        onClick={toggleMode}
        title={viewMode === "web" ? "Switch to Larger Phone App View" : "Switch to Full Web View"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 border border-white/20 text-slate-200 shadow-lg backdrop-blur-md hover:bg-slate-800 hover:text-white hover:scale-110 transition-all duration-200"
      >
        {viewMode === "web" ? (
          <Smartphone className="h-4 w-4 text-indigo-400" />
        ) : (
          <Monitor className="h-4 w-4 text-teal-400" />
        )}
      </button>

      {/* Optional hide option revealed on hover */}
      <button
        type="button"
        onClick={() => setIsHidden(true)}
        title="Hide mode switcher for this session"
        className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all duration-200 text-xs"
      >
        <EyeOff className="h-3 w-3" />
      </button>
    </div>
  );
}
