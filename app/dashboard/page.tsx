"use client"

import React, { useEffect, useState } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { useAuth } from "@/contexts/auth-context"
import { Bell, Send, Home, MessageSquare, Plus, BookOpen, User, Zap, Map, Heart, TrendingUp, Star, ArrowRight } from "lucide-react"
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
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      }])
    } finally {
      setSending(false)
    }
  }

  if (isLoading && !progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center animate-fadeInUp">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-teal-600/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400 border-r-teal-400 animate-spin"></div>
          </div>
          <p className="text-slate-300 font-medium">Loading your career journey...</p>
          <p className="text-slate-500 text-sm mt-2">Preparing personalized insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* DESKTOP VIEW */}
      <div className="hidden lg:block">
        {/* Premium Header */}
        <header className="sticky top-0 z-40 glass border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 animate-slideInLeft">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700">
                  <span className="text-lg font-bold text-white">P</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Pathfinder</h1>
                <p className="text-xs text-slate-400">Discover. Plan. Succeed</p>
              </div>
            </div>
            <button className="relative p-2.5 text-slate-400 hover:text-teal-400 transition-colors group">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* 3-Column Desktop Layout */}
        <div className="grid grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
          {/* LEFT COLUMN - User Profile & Progress */}
          <div className="col-span-3 space-y-6">
            {/* Welcome Card */}
            <div className="group relative rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800 p-6 hover-lift animate-slideInLeft overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 space-y-3">
                <h2 className="text-3xl font-bold text-white">Hey, {user?.name?.split(" ")[0] || "User"}! 👋</h2>
                <p className="text-sm text-slate-400">Ready to build a career that fits you?</p>
                {user?.location && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                    <span className="text-lg">📍</span>
                    <p className="text-xs font-medium text-slate-300">{user.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Card */}
            {progress && (
              <div className="group rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800 p-6 hover-lift animate-slideInLeft overflow-hidden" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-400" />
                    Career Progress
                  </h3>
                  <Link href="#" className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                    Report <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center py-6">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="3" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#tealGradient)"
                        strokeWidth="3"
                        strokeDasharray={`${(progress.overallProgress / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{progress.overallProgress}%</span>
                      <span className="text-xs text-slate-400 mt-1">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Stages */}
                <div className="space-y-3 mt-6">
                  {progress.stages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 transition-all ${stage.status === "completed"
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white"
                        : stage.status === "in_progress"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse-soft"
                          : "bg-slate-700 text-slate-400"
                        }`}>
                        {stage.status === "completed" ? "✓" : stage.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{stage.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE COLUMN - AI Chat */}
          <div className="col-span-6 flex flex-col animate-fadeInUp">
            <div className="group relative rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 p-8 space-y-6 flex-1 flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Pathfinder AI</h3>
                    <p className="text-xs text-white/80">Your personal career guide</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="relative z-10 grid grid-cols-3 gap-2">
                <button className="group/btn rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition-all duration-300 hover:shadow-lg">
                  <Zap className="h-3.5 w-3.5 inline mr-1" />
                  Best Careers
                </button>
                <button className="group/btn rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition-all duration-300 hover:shadow-lg">
                  <Star className="h-3.5 w-3.5 inline mr-1" />
                  Skills I Need
                </button>
                <button className="group/btn rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition-all duration-300 hover:shadow-lg">
                  <Map className="h-3.5 w-3.5 inline mr-1" />
                  Courses
                </button>
              </div>

              {/* Messages Area */}
              <div className="relative z-10 flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-96 pr-2 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur transition-all duration-300 ${msg.role === "user"
                      ? "bg-white/25 text-white shadow-lg"
                      : "bg-white/15 text-white/95"
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start animate-fadeInUp">
                    <div className="bg-white/15 backdrop-blur px-4 py-3 rounded-2xl">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-2.5 w-2.5 bg-white/70 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="relative z-10 flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about careers..."
                  className="flex-1 rounded-full bg-white/20 backdrop-blur px-5 py-3 text-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-white px-4 py-3 text-teal-600 hover:bg-white/90 disabled:opacity-50 transition-all duration-300 hover:shadow-lg font-semibold"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN - Recommended Careers */}
          <div className="col-span-3 space-y-6 flex flex-col">
            {careers.length > 0 && (
              <div className="group rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800 p-6 hover-lift flex-1 animate-slideInRight overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-teal-400" />
                    Recommended
                  </h3>
                  <Link href="#" className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                    See all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-96 pr-2 custom-scrollbar stagger-children">
                  {careers.slice(0, 5).map((career, idx) => (
                    <div
                      key={career.id}
                      className="rounded-xl border border-slate-700 bg-slate-700/20 hover:bg-slate-700/40 p-4 space-y-3 hover-lift transition-all duration-300 cursor-pointer animate-slideInRight"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-50 text-sm">{career.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{career.description}</p>
                        </div>
                        <button className="text-slate-400 hover:text-red-400 flex-shrink-0 transition-colors">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${career.matchPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-teal-400 whitespace-nowrap">{career.matchPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Card */}
            <div className="group rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-6 space-y-4 hover-lift animate-slideInRight overflow-hidden" style={{ animationDelay: "0.2s" }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <h3 className="font-bold text-white text-lg">Keep going! 🚀</h3>
                <p className="text-sm text-white/90 mt-1">You're {progress?.overallProgress || 0}% closer to your goal.</p>
              </div>
              <button className="relative z-10 w-full rounded-xl bg-white text-teal-600 py-3 text-sm font-bold hover:bg-slate-100 transition-all duration-300 hover:shadow-lg">
                Continue Roadmap <ArrowRight className="h-4 w-4 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* MOBILE VIEW */}
      <div className="lg:hidden pb-24">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 glass border-b border-slate-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 animate-slideInLeft">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700">
                <span className="text-base font-bold text-white">P</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Pathfinder</h1>
                <p className="text-xs text-slate-400">Discover. Plan. Succeed</p>
              </div>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-teal-400 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
          </div>
        </header>

        <main className="px-4 py-4 space-y-4 animate-fadeInUp">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Hey, {user?.name?.split(" ")[0] || "User"}! 👋</h2>
            <p className="text-sm text-slate-400">Build a career that fits you</p>
          </div>

          {/* Mobile AI Chat */}
          <div className="group relative rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-4 space-y-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-24 -mt-24" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Ask Pathfinder AI</h3>
                  <p className="text-xs text-white/80">Your career guide</p>
                </div>
              </div>
            </div>

            {/* Messages - Compact */}
            <div className="relative z-10 space-y-2 max-h-48 overflow-y-auto">
              {messages.slice(-3).map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-xs ${msg.role === "user"
                      ? "bg-white/25 text-white"
                      : "bg-white/15 text-white/90"
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="relative z-10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to explore?"
                className="flex-1 rounded-full bg-white/20 backdrop-blur px-4 py-2.5 text-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none"
              />
              <button type="submit" disabled={sending || !input.trim()} className="rounded-full bg-white p-2.5 text-teal-600 hover:bg-white/90 disabled:opacity-50 transition-all">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Mobile Progress */}
          {progress && (
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 space-y-4 animate-slideInLeft">
              <h3 className="font-bold text-slate-50 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                Your Progress
              </h3>

              {/* Compact Progress Ring */}
              <div className="flex justify-center">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#mobileTealGradient)"
                      strokeWidth="2"
                      strokeDasharray={`${(progress.overallProgress / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="mobileTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-teal-400">{progress.overallProgress}%</span>
                    <span className="text-xs text-slate-400">Progress</span>
                  </div>
                </div>
              </div>

              {/* Stage Pills */}
              <div className="flex justify-between gap-1">
                {progress.stages.map((stage) => (
                  <div key={stage.id} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${stage.status === "completed"
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white"
                        : stage.status === "in_progress"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}>
                      {stage.status === "completed" ? "✓" : stage.order}
                    </div>
                    <span className="text-xs text-slate-400 text-center line-clamp-2">{stage.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Careers */}
          {careers.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 space-y-3 animate-slideInLeft">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-50 flex items-center gap-2">
                  <Star className="h-4 w-4 text-teal-400" />
                  Recommended
                </h3>
                <Link href="#" className="text-xs text-teal-400">See all</Link>
              </div>

              <div className="space-y-2">
                {careers.slice(0, 3).map((career) => (
                  <div
                    key={career.id}
                    className="rounded-xl border border-slate-700 bg-slate-700/20 p-3 space-y-2 hover:bg-slate-700/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-50 text-sm">{career.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">{career.description}</p>
                      </div>
                      <button className="text-slate-400 hover:text-red-400 flex-shrink-0">
                        ♡
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full"
                          style={{ width: `${career.matchPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-teal-400 whitespace-nowrap">{career.matchPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="group relative rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-4 space-y-3 overflow-hidden animate-slideInLeft">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <h3 className="font-bold text-white">Keep going! 🚀</h3>
              <p className="text-sm text-white/90 mt-1">You're {progress?.overallProgress || 0}% closer to your goal.</p>
            </div>
            <button className="relative z-10 w-full rounded-lg bg-white text-teal-600 py-2.5 text-sm font-bold hover:bg-slate-100 transition-all">
              Continue Roadmap
            </button>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 glass px-4 py-2">
          <div className="flex justify-between max-w-md mx-auto">
            <NavItem icon={Home} label="Home" active />
            <NavItem icon={MessageSquare} label="Chat" />
            <NavItem icon={Plus} label="Plan" />
            <NavItem icon={BookOpen} label="Learn" />
            <NavItem icon={User} label="Profile" />
          </div>
        </nav>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active }: any) {
  return (
    <button className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all duration-300 ${active
        ? "text-teal-400"
        : "text-slate-400 hover:text-slate-200"
      }`}>
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  )
}
