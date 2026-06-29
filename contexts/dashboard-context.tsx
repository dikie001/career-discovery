"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserProfile, Career, Course, CareerProgress } from "@/lib/types";
import { useAuth } from "./auth-context";

interface DashboardContextType {
  user: User | null;
  profile: UserProfile | null;
  careers: Career[];
  courses: Course[];
  progress: CareerProgress | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  sendChatMessage: (message: string) => Promise<string>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CareerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, careersRes, coursesRes, progressRes] = await Promise.all([
        fetch("/api/user/profile", { headers }),
        fetch("/api/careers", { headers }),
        fetch("/api/courses", { headers }),
        fetch("/api/user/progress", { headers }),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.data);
      }

      if (careersRes.ok) {
        const data = await careersRes.json();
        setCareers(data.data);
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.data);
      }

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!token || !profile) return;
      try {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Update failed";
        setError(message);
      }
    },
    [token, profile]
  );

  const sendChatMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data.data.message;
    },
    [token]
  );

  const value: DashboardContextType = {
    user,
    profile,
    careers,
    courses,
    progress,
    isLoading,
    error,
    loadData,
    updateProfile,
    sendChatMessage,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
