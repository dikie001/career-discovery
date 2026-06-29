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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="font-semibold text-gray-900">Pathfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-1 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/dashboard/explore">Explore</NavLink>
            <NavLink href="/dashboard/progress">Progress</NavLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">
                  {user?.location || "Nairobi, Kenya"}
                </p>
              </div>
            </div>

            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="hidden gap-2 sm:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 md:hidden">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/dashboard/explore">Explore</MobileNavLink>
            <MobileNavLink href="/dashboard/progress">Progress</MobileNavLink>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start"
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
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
