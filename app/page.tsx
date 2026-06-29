"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Zap, MessageCircle, TrendingUp, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-400 border-t-teal-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="font-semibold text-slate-50">Pathfinder</span>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-slate-50 hover:bg-slate-800">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50">
            Discover your
            <span className="block text-teal-400">perfect career</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Pathfinder AI helps you explore careers, find personalized learning paths, and achieve your professional goals.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link href="/auth/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white h-11 px-6 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-11 px-6">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8">
          <StatCard number="10K+" label="Career Explorers" />
          <StatCard number="500+" label="Courses" />
          <StatCard number="50+" label="Career Paths" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-slate-50 text-center mb-12">What You Get</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Zap}
            title="AI Career Matching"
            description="Get personalized career recommendations based on your skills and interests"
          />
          <FeatureCard
            icon={MessageCircle}
            title="Chat with Pathfinder"
            description="Get career advice anytime from our intelligent AI guide"
          />
          <FeatureCard
            icon={BookOpen}
            title="Smart Learning Paths"
            description="Discover courses tailored specifically to your career goals"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Track Your Progress"
            description="Monitor your journey with detailed progress analytics"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Ready to find your perfect career?</h2>
          <p className="text-lg text-teal-100">Join thousands of career explorers using Pathfinder</p>
          <Link href="/auth/signup">
            <Button className="bg-white text-teal-600 hover:bg-slate-100 h-11 px-8 font-semibold">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
          <p>&copy; 2024 Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
      <div className="font-bold text-2xl text-teal-400">{number}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-teal-600/50 transition-colors">
      <Icon className="h-8 w-8 text-teal-400" />
      <h3 className="font-semibold text-slate-50">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  )
}
