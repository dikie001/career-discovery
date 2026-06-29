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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="font-semibold text-gray-900">Pathfinder</span>
            </Link>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Discover.
              <span className="block text-teal-600">Plan.</span>
              <span className="block text-blue-600">Succeed.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Pathfinder uses AI to help you discover the perfect career path,
              get personalized learning recommendations, and achieve your goals.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup" className="flex-shrink-0">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features" className="flex-shrink-0">
                <Button
                  variant="outline"
                  className="w-full px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              ✨ AI-powered • 💼 Career guidance • 📚 Course recommendations
            </p>
          </div>

          {/* Right - Feature Cards */}
          <div className="grid gap-4">
            <FeatureCard
              title="AI Career Matching"
              description="Get personalized career recommendations based on your skills and interests"
              icon="🤖"
            />
            <FeatureCard
              title="Smart Learning Path"
              description="Discover courses tailored to your career goals"
              icon="📚"
            />
            <FeatureCard
              title="Progress Tracking"
              description="Monitor your journey with detailed progress analytics"
              icon="📊"
            />
            <FeatureCard
              title="Expert Guidance"
              description="Chat with Pathfinder AI anytime for career advice"
              icon="💬"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools to guide your career journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureHighlight
              title="Dynamic Recommendations"
              description="Our AI learns from your profile to provide increasingly accurate recommendations."
            />
            <FeatureHighlight
              title="Skill Gap Analysis"
              description="Identify the skills you need and get a roadmap to acquire them."
            />
            <FeatureHighlight
              title="Community & Resources"
              description="Access curated courses and connect with other career explorers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to find your perfect career?
          </h2>
          <p className="mt-4 text-lg text-teal-100">
            Join thousands of career explorers using Pathfinder
          </p>
          <Link href="/auth/signup" className="inline-block mt-8">
            <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-gray-600">
            © 2024 Pathfinder. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FeatureHighlight({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-teal-50 to-blue-50 p-8 border border-teal-100">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600">{description}</p>
    </div>
  );
}
