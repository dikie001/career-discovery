"use client";

import React from "react";

interface SplashScreenProps {
  message?: string;
}

export function SplashScreen({ message = "Loading Pathfinder..." }: SplashScreenProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F3F9FA] dark:bg-slate-950 transition-colors duration-300 p-6 z-50">
      <div className="flex flex-col items-center max-w-xs text-center animate-fadeIn">
        {/* Logo Container with Smooth Pulse */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 dark:from-teal-500/10 dark:to-emerald-500/10 blur-xl animate-pulse" />
          <div className="relative h-24 w-24 rounded-[26px] bg-white p-2 shadow-xl shadow-teal-900/10 dark:bg-slate-900 dark:border dark:border-slate-800 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Pathfinder Logo" 
              className="h-full w-full object-contain rounded-2xl animate-pulse" 
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-2xl font-black tracking-widest text-[#0D1C2E] dark:text-white uppercase mb-1.5">
          PATHFINDER
        </h1>
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase mb-8">
          DISCOVER . LEARN . GROW . SUCCEED
        </p>

        {/* Sleek Native-Style Indeterminate Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 rounded-full w-24 animate-[pulse_1.5s_ease-in-out_infinite] shadow-xs" />
        </div>

        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
