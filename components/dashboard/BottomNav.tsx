"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, User, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Discover", href: "/dashboard/discover", icon: Compass },
    { name: "Roadmaps", href: "/dashboard/roadmaps", icon: Map },
    { name: "Stats", href: "/dashboard/stats", icon: BarChart2 },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  if (pathname?.startsWith("/dashboard/ai-chat")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-border/50 bg-background/80 px-2 pb-safe pt-2 backdrop-blur-xl">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 p-2"
          >
            <div
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300",
                isActive ? "bg-teal-500/20 text-teal-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-teal-500 font-bold" : "text-muted-foreground"
              )}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}