"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { KenyaFlag } from "@/components/ui/kenya-flag";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-lg shadow-black/10 dark:shadow-black/50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-md shadow-teal-500/10 group-hover:shadow-teal-500/25 transition-all overflow-hidden">
              <img src="/logo.png" alt="Pathfinder Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            <span className="font-bold text-foreground text-lg group-hover:text-teal-600 dark:group-hover:text-white transition-colors">Pathfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-1 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/dashboard/discover">Explore</NavLink>
            <NavLink href="/dashboard/roadmaps">Roadmaps</NavLink>
            <NavLink href="/dashboard/reports">Reports</NavLink>
            {user?.role === "ADMIN" && (
              <NavLink href="/admin/reports">Admin</NavLink>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2.5 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
            </button>

            <ThemeToggle />

            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span>{(user?.location || "Nairobi, Kenya").replace(/🇰🇪|KE/g, "").trim()}</span>
                  {((user?.location || "Nairobi, Kenya").toLowerCase().includes("kenya")) && (
                    <KenyaFlag className="w-4 h-2.5 rounded-[1px] shadow-xs" />
                  )}
                </p>
              </div>
            </div>

            <button className="p-2.5 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded-lg transition-all">
              <Settings className="h-5 w-5" />
            </button>

            <Button
              onClick={handleLogout}
              className="hidden gap-2 sm:flex bg-muted/50 hover:bg-muted text-card-foreground border border-border/50 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-card-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 space-y-2 border-t border-border/50 pt-3 md:hidden">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/dashboard/discover">Explore</MobileNavLink>
            <MobileNavLink href="/dashboard/roadmaps">Roadmaps</MobileNavLink>
            <MobileNavLink href="/dashboard/reports">Reports</MobileNavLink>
            {user?.role === "ADMIN" && (
              <MobileNavLink href="/admin/reports">Admin</MobileNavLink>
            )}
            <Button
              onClick={handleLogout}
              className="w-full justify-start bg-muted/50 hover:bg-muted text-card-foreground border border-border/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
    >
      {children}
    </Link>
  );
}
