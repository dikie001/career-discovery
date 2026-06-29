"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="font-semibold text-gray-900">Pathfinder</span>
        </div>
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
      </div>

      {/* Hero Section - Mobile Optimized */}
      <div className="px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Discover your
            <span className="block text-teal-600">perfect career</span>
          </h1>
          <p className="mt-3 text-gray-600 text-sm leading-relaxed">
            Pathfinder AI helps you explore careers, find learning paths, and
            achieve your goals with personalized recommendations.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox number="10K+" label="Career Explorers" />
          <StatBox number="500+" label="Courses" />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/auth/signup" className="block">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full h-12">
              Already have an account?
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 px-4 space-y-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900">What You Get</h2>

        <FeatureItem
          icon="🤖"
          title="AI Career Matching"
          description="Get personalized recommendations based on your interests"
        />
        <FeatureItem
          icon="💬"
          title="Chat with Pathfinder"
          description="Get career advice anytime from our AI guide"
        />
        <FeatureItem
          icon="📚"
          title="Smart Learning Paths"
          description="Discover courses tailored to your goals"
        />
        <FeatureItem
          icon="📊"
          title="Track Your Progress"
          description="Monitor your journey with detailed analytics"
        />
      </div>
    </main>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-teal-50 to-blue-50 p-4 border border-teal-100 text-center">
      <div className="font-bold text-lg text-teal-600">{number}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
