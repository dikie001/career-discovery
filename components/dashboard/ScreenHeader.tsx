"use client";

import React from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
}

export function ScreenHeader({
  title = "Pathfinder",
  subtitle = "Discover. Plan. Succeed.",
  showNotifications = true,
}: ScreenHeaderProps) {
  const { user } = useAuth();

  const initials = React.useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }, [user?.name]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-lg shadow-black/10 dark:shadow-black/50">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-3 md:max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-500/30 to-cyan-500/20 text-lg font-black text-teal-300 shadow-lg shadow-teal-500/20">
            P
          </div>
          <div>
            <h1 className="text-sm font-black leading-tight text-foreground">{title}</h1>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showNotifications && (
            <button
              type="button"
              className="relative rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
            </button>
          )}
          <Link
            href="/dashboard/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-500/40 bg-gradient-to-br from-teal-600 to-cyan-600 text-xs font-bold text-white shadow-lg shadow-teal-500/20"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
