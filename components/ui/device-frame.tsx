"use client";

import React, { useState, useEffect } from "react";
import { useDeviceMode } from "@/contexts/device-mode-context";
import { Wifi, Battery } from "lucide-react";

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { viewMode, isRealMobile } = useDeviceMode();
  const [time, setTime] = useState<string>("9:41");

  // Update real-time smartphone clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // If in standard web mode or on an actual physical mobile device, render natively
  if (viewMode === "web" || isRealMobile) {
    return <div className="w-full min-h-screen relative">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950/95 dark:bg-black flex flex-col items-center justify-center p-4 sm:py-8 transition-all duration-500 overflow-y-auto relative z-0">
      {/* Background radial studio ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-[90px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* iPhone Pro Max-Style Device Chassis */}
      <div className="relative w-[415px] max-w-[95vw] h-[870px] max-h-[94vh] shrink-0 rounded-[54px] border-[11px] border-slate-900 bg-black shadow-2xl shadow-indigo-500/25 ring-1 ring-white/15 flex flex-col overflow-hidden transform scale-100 transition-transform duration-300">
        
        {/* Hardware side buttons decoration */}
        <div className="absolute -left-[13px] top-[115px] w-[3px] h-[26px] bg-slate-800 rounded-l-md pointer-events-none" /> {/* Mute switch */}
        <div className="absolute -left-[13px] top-[165px] w-[3px] h-[48px] bg-slate-800 rounded-l-md pointer-events-none" /> {/* Vol + */}
        <div className="absolute -left-[13px] top-[225px] w-[3px] h-[48px] bg-slate-800 rounded-l-md pointer-events-none" /> {/* Vol - */}
        <div className="absolute -right-[13px] top-[185px] w-[3px] h-[65px] bg-slate-800 rounded-r-md pointer-events-none" /> {/* Power button */}

        {/* Top iOS Status Bar */}
        <div className="w-full h-[46px] bg-background text-foreground shrink-0 px-7 pt-2.5 flex items-center justify-between text-xs font-semibold select-none z-50 relative border-b border-border/10">
          {/* Clock */}
          <div className="w-16 font-extrabold text-xs tracking-tight">{time}</div>

          {/* Dynamic Island Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-[24px] w-[122px] bg-black rounded-full flex items-center justify-end px-2.5 shadow-md z-50 pointer-events-none border border-white/5">
            {/* Camera indicator */}
            <div className="h-3 w-3 rounded-full bg-[#111] border border-white/10 mr-1.5 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-blue-900/80" />
            </div>
          </div>

          {/* Right Status Icons */}
          <div className="flex items-center gap-1.5 w-16 justify-end">
            <span className="text-[10px] font-extrabold tracking-tighter">5G</span>
            <Wifi className="h-3.5 w-3.5 stroke-[2.5]" />
            <Battery className="h-4 w-4 stroke-[2.5] fill-current text-emerald-500" />
          </div>
        </div>

        {/* Scrollable Viewport Content Area */}
        <div className="flex-1 w-full bg-background overflow-y-auto overflow-x-hidden relative flex flex-col pb-8">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full h-[22px] bg-background shrink-0 absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none border-t border-border/5">
          <div className="w-32 h-[4px] bg-foreground/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
