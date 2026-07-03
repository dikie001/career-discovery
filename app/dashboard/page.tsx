"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useDashboard } from "@/contexts/dashboard-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Bell,
  Send,
  Home,
  MessageSquare,
  Plus,
  BookOpen,
  User,
  Zap,
  Map,
  Heart,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  Compass,
  BarChart2,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { CareerProgressComponent } from "@/components/dashboard/career-progress"

export default function DashboardPage() {
  const { user, token } = useAuth()
  const {
    profile,
    careers,
    courses,
    progress,
    isLoading,
    loadData,
    sendChatMessage,
  } = useDashboard()
  const [messages, setMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([
    {
      id: "1",
      role: "assistant",
      content: "Hey! 👋 What would you like to explore today?",
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [recommendations, setRecommendations] = useState<
    Array<{
      id: string
      title: string
      description: string
      category: string
      matchPercentage: number
      salaryRange: string
      reason: string
      createdAt: string
    }>
  >([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [savedRecs, setSavedRecs] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handleProgressUpdate = () => {
      loadData()
    }

    window.addEventListener("pathfinder:progress-updated", handleProgressUpdate)

    return () => {
      window.removeEventListener(
        "pathfinder:progress-updated",
        handleProgressUpdate
      )
    }
  }, [loadData])

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return

      setRecommendationsLoading(true)
      try {
        const response = await fetch("/api/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setRecommendations(data.data || [])
      } catch (error) {
        console.error("Failed to load recommendations", error)
      } finally {
        setRecommendationsLoading(false)
      }
    }

    fetchRecommendations()

    const handleRefresh = () => {
      fetchRecommendations()
    }

    window.addEventListener("pathfinder:recommendations-updated", handleRefresh)
    window.addEventListener("storage", (event) => {
      if (event.key === "pathfinder:recommendations-updated") {
        handleRefresh()
      }
    })

    return () => {
      window.removeEventListener(
        "pathfinder:recommendations-updated",
        handleRefresh
      )
    }
  }, [token])

  // Load saved recommendation ids from localStorage for quick client-side favorites
  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(`pathfinder:saved-recommendations:${user.id}`)
      if (raw) setSavedRecs(JSON.parse(raw))
    } catch (e) {
      console.warn("Failed to load saved recommendations", e)
    }
  }, [user?.id])

  const toggleSaveRecommendation = (id: string) => {
    setSavedRecs((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((x) => x !== id) : [id, ...prev]
      if (user?.id) {
        try {
          localStorage.setItem(`pathfinder:saved-recommendations:${user.id}`, JSON.stringify(next))
        } catch (e) {
          console.warn("Failed to persist saved recommendations", e)
        }
      }
      return next
    })
  }

  const recommendationCards = useMemo(() => {
    if (recommendations.length > 0) {
      return recommendations.map((item, index) => ({
        id: item.id,
        title: item.title,
        description: item.description || "Recommended by Pathfinder AI.",
        salary: item.salaryRange || "",
        matchPercentage: item.matchPercentage || Math.max(78, 90 - index),
        badge:
          index === 0
            ? "Top Match"
            : index === 1
              ? "Fresh insight"
              : "Saved suggestion",
        badgeColor:
          index === 0
            ? "bg-teal-50 text-teal-700"
            : index === 1
              ? "bg-indigo-50 text-indigo-700"
              : "bg-amber-50 text-amber-700",
        accentColor: index === 0 ? "teal" : index === 1 ? "indigo" : "amber",
        reason: item.reason || item.description,
        category: item.category || "Career",
        isSaved: savedRecs.includes(item.id),
      }))
    }

    return []
  }, [recommendations, savedRecs])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const userMsg = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      const response = await sendChatMessage(input)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
        },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (isLoading && !progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-fadeInUp text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-teal-600/30"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-teal-600 border-r-teal-600"></div>
          </div>
          <p className="text-slate-650 font-bold">
            Loading your career journey...
          </p>
          <p className="text-slate-450 mt-2 text-xs">
            Preparing personalized insights
          </p>
        </div>
      </div>
    )
  }

  const activeCareers = recommendationCards

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-28 sm:pb-24 font-sans text-slate-800 antialiased">
      {/* HEADER - Mobile Optimized */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex w-full items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 md:max-w-6xl md:mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 text-base sm:text-lg font-black text-teal-700 shadow-sm">
              P
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm leading-tight font-black text-slate-900 truncate">
                Pathfinder
              </h1>
              <p className="text-[8px] sm:text-[9px] font-bold tracking-wider text-slate-400 uppercase hidden xs:block">
                Discover. Plan. Succeed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="relative rounded-lg sm:rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors hover:shadow-md">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="bg-slate-100 relative h-8 sm:h-9 w-8 sm:w-9 overflow-hidden rounded-full border border-slate-300 shadow-sm flex-shrink-0">
              <Image
                src="/bot.png"
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Mobile Optimized */}
      <main className="mx-auto w-full max-w-md space-y-4 sm:space-y-6 px-3 sm:px-4 pt-4 sm:pt-5 md:max-w-6xl md:mx-auto">
        {/* GREETING ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Hey {user?.name?.split(" ")[0] || "Brian"}! 👋
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Ready to build your perfect career?
            </p>
          </div>
          <div className="border border-slate-200 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-slate-50 w-fit">
            <span>🇰🇪</span>
            <span className="truncate">{user?.location || "Nairobi"}</span>
          </div>
        </div>

        {/* ASK PATHFINDER AI CARD - Mobile Optimized */}
        <Link
          href="/dashboard/ai-chat"
          className="group relative block min-h-36 sm:min-h-40 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

          {/* Robot — absolute, bottom-left, behind everything */}
          <div className="absolute top-1 sm:top-2 left-[-20] sm:left-[-26] z-0 h-28 sm:h-32 w-36 sm:w-40 drop-shadow-lg">
            <Image
              src="/bot.png"
              alt="Pathfinder AI"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>

          {/* Content - z-10 to float on top */}
          <div className="relative z-10 flex flex-col gap-2 sm:gap-3">
            {/* Title with padding to clear robot */}
            <div className="pl-20 sm:pl-24">
              <h3 className="text-xs sm:text-sm leading-tight font-bold tracking-tight text-white">
                Ask Pathfinder AI
              </h3>
              <p className="mt-0.5 text-[9px] sm:text-[10px] font-medium text-teal-100">
                Your personal career guide
              </p>
            </div>

            {/* Search bar */}
            <div className="flex w-full items-center justify-between rounded-full bg-white py-1.5 pr-1.5 pl-4 sm:pl-5 shadow-md">
              <span className="truncate pr-3 sm:pr-4 text-xs sm:text-[13px] font-medium text-slate-400">
                Explore careers...
              </span>
              <button
                disabled
                className="flex h-8 sm:h-9 w-8 sm:w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm hover:bg-teal-700 transition-colors"
              >
                <Send className="-ml-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
              </button>
            </div>

            {/* Pills - responsive text size */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3 py-1 text-[8px] sm:text-[9px] font-medium text-white hover:bg-white/20 transition-colors">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" /> Best for me
              </span>
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3 py-1 text-[8px] sm:text-[9px] font-medium text-white hover:bg-white/20 transition-colors">
                <BarChart2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" /> Skills needed
              </span>
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3 py-1 text-[8px] sm:text-[9px] font-medium text-white hover:bg-white/20 transition-colors">
                <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" /> Courses
              </span>
            </div>
          </div>
        </Link>

        {/* YOUR CAREER PROGRESS CARD */}
        <div className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900">
              Your Career Progress
            </h3>
            <Link
              href="#"
              className="text-teal-650 text-[10px] sm:text-xs font-bold transition-colors hover:text-teal-700"
            >
              View full report
            </Link>
          </div>

          {progress ? (
            <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4 md:flex-row md:gap-8">
              {/* Overall Ring */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg
                  className="absolute h-full w-full -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="6"
                    strokeDasharray={`${(progress.overallProgress / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-base leading-none font-black text-slate-900">
                    {progress.overallProgress}%
                  </span>
                  <span className="mt-1 text-[7px] sm:text-[8px] leading-none font-bold text-slate-400 uppercase">
                    Progress
                  </span>
                </div>
              </div>

              {/* Stages Track */}
              <div className="relative flex w-full flex-1 items-start justify-between gap-2">
                <div className="absolute top-4 right-8 left-8 -z-10 border-t-2 border-dashed border-slate-200/80" />
                {progress.stages
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => {
                    const isCompleted = stage.status === "completed"
                    const isActive = stage.status === "in_progress"
                    const statusText = isCompleted
                      ? "Completed"
                      : isActive
                        ? "In Progress"
                        : "Pending"
                    return (
                      <div
                        key={stage.id}
                        className="z-10 flex flex-1 flex-col items-center gap-1.5"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold shadow-md ${isCompleted
                            ? "bg-teal-600 text-white"
                            : isActive
                              ? "border-2 border-teal-600 bg-white text-teal-600"
                              : "border border-slate-300 bg-white text-slate-400"
                            }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <span className="text-center text-[9px] sm:text-[10px] leading-tight font-black text-slate-900">
                          {stage.title}
                        </span>
                        <span
                          className={`text-[7px] sm:text-[8px] font-bold uppercase ${isCompleted
                            ? "text-teal-650"
                            : isActive
                              ? "text-amber-500"
                              : "text-slate-400"
                            }`}
                        >
                          {statusText}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 sm:p-6 text-xs sm:text-sm text-slate-500">
              Start chatting with Pathfinder AI and your career progress will
              update automatically here.
            </div>
          )}
        </div>

        {/* RECOMMENDED FOR YOU SECTION */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900">
              Recommended for you
            </h3>
            <Link
              href="#"
              className="text-teal-650 text-[10px] sm:text-xs font-bold transition-colors hover:text-teal-700"
            >
              See all
            </Link>
          </div>

          {/* Cards carousel - horizontal scrolling on mobile, grid on desktop */}
          <div className="custom-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-1 pt-1 pb-3 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-x-visible md:pb-0">
            {recommendationsLoading && recommendations.length === 0 ? (
              <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 text-xs sm:text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading your latest recommendations...
              </div>
            ) : activeCareers.length > 0 ? (
              activeCareers.map((career) => (
                <div
                  key={career.id}
                  className="flex w-72 sm:w-80 shrink-0 snap-start flex-col justify-between space-y-3 sm:space-y-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-slate-50 md:w-auto"
                >
                  {/* Header elements */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wider uppercase ${career.badge === "Top Match"
                          ? "bg-teal-50 text-teal-700"
                          : career.badge === "Fresh insight"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-amber-50 text-amber-700"
                          }`}
                      >
                        {career.badge}
                      </span>
                      <button
                        className="text-slate-400 transition-colors hover:text-red-400"
                        aria-label="Save recommendation"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Recommendation preview */}
                    <div className="flex justify-center rounded-2xl border border-slate-100/50 bg-slate-50/50 py-6">
                      <Briefcase className="h-6 w-6 text-slate-400" />
                    </div>

                    {/* Title & info */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {career.title}
                      </h4>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-5 text-slate-500">
                        {career.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer specs */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-baseline justify-between gap-2">
                      {career.salary ? (
                        <span
                          className={`text-xs font-black ${career.accentColor === "teal"
                            ? "text-teal-650"
                            : career.accentColor === "indigo"
                              ? "text-indigo-650"
                              : "text-amber-650"
                            }`}
                        >
                          {career.salary}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        <Briefcase className="mr-1 inline h-3 w-3" />
                        {career.category || "Career"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${career.accentColor === "teal"
                            ? "bg-teal-600"
                            : career.accentColor === "indigo"
                              ? "bg-indigo-600"
                              : "bg-amber-600"
                            }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, career.matchPercentage))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black whitespace-nowrap text-slate-400">
                        {Math.min(100, Math.max(0, career.matchPercentage))}%
                        match
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm md:col-span-3">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    No recommendations yet.
                  </p>
                  <p>
                    Start a conversation with Pathfinder AI and your first
                    tailored career suggestions will show up here.
                  </p>
                  <Link
                    href="/dashboard/ai-chat"
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    Chat with Pathfinder AI
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* YOUR TOOLS SECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
            Your Tools
          </h3>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Tool 1 */}
            <Link
              href="/dashboard/ai-chat"
              className="flex flex-col space-y-3 rounded-3xl border border-[#CCECE6]/50 bg-[#E6F4F1]/60 p-4 text-left transition-all hover:bg-[#E6F4F1]"
            >
              <div className="text-teal-650 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                <MessageSquare className="h-5 w-5 fill-[#E6F4F1] stroke-teal-600" />
              </div>
              <div>
                <h4 className="text-xs leading-tight font-black text-slate-900">
                  AI Discovery
                </h4>
                <p className="text-slate-450 mt-0.5 text-[9px] leading-tight font-bold">
                  Chat & explore careers
                </p>
              </div>
            </Link>

            {/* Tool 2 */}
            <div className="flex cursor-pointer flex-col space-y-3 rounded-3xl border border-[#DCFCE7]/60 bg-[#F0FDF4]/80 p-4 text-left transition-all hover:bg-[#F0FDF4]">
              <div className="text-emerald-650 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Zap className="h-5 w-5 fill-emerald-100 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs leading-tight font-black text-slate-900">
                  Skill Gap Analysis
                </h4>
                <p className="text-slate-450 mt-0.5 text-[9px] leading-tight font-bold">
                  Find & fix your gaps
                </p>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="flex cursor-pointer flex-col space-y-3 rounded-3xl border border-[#FEF3C7] bg-[#FFFBEB] p-4 text-left transition-all hover:bg-[#FFFBEB]">
              <div className="text-amber-650 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Map className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs leading-tight font-black text-slate-900">
                  Career Roadmaps
                </h4>
                <p className="text-slate-450 mt-0.5 text-[9px] leading-tight font-bold">
                  Step-by-step guides
                </p>
              </div>
            </div>

            {/* Tool 4 */}
            <div className="flex cursor-pointer flex-col space-y-3 rounded-3xl border border-[#EDE9FE]/60 bg-[#F5F3FF]/80 p-4 text-left transition-all hover:bg-[#F5F3FF]">
              <div className="text-indigo-650 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                <BookOpen className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="text-xs leading-tight font-black text-slate-900">
                  Courses & Scholarships
                </h4>
                <p className="text-slate-450 mt-0.5 text-[9px] leading-tight font-bold">
                  Find opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM KEEP GOING CTA BANNER */}
        <div className="group relative flex items-center justify-between overflow-hidden rounded-3xl bg-[#054E45] p-5 shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 text-3xl drop-shadow-sm filter select-none">
              🏆
            </span>
            <div>
              <h3 className="text-xs leading-tight font-extrabold text-white">
                Keep going, {user?.name?.split(" ")[0] || "Brian"}! 🎯
              </h3>
              <p className="mt-0.5 text-[10px] font-medium text-white/90">
                You're {progress?.overallProgress || 68}% closer to your career
                goal.
              </p>
            </div>
          </div>
          <button className="relative z-10 rounded-full bg-white px-5 py-2.5 text-[10px] font-black whitespace-nowrap text-[#054E45] shadow-md transition-all hover:bg-slate-50 active:scale-95">
            Continue Roadmap
          </button>
        </div>
      </main>

      {/* STICKY BOTTOM NAV BAR */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-100 bg-white/90 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <NavItem icon={Home} label="Dashboard" active />
          <NavItem icon={Compass} label="Explore" />
          <button className="relative z-50 flex -translate-y-4 flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#F8FAFC] bg-teal-600 text-white shadow-lg transition-all active:scale-95">
              <Plus className="h-6 w-6 stroke-[3]" />
            </div>
            <span className="mt-1 text-[9px] font-black text-slate-500">
              Plan
            </span>
          </button>
          <NavItem
            icon={MessageSquare}
            label="Chats"
            href="/dashboard/ai-chat"
          />
          <NavItem icon={User} label="Profile" />
        </div>
      </nav>
    </div>
  )
}

interface NavItemProps {
  icon: any
  label: string
  active?: boolean
  href?: string
}

function NavItem({ icon: Icon, label, active, href }: NavItemProps) {
  const content = (
    <button
      className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-300 ${active ? "text-teal-650" : "text-slate-400 hover:text-slate-600"
        }`}
    >
      <Icon className="mb-0.5 h-5 w-5" />
      <span className="text-[9px] leading-none font-black">{label}</span>
    </button>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
