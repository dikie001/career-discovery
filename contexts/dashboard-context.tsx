"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserProfile, Career, Course, CareerProgress } from "@/lib/types";
import { useAuth } from "./auth-context";

interface UserConsent {
  id: string;
  userId: string;
  useProfileDataForAI: boolean;
  consentedAt: string | null;
  updatedAt: string;
}

interface DashboardContextType {
  user: User | null;
  profile: UserProfile | null;
  careers: Career[];
  courses: Course[];
  progress: CareerProgress | null;
  consent: UserConsent | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  sendChatMessage: (message: string, personality?: string) => Promise<string>;
  updateConsent: (useProfileDataForAI: boolean) => Promise<void>;
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
  const [consent, setConsent] = useState<UserConsent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, careersRes, coursesRes, progressRes, consentRes] = await Promise.all([
        fetch("/api/user/profile", { headers }),
        fetch("/api/recommendations", { headers }),
        fetch("/api/courses", { headers }),
        fetch("/api/user/progress", { headers }),
        fetch("/api/user/consent", { headers }),
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

      if (consentRes.ok) {
        const data = await consentRes.json();
        setConsent(data.data);
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

  const updateConsent = useCallback(
    async (useProfileDataForAI: boolean) => {
      if (!token) return;
      try {
        const response = await fetch("/api/user/consent", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ useProfileDataForAI }),
        });

        if (response.ok) {
          const data = await response.json();
          setConsent(data.data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update consent";
        setError(message);
      }
    },
    [token]
  );

  const sendChatMessage = useCallback(
    async (message: string, personality?: string): Promise<string> => {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, personality }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message (${response.status})`);
      }

      const data = await response.json();
      const responseText = data.data?.message || "Sorry, I couldn't generate a response. Please try again.";

      // Return the full response including any structured data for options
      return responseText;
    },
    [token]
  );

  const value: DashboardContextType = {
    user,
    profile,
    careers,
    courses,
    progress,
    consent,
    isLoading,
    error,
    loadData,
    updateProfile,
    sendChatMessage,
    updateConsent,
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
