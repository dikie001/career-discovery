"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ViewMode = "web" | "mobile";

interface DeviceModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isRealMobile: boolean;
}

const DeviceModeContext = createContext<DeviceModeContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "pathfinder_device_view_mode";

export function DeviceModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewMode, setViewModeState] = useState<ViewMode>("web");
  const [isRealMobile, setIsRealMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if on a physical small screen
    const handleResize = () => {
      setIsRealMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Retrieve saved view mode preference
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as ViewMode;
    if (saved === "mobile" || saved === "web") {
      setViewModeState(saved);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (mounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, mode);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "web" ? "mobile" : "web");
  };

  return (
    <DeviceModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        isRealMobile,
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
}

export function useDeviceMode() {
  const context = useContext(DeviceModeContext);
  if (!context) {
    throw new Error("useDeviceMode must be used within a DeviceModeProvider");
  }
  return context;
}
