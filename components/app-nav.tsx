"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

export function AppNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show nav on dashboard pages - they have their own header
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  // Only show header when user is authenticated on non-dashboard pages
  if (isLoading || !isAuthenticated) {
    // Show minimal nav on auth pages with theme toggle
    return (
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-lg shadow-black/10 dark:shadow-black/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-md shadow-teal-500/10 group-hover:shadow-teal-500/25 transition-all overflow-hidden">
                <img src="/logo.png" alt="Pathfinder Logo" className="h-full w-full object-contain rounded-lg" />
              </div>
              <span className="font-bold text-foreground text-lg group-hover:text-teal-600 dark:group-hover:text-white transition-colors">Pathfinder</span>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return null;
}
