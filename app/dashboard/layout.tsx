"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardProvider>
      <div className="relative min-h-screen bg-background">
        {/* Main Content Area: Padding bottom ensures the nav doesn't cover content */}
        <div className="pb-24 sm:pb-8">
          {children}
        </div>

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </DashboardProvider>
  );
}