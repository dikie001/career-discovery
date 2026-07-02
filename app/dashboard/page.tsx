"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useDashboard } from "@/contexts/dashboard-context"
import { useAuth } from "@/contexts/auth-context"
import { Bell, Send, Home, MessageSquare, Plus, BookOpen, User, Zap, Map, Heart, TrendingUp, Star, ArrowRight, Sparkles, Compass, BarChart2 } from "lucide-react"
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center animate-fadeInUp">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-teal-600/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 border-r-teal-600 animate-spin"></div>
          </div>
          <p className="text-slate-650 font-bold">Loading your career journey...</p>
          <p className="text-slate-450 text-xs mt-2">Preparing personalized insights</p>
        </div>
      </div>
    )
  }

  // Fallback data matching user mockups
  const mockupCareers = [
    {
      id: "car_1",
      title: "Data Analyst",
      description: "High demand in Kenya",
      salary: "KSh 120K+ /month",
      matchPercentage: 92,
      badge: "Top Match",
      badgeColor: "bg-teal-150 text-teal-700",
      accentColor: "teal",
      illustration: (
        <svg viewBox="0 0 120 90" className="w-full h-24 object-contain">
          <rect x="15" y="10" width="90" height="70" rx="8" fill="#F0FDFA" stroke="#CCFBF1" strokeWidth="1" />
          <rect x="25" y="20" width="70" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="32" y="44" width="6" height="12" rx="1" fill="#14B8A6" />
          <rect x="42" y="37" width="6" height="19" rx="1" fill="#06B6D4" />
          <rect x="52" y="28" width="6" height="28" rx="1" fill="#0EA5E9" />
          <rect x="62" y="40" width="6" height="16" rx="1" fill="#3B82F6" />
          <path d="M 35 44 L 45 34 L 55 26 L 65 32" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="65" cy="32" r="2" fill="#F59E0B" />
          <circle cx="85" cy="36" r="6" fill="#CBD5E1" />
          <path d="M 75 52 C 75 46 80 44 85 44 C 90 44 95 46 95 52 Z" fill="#CBD5E1" />
        </svg>
      )
    },
    {
      id: "car_2",
      title: "Software Developer",
      description: "High growth career",
      salary: "KSh 150K+ /month",
      matchPercentage: 87,
      badge: "High Growth",
      badgeColor: "bg-indigo-100 text-indigo-700",
      accentColor: "indigo",
      illustration: (
        <svg viewBox="0 0 120 90" className="w-full h-24 object-contain">
          <rect x="15" y="10" width="90" height="70" rx="8" fill="#F5F3FF" stroke="#EDE9FE" strokeWidth="1" />
          <rect x="25" y="20" width="70" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="32" y="27" width="18" height="3" rx="1" fill="#8B5CF6" />
          <rect x="32" y="34" width="30" height="3" rx="1" fill="#A78BFA" />
          <rect x="32" y="41" width="15" height="3" rx="1" fill="#C4B5FD" />
          <rect x="32" y="48" width="22" height="3" rx="1" fill="#C4B5FD" />
          <text x="70" y="42" fill="#6D28D9" fontSize="11" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</text>
          <rect x="45" y="65" width="30" height="4" rx="1.5" fill="#E2E8F0" />
        </svg>
      )
    },
    {
      id: "car_3",
      title: "Clinical Officer",
      description: "Make a difference",
      salary: "KSh 70K+ /month",
      matchPercentage: 81,
      badge: "Make Impact",
      badgeColor: "bg-orange-100 text-orange-700",
      accentColor: "orange",
      illustration: (
        <svg viewBox="0 0 120 90" className="w-full h-24 object-contain">
          <rect x="15" y="10" width="90" height="70" rx="8" fill="#FFF7ED" stroke="#FFEDD5" strokeWidth="1" />
          <circle cx="60" cy="40" r="22" fill="#FFE0C2" opacity="0.3" />
          <path d="M 60 48 C 55 42 48 42 48 47 C 48 53 60 62 60 62 C 60 62 72 53 72 47 C 72 42 65 42 60 48 Z" fill="#EF4444" />
          <path d="M 45 25 Q 60 18 75 25" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 50 25 L 50 35 C 50 42 70 42 70 35 L 70 25" fill="none" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="60" cy="42" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="60" y1="37" x2="60" y2="47" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="55" y1="42" x2="65" y2="42" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      )
    }
  ]

  const activeCareers = careers.length > 0 ? careers.slice(0, 3).map((c, idx) => ({
    ...c,
    salary: idx === 0 ? "KSh 120K+ /month" : idx === 1 ? "KSh 150K+ /month" : "KSh 70K+ /month",
    badge: idx === 0 ? "Top Match" : idx === 1 ? "High Growth" : "Make Impact",
    badgeColor: idx === 0 ? "bg-teal-50 text-teal-700" : idx === 1 ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700",
    accentColor: idx === 0 ? "teal" : idx === 1 ? "purple" : "orange",
    illustration: mockupCareers[idx % 3].illustration,
    description: c.description || mockupCareers[idx % 3].description
  })) : mockupCareers

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-24 font-sans antialiased">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-md md:max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100/80 shadow-sm text-teal-650 font-black text-xl">
              P
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">Pathfinder</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discover. Plan. Succeed.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-slate-200 bg-slate-105 shadow-sm">
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

      {/* DASHBOARD HERO */}
      <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-5 space-y-6">
        
        {/* GREETING & LOCATION ROW */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hey {user?.name?.split(" ")[0] || "Brian"}! 👋</h2>
            <p className="text-xs font-semibold text-slate-400">Ready to build a career that fits you?</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-150 shadow-sm text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
            <span>🇰🇪</span>
            <span>{user?.location || "Nairobi, Kenya"}</span>
            <span className="text-[10px] text-slate-450">▼</span>
          </div>
        </div>

        {/* ASK PATHFINDER AI GRADIENT CARD */}
        <Link href="/dashboard/ai-chat" className="block group relative rounded-3xl bg-gradient-to-r from-[#0F766E] to-[#044E44] p-5 overflow-hidden hover:shadow-xl transition-all duration-300 shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10 flex flex-col pt-1">
            {/* Header Area with Robot and Text */}
            <div className="flex items-end px-1">
              {/* Robot Image extending behind the search bar */}
              <div className="relative w-20 h-20 -mb-2 flex-shrink-0 z-0 drop-shadow-lg">
                <Image
                  src="/bot.png"
                  alt="Pathfinder AI"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Text Content */}
              <div className="pb-4 ml-2 z-10">
                <h3 className="font-bold text-white text-[15px] tracking-tight leading-tight">Ask Pathfinder AI</h3>
                <p className="text-[11px] text-teal-100 font-medium mt-0.5">Your personal career guide</p>
              </div>
            </div>

            {/* Search bar overlay */}
            <div className="relative z-20 w-full rounded-full bg-white pl-5 pr-1.5 py-1.5 flex items-center justify-between shadow-md">
              <span className="text-[13px] text-slate-400 font-medium truncate pr-4">What would you like to explore today?</span>
              <button
                disabled
                className="flex-shrink-0 h-9 w-9 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-sm"
              >
                <Send className="h-4 w-4 fill-white -ml-0.5" />
              </button>
            </div>

            {/* Quick pill options */}
            <div className="relative z-20 flex gap-2 flex-wrap mt-4 px-1">
              <span className="rounded-full bg-white/5 border border-white/20 px-3 py-1.5 text-[9px] sm:text-[10px] font-medium text-white transition-all flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-white" /> Best careers for me
              </span>
              <span className="rounded-full bg-white/5 border border-white/20 px-3 py-1.5 text-[9px] sm:text-[10px] font-medium text-white transition-all flex items-center gap-1.5">
                <BarChart2 className="h-3 w-3 text-white" /> Skills I need
              </span>
              <span className="rounded-full bg-white/5 border border-white/20 px-3 py-1.5 text-[9px] sm:text-[10px] font-medium text-white transition-all flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 text-white" /> Courses to study
              </span>
            </div>
          </div>
        </Link>

        {/* YOUR CAREER PROGRESS CARD */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Your Career Progress</h3>
            <Link href="#" className="text-xs font-bold text-teal-650 hover:text-teal-700 transition-colors">
              View full report
            </Link>
          </div>

          {/* Connected timeline and progress ring layout */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {/* Overall Ring */}
            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <svg className="absolute h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="6"
                  strokeDasharray="170 251.2"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-base font-black text-slate-900 leading-none">68%</span>
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase leading-none">Progress</span>
              </div>
            </div>

            {/* Stages Track */}
            <div className="relative flex items-start justify-between flex-1 w-full gap-2">
              {/* Timeline Connector Line */}
              <div className="absolute left-8 right-8 top-4 border-t-2 border-dashed border-slate-200/80 -z-10" />

              {/* Node 1: Completed */}
              <div className="flex flex-col items-center gap-1.5 flex-1 z-10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs shadow-md">
                  ✓
                </div>
                <span className="text-[10px] font-black text-slate-900 text-center leading-tight">Self Discovery</span>
                <span className="text-[8px] font-bold text-teal-650 uppercase">Completed</span>
              </div>

              {/* Node 2: Completed */}
              <div className="flex flex-col items-center gap-1.5 flex-1 z-10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs shadow-md">
                  ✓
                </div>
                <span className="text-[10px] font-black text-slate-900 text-center leading-tight">Interests & Strengths</span>
                <span className="text-[8px] font-bold text-teal-650 uppercase">Completed</span>
              </div>

              {/* Node 3: Active */}
              <div className="flex flex-col items-center gap-1.5 flex-1 z-10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-600 bg-white text-teal-600 font-extrabold text-xs shadow-md">
                  3
                </div>
                <span className="text-[10px] font-black text-slate-900 text-center leading-tight">Skill Gap Analysis</span>
                <span className="text-[8px] font-bold text-amber-500 uppercase">In Progress</span>
              </div>

              {/* Node 4: Unstarted */}
              <div className="flex flex-col items-center gap-1.5 flex-1 z-10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 font-bold text-xs">
                  4
                </div>
                <span className="text-[10px] font-black text-slate-900 text-center leading-tight">Career Roadmap</span>
                <span className="text-[8px] font-bold text-slate-455 uppercase">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED FOR YOU SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Recommended for you</h3>
            <Link href="#" className="text-xs font-bold text-teal-650 hover:text-teal-700 transition-colors">
              See all
            </Link>
          </div>

          {/* Cards carousel - horizontal scrolling on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-3 pt-1 px-1 -mx-1 scroll-smooth snap-x snap-mandatory custom-scrollbar md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 md:mx-0">
            {activeCareers.map((career) => (
              <div
                key={career.id}
                className="flex-shrink-0 w-72 md:w-auto bg-white rounded-3xl border border-slate-100 p-4 space-y-4 shadow-sm snap-start hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header elements */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      career.badge === "Top Match"
                        ? "bg-teal-55 text-teal-750"
                        : career.badge === "High Growth"
                          ? "bg-indigo-50 text-indigo-650"
                          : "bg-orange-50 text-orange-650"
                    }`}>
                      {career.badge}
                    </span>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <Heart className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* SVG illustration */}
                  <div className="flex justify-center py-2 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    {career.illustration}
                  </div>

                  {/* Title & info */}
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{career.title}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{career.description}</p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xs font-black ${
                      career.accentColor === "teal"
                        ? "text-teal-650"
                        : career.accentColor === "indigo"
                          ? "text-indigo-650"
                          : "text-orange-650"
                    }`}>
                      {career.salary}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          career.accentColor === "teal"
                            ? "bg-teal-600"
                            : career.accentColor === "indigo"
                              ? "bg-indigo-600"
                              : "bg-orange-600"
                        }`}
                        style={{ width: `${career.matchPercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{career.matchPercentage}% match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YOUR TOOLS SECTION */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Your Tools</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Tool 1 */}
            <Link href="/dashboard/ai-chat" className="flex flex-col p-4 rounded-3xl bg-[#E6F4F1]/60 border border-[#CCECE6]/50 hover:bg-[#E6F4F1] transition-all text-left space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-teal-650">
                <MessageSquare className="h-5 w-5 fill-[#E6F4F1] stroke-teal-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">AI Discovery</h4>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5 leading-tight">Chat & explore careers</p>
              </div>
            </Link>

            {/* Tool 2 */}
            <div className="flex flex-col p-4 rounded-3xl bg-[#F0FDF4]/80 border border-[#DCFCE7]/60 hover:bg-[#F0FDF4] transition-all text-left space-y-3 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-emerald-650">
                <Zap className="h-5 w-5 text-emerald-500 fill-emerald-100" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Skill Gap Analysis</h4>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5 leading-tight">Find & fix your gaps</p>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="flex flex-col p-4 rounded-3xl bg-[#FFFBEB] border border-[#FEF3C7] hover:bg-[#FFFBEB] transition-all text-left space-y-3 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-amber-650">
                <Map className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Career Roadmaps</h4>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5 leading-tight">Step-by-step guides</p>
              </div>
            </div>

            {/* Tool 4 */}
            <div className="flex flex-col p-4 rounded-3xl bg-[#F5F3FF]/80 border border-[#EDE9FE]/60 hover:bg-[#F5F3FF] transition-all text-left space-y-3 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-indigo-650">
                <BookOpen className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Courses & Scholarships</h4>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5 leading-tight">Find opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM KEEP GOING CTA BANNER */}
        <div className="group relative rounded-3xl bg-[#054E45] p-5 flex items-center justify-between overflow-hidden shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-sm flex-shrink-0 select-none">🏆</span>
            <div>
              <h3 className="font-extrabold text-white text-xs leading-tight">Keep going, {user?.name?.split(" ")[0] || "Brian"}! 🎯</h3>
              <p className="text-[10px] text-white/90 font-medium mt-0.5">You're {progress?.overallProgress || 68}% closer to your career goal.</p>
            </div>
          </div>
          <button className="relative z-10 rounded-full bg-white px-5 py-2.5 text-[10px] font-black text-[#054E45] hover:bg-slate-50 transition-all shadow-md active:scale-95 whitespace-nowrap">
            Continue Roadmap
          </button>
        </div>

      </main>

      {/* STICKY BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-100 bg-white/90 backdrop-blur-md px-4 py-2 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavItem icon={Home} label="Dashboard" active />
          <NavItem icon={Compass} label="Explore" />
          <button className="flex flex-col items-center justify-center -translate-y-4 relative z-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg border-4 border-[#F8FAFC] active:scale-95 transition-all">
              <Plus className="h-6 w-6 stroke-[3]" />
            </div>
            <span className="text-[9px] font-black text-slate-500 mt-1">Plan</span>
          </button>
          <NavItem icon={MessageSquare} label="Chats" href="/dashboard/ai-chat" />
          <NavItem icon={User} label="Profile" />
        </div>
      </nav>
    </div>
  )
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  href?: string;
}

function NavItem({ icon: Icon, label, active, href }: NavItemProps) {
  const content = (
    <button className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 ${active
      ? "text-teal-650"
      : "text-slate-400 hover:text-slate-600"
      }`}>
      <Icon className="h-5 w-5 mb-0.5" />
      <span className="text-[9px] font-black leading-none">{label}</span>
    </button>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
