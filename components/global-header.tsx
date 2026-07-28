"use client";

import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/dashboard/header";

export function GlobalHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  // Only show header when user is authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <Header />;
}
