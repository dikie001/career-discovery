"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { CareerProgressComponent } from "@/components/dashboard/career-progress";
import { AIChat } from "@/components/dashboard/ai-chat";
import { CourseCards } from "@/components/dashboard/course-cards";
import { CareerTools } from "@/components/dashboard/career-tools";
import Image from "next/image";
import { Bell } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    profile,
    careers,
    courses,
    progress,
    isLoading,
    loadData,
    sendChatMessage,
  } = useDashboard();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading && !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-teal-600">P</div>
            <span className="font-semibold text-gray-900">Pathfinder</span>
          </div>
          <button className="relative p-2 text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4 py-4 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm text-gray-600">
          Ready to build a career that fits you?
        </p>
        {user?.location && (
          <p className="flex items-center gap-2 text-xs text-gray-600">
            📍 {user.location}
          </p>
        )}
      </div>

      {/* User Profile Quick Card */}
      <div className="mx-4 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-lg font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs opacity-90">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {/* Career Progress */}
        {progress && <CareerProgressComponent progress={progress} />}

        {/* AI Chat Section */}
        <div className="h-64 rounded-lg overflow-hidden">
          <AIChat onSendMessage={sendChatMessage} isLoading={isLoading} />
        </div>

        {/* Career Tools */}
        <CareerTools />

        {/* Recommended Courses */}
        {courses.length > 0 && (
          <CourseCards
            courses={courses.slice(0, 4)}
            onFavorite={(id) => console.log("Favorited:", id)}
          />
        )}

        {/* Bottom CTA */}
        <div className="rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-white">
          <h3 className="font-bold">Keep going, {user?.name?.split(" ")[0]}! 🏆</h3>
          <p className="text-xs mt-1 opacity-90">
            You&apos;re 40% closer to your career goal.
          </p>
          <button className="mt-3 w-full rounded-lg bg-white text-teal-600 py-2 text-sm font-medium hover:bg-gray-100">
            Continue Roadmap
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-2 flex justify-around">
        <NavItem icon="🏠" label="Dashboard" active href="/dashboard" />
        <NavItem icon="💬" label="Chat" href="/dashboard/chat" />
        <NavItem icon="➕" label="Plan" href="/dashboard/plan" />
        <NavItem icon="📋" label="Explore" href="/dashboard/explore" />
        <NavItem icon="👤" label="Profile" href="/dashboard/profile" />
      </nav>
    </main>
  );
}

function NavItem({
  icon,
  label,
  active,
  href,
}: {
  icon: string;
  label: string;
  active?: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${active
          ? "text-teal-600"
          : "text-gray-600 hover:text-gray-900"
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="mt-1">{label}</span>
    </a>
  );
}
