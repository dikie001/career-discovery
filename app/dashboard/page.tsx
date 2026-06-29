"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { CareerProgressComponent } from "@/components/dashboard/career-progress";
import { AIChat } from "@/components/dashboard/ai-chat";
import { CourseCards } from "@/components/dashboard/course-cards";
import { CareerTools } from "@/components/dashboard/career-tools";
import Image from "next/image";

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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-start justify-between rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-gray-700">
            Ready to build a career that fits you?
          </p>
          {user?.location && (
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-block">📍</span> {user.location}
            </p>
          )}
        </div>
        <div className="hidden h-24 w-24 sm:block">
          <Image
            src="/bot.png"
            alt="Pathfinder"
            width={96}
            height={96}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Career Progress */}
          {progress && <CareerProgressComponent progress={progress} />}

          {/* Recommended Courses */}
          {courses.length > 0 && (
            <CourseCards
              courses={courses.slice(0, 4)}
              onFavorite={(id) => console.log("Favorited:", id)}
            />
          )}

          {/* Career Tools */}
          <CareerTools />
        </div>

        {/* Right Column - Chat */}
        <div className="h-fit sticky top-20 lg:col-span-1">
          <AIChat onSendMessage={sendChatMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-8 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Keep going, {user?.name?.split(" ")[0]}! 🏆</h2>
            <p className="mt-2 opacity-90">
              You&apos;re 40% closer to your career goal.
            </p>
          </div>
          <button className="rounded-lg bg-white px-6 py-2 font-medium text-teal-600 hover:bg-gray-50 transition-colors">
            Continue Roadmap
          </button>
        </div>
      </div>
    </main>
  );
}
