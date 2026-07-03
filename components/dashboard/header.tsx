"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-slate-950/50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="font-bold text-slate-100 text-lg group-hover:text-white transition-colors">Pathfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-1 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/dashboard/explore">Explore</NavLink>
            <NavLink href="/dashboard/progress">Progress</NavLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-400">
                  {user?.location || "Nairobi, Kenya"}
                </p>
              </div>
            </div>

            <button className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all">
              <Settings className="h-5 w-5" />
            </button>

            <Button
              onClick={handleLogout}
              className="hidden gap-2 sm:flex bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 space-y-2 border-t border-slate-800/50 pt-3 md:hidden">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/dashboard/explore">Explore</MobileNavLink>
            <MobileNavLink href="/dashboard/progress">Progress</MobileNavLink>
            <Button
              onClick={handleLogout}
              className="w-full justify-start bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50"
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
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all"
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
      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all"
    >
      {children}
    </Link>
  );
}
