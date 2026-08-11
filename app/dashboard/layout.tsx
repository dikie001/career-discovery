"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "@/components/dashboard/BottomNav";
import SplashScreen from "@/components/ui/splash-screen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <SplashScreen message="Preparing your career dashboard..." />;
  }

  return (
    <DashboardProvider>
      <div className="relative min-h-screen bg-background">
        {/* Main Content Area: Padding bottom ensures the nav doesn't cover content */}
        <div className={pathname?.startsWith("/dashboard/ai-chat") ? "pb-0" : "pb-24"}>
          {children}
        </div>

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </DashboardProvider>
  );
}