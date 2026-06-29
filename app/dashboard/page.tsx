"use client"

import React, { useEffect, useState } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { useAuth } from "@/contexts/auth-context"
import { Bell, MessageCircle, Plus, MessageSquare, User, Home, Zap, Map, BookOpen, Heart } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile, careers, courses, progress, isLoading, loadData, sendChatMessage } = useDashboard()
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([
    { id: "1", role: "assistant", content: "Hey! 👋 What would you like to explore today?" },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const userMsg = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      const response = await sendChatMessage(input)
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }])
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setSending(false)
    }
  }

  if (isLoading && !progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-400 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 px-6 py-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600">
              <span className="text-base font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-50">Pathfinder</h1>
              <p className="text-xs text-slate-400">Discover. Plan. Succeed</p>
            </div>
          </div>
          <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </header>

      {/* Desktop Layout - 3 Column Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto min-h-screen">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          {/* Welcome Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Hey {user?.name?.split(" ")[0]}! 👋</h2>
              <p className="text-sm text-slate-400 mt-2">Ready to build a career that fits you?</p>
            </div>
            {user?.location && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <span className="text-lg">📍</span>
                <p className="text-xs font-medium text-slate-300">{user.location}</p>
              </div>
            )}
          </div>

          {/* Progress Card */}
          {progress && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-50">Your Progress</h3>
                <Link href="#" className="text-xs text-teal-400 hover:text-teal-300">
                  View report
                </Link>
              </div>
              <div className="flex justify-center py-4">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="4" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="4"
                      strokeDasharray={`${(progress.overallProgress / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-teal-400">{progress.overallProgress}%</span>
                    <span className="text-xs text-slate-400">Complete</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {progress.stages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${stage.status === "completed"
                        ? "bg-teal-600 text-white"
                        : stage.status === "in_progress"
                          ? "bg-yellow-500 text-white"
                          : "bg-slate-700 text-slate-400"
                        }`}
                    >
                      {stage.status === "completed" ? "✓" : stage.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-300">{stage.title}</p>
                      <p className="text-xs text-slate-500">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - AI Chat */}
        <div className="md:col-span-1 space-y-6 flex flex-col">
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Ask Pathfinder AI</h3>
                <p className="text-xs text-white/80">Your personal career guide</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white hover:bg-white/25 transition-colors flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Best careers</span>
              </button>
              <button className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white hover:bg-white/25 transition-colors flex items-center justify-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>Skills I need</span>
              </button>
              <button className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white hover:bg-white/25 transition-colors flex items-center justify-center gap-1">
                <Map className="h-3 w-3" />
                <span>Courses</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-white/20 text-white" : "bg-white/10 text-white/90"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-full bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-full bg-white p-2.5 text-teal-600 hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Careers */}
        <div className="md:col-span-1 space-y-6">
          {careers.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-50">Recommended for you</h3>
                <Link href="#" className="text-xs text-teal-400 hover:text-teal-300">
                  See all
                </Link>
              </div>

              <div className="space-y-3">
                {careers.slice(0, 3).map((career) => (
                  <div key={career.id} className="rounded-xl border border-slate-800 bg-slate-800/30 p-4 space-y-3 hover:border-teal-600/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-50 text-sm">{career.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">{career.description}</p>
                      </div>
                      <button className="text-slate-400 hover:text-red-400 flex-shrink-0">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-600 h-full" style={{ width: `${career.matchPercentage}%` }} />
                      </div>
                      <span className="text-xs font-medium text-teal-400">{career.matchPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 p-6 space-y-3">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Keep going! 🏆</h3>
              <p className="text-xs text-white/80">You're {progress?.overallProgress || 0}% closer to your goal.</p>
            </div>
            <button className="w-full rounded-lg bg-white text-teal-600 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors">
              Continue Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden pb-24">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-50">Pathfinder</h1>
                <p className="text-xs text-slate-400">Discover. Plan. Succeed</p>
              </div>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-50">Hey {user?.name?.split(" ")[0]}! 👋</h2>
            <p className="text-sm text-slate-400">Ready to build a career that fits you?</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs">Ask Pathfinder AI</h3>
                <p className="text-xs text-white/80">Your personal career guide</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="rounded-lg bg-white/15 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors">
                🚀 Best careers
              </button>
              <button className="rounded-lg bg-white/15 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors">
                📚 Skills I need
              </button>
              <button className="rounded-lg bg-white/15 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors">
                🎓 Courses
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to explore?"
                className="flex-1 rounded-full bg-white/20 px-3 py-2 text-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none"
              />
              <button type="submit" disabled={sending || !input.trim()} className="rounded-full bg-white p-2 text-teal-600 hover:bg-white/90 disabled:opacity-50">
                <MessageCircle className="h-4 w-4" />
              </button>
            </form>
          </div>

          {progress && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-50 text-sm">Your Career Progress</h3>
                <Link href="#" className="text-xs text-teal-400 hover:text-teal-300">
                  View full report
                </Link>
              </div>

              <div className="flex justify-center py-2">
                <div className="relative h-20 w-20">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="4" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="4" strokeDasharray={`${(progress.overallProgress / 100) * 251.2} 251.2`} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-teal-400">{progress.overallProgress}%</span>
                    <span className="text-xs text-slate-400">Progress</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-1 text-xs">
                {progress.stages.map((stage) => (
                  <div key={stage.id} className="flex flex-col items-center gap-1">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${stage.status === "completed" ? "bg-teal-600 text-white" : stage.status === "in_progress" ? "bg-yellow-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                      {stage.status === "completed" ? "✓" : stage.order}
                    </div>
                    <span className="text-xs text-slate-400 text-center max-w-12">{stage.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {careers.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-50 text-sm">Recommended for you</h3>
                <Link href="#" className="text-xs text-teal-400 hover:text-teal-300">
                  See all
                </Link>
              </div>

              <div className="space-y-2">
                {careers.slice(0, 3).map((career) => (
                  <div key={career.id} className="rounded-xl border border-slate-800 bg-slate-800/30 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-50 text-xs">{career.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{career.description}</p>
                      </div>
                      <button className="text-slate-400 hover:text-red-400">♡</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: `${career.matchPercentage}%` }} />
                      </div>
                      <span className="text-xs font-medium text-teal-400">{career.matchPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Keep going, {user?.name?.split(" ")[0]}! 🏆</h3>
              <p className="text-xs text-white/80">You're {progress?.overallProgress || 0}% closer to your career goal.</p>
            </div>
            <button className="w-full rounded-lg bg-white text-teal-600 py-2 text-xs font-semibold hover:bg-slate-100">
              Continue Roadmap
            </button>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-2">
          <div className="flex justify-around max-w-2xl mx-auto">
            <NavItem icon={Home} label="Dashboard" active />
            <NavItem icon={MessageSquare} label="Chat" />
            <NavItem icon={Plus} label="Plan" />
            <NavItem icon={BookOpen} label="Explore" />
            <NavItem icon={User} label="Profile" />
          </div>
        </nav>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active }: any) {
  return (
    <button className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${active ? "text-teal-400" : "text-slate-400 hover:text-slate-200"}`}>
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
