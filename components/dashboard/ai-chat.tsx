"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import {
  Send,
  Loader,
  Sparkles,
  Compass,
  BarChart2,
  Smile,
  Plus,
  Menu,
  X,
  MessageSquare,
  History,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  AlertCircle,
} from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"
import { ChatOptions, ChatOption } from "./chat-options"
import { ConsentModal } from "./consent-modal"
import { ChatStarters } from "./chat-starters"
import { useAuth } from "@/contexts/auth-context"
import { extractRecommendationMetadata } from "@/lib/recommendations"
import Link from "next/link"
import { useDeviceMode } from "@/contexts/device-mode-context"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  options?: ChatOption[]
  selectedOption?: string
  sessionStart?: boolean
}

interface AiChatProps {
  onSendMessage: (message: string, personality?: string) => Promise<string>
  isLoading?: boolean
  userConsent?: boolean | null
  onConsentChange?: (consented: boolean) => Promise<void>
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: Message[]
}

interface GroupedSessions {
  today: ChatSession[]
  yesterday: ChatSession[]
  lastWeek: ChatSession[]
  older: ChatSession[]
}

const PERSONALITIES = [
  {
    id: "mentor",
    name: "Expert Mentor",
    description: "Structured, professional, & data-driven career advice",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    color: "bg-teal-600",
    textBg: "bg-teal-900/40 text-teal-300 border-teal-800/80",
  },
  {
    id: "coach",
    name: "Warm Coach",
    description: "Empathetic, warm, informal, & soft-skills focused",
    icon: <Smile className="h-3.5 w-3.5" />,
    color: "bg-rose-600",
    textBg: "bg-rose-900/40 text-rose-300 border-rose-800/80",
  },
  {
    id: "analyst",
    name: "Direct Analyst",
    description: "Straight-to-the-point, metrics, salaries, & ROI focused",
    icon: <BarChart2 className="h-3.5 w-3.5" />,
    color: "bg-amber-600",
    textBg: "bg-amber-900/40 text-amber-300 border-amber-800/80",
  },
  {
    id: "pivot",
    name: "Creative Pivoter",
    description: "Lateral thinking, transferable skills, & transition advice",
    icon: <Compass className="h-3.5 w-3.5" />,
    color: "bg-purple-600",
    textBg: "bg-purple-900/40 text-purple-300 border-purple-800/80",
  },
]

const THEMES = [
  {
    id: "pathfinder",
    name: "Pathfinder",
    bg: "bg-[#032E28]",
    sidebar: "bg-[#044039] border-[#0A5C52]",
    header: "bg-[#044039] border-[#0A5C52]",
    accent: "teal",
    accentBg: "bg-[#059669] hover:bg-[#047857]",
    accentText: "text-teal-300",
    accentBorder: "border-teal-700",
    chatUser: "bg-[#059669]",
    chatAssistant: "bg-[#044039] border-[#0A5C52]",
    colorPreview: "bg-[#0F766E]",
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    bg: "bg-zinc-950",
    sidebar: "bg-zinc-900 border-zinc-800",
    header: "bg-zinc-950 border-zinc-800",
    accent: "sky",
    accentBg: "bg-sky-600 hover:bg-sky-700",
    accentText: "text-sky-400",
    accentBorder: "border-sky-800",
    chatUser: "bg-sky-700",
    chatAssistant: "bg-zinc-900 border-zinc-800",
    colorPreview: "bg-sky-500",
  },
  {
    id: "slate",
    name: "Obsidian Teal",
    bg: "bg-background",
    sidebar: "bg-card border-border",
    header: "bg-background border-border",
    accent: "teal",
    accentBg: "bg-teal-600 hover:bg-teal-700",
    accentText: "text-teal-400",
    accentBorder: "border-teal-800",
    chatUser: "bg-teal-700",
    chatAssistant: "bg-card border-border",
    colorPreview: "bg-teal-500",
  },
  {
    id: "sepia",
    name: "Warm Sepia",
    bg: "bg-stone-950",
    sidebar: "bg-stone-900 border-stone-800",
    header: "bg-stone-950 border-stone-800",
    accent: "amber",
    accentBg: "bg-amber-600 hover:bg-amber-700",
    accentText: "text-amber-400",
    accentBorder: "border-amber-800",
    chatUser: "bg-amber-700",
    chatAssistant: "bg-stone-900 border-stone-800",
    colorPreview: "bg-amber-500",
  },
  {
    id: "emerald",
    name: "Jade Executive",
    bg: "bg-emerald-950",
    sidebar: "bg-emerald-950 border-emerald-900",
    header: "bg-emerald-950 border-emerald-900",
    accent: "emerald",
    accentBg: "bg-emerald-600 hover:bg-emerald-700",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-900",
    chatUser: "bg-emerald-700",
    chatAssistant: "bg-card border-border",
    colorPreview: "bg-emerald-500",
  },
]

const getSessionsFromMessages = (allMsgs: Message[]): ChatSession[] => {
  const chatSessions: ChatSession[] = []
  let currentSessionMsgs: Message[] = []

  // Filter out system notifications
  const filteredMsgs = allMsgs.filter((m) => m.role !== "system")

  filteredMsgs.forEach((msg, idx) => {
    if (idx === 0) {
      currentSessionMsgs.push(msg)
      return
    }

    const prevMsg = filteredMsgs[idx - 1]
    const timeDiff = msg.timestamp.getTime() - prevMsg.timestamp.getTime()

    if (msg.sessionStart || timeDiff > 30 * 60 * 1000) {
      // Start a new session
      const firstUserMsg = currentSessionMsgs.find((m) => m.role === "user")
      chatSessions.push({
        id: `session_${currentSessionMsgs[0].id}`,
        title: firstUserMsg
          ? firstUserMsg.content.slice(0, 30) +
            (firstUserMsg.content.length > 30 ? "..." : "")
          : "Career Discussion",
        timestamp: currentSessionMsgs[0].timestamp,
        messages: currentSessionMsgs,
      })
      currentSessionMsgs = [msg]
    } else {
      currentSessionMsgs.push(msg)
    }
  })

  if (currentSessionMsgs.length > 0) {
    const firstUserMsg = currentSessionMsgs.find((m) => m.role === "user")
    chatSessions.push({
      id: `session_${currentSessionMsgs[0].id}`,
      title: firstUserMsg
        ? firstUserMsg.content.slice(0, 30) +
          (firstUserMsg.content.length > 30 ? "..." : "")
        : "Career Discussion",
      timestamp: currentSessionMsgs[0].timestamp,
      messages: currentSessionMsgs,
    })
  }

  return chatSessions.reverse() // Newest first
}

export function AiChat({
  onSendMessage,
  isLoading: externalLoading = false,
  userConsent = null,
  onConsentChange,
}: AiChatProps) {
  const { token, user } = useAuth()
  const { viewMode, isRealMobile } = useDeviceMode()
  const isMobileView = viewMode === "mobile" || isRealMobile
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentLoading, setConsentLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Per-User AI Trial Quota Tracking (15 generations max per user account)
  const MAX_AI_TRIALS = 15;
  const [aiTrialsUsed, setAiTrialsUsed] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const quotaKey = `pathfinder:ai-usage-quota:${user?.id || "default"}`;
    const saved = localStorage.getItem(quotaKey);
    setAiTrialsUsed(saved ? parseInt(saved, 10) : 0);
  }, [user?.id]);

  const incrementAiQuota = () => {
    const quotaKey = `pathfinder:ai-usage-quota:${user?.id || "default"}`;
    const nextVal = Math.min(MAX_AI_TRIALS, aiTrialsUsed + 1);
    setAiTrialsUsed(nextVal);
    try {
      localStorage.setItem(quotaKey, nextVal.toString());
    } catch (err) {
      console.error(err);
    }
    return nextVal;
  };

  // Theme state
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_theme") || "pathfinder"
    }
    return "pathfinder"
  })

  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0]
  }, [themeId])

  const focusStyles = {
    sky: "focus:border-sky-500/80 focus:ring-sky-500/20 group-focus-within:text-sky-400",
    teal: "focus:border-teal-500/80 focus:ring-teal-500/20 group-focus-within:text-teal-400",
    amber:
      "focus:border-amber-500/80 focus:ring-amber-500/20 group-focus-within:text-amber-400",
    emerald:
      "focus:border-emerald-500/80 focus:ring-emerald-500/20 group-focus-within:text-emerald-400",
  }
  const currentFocusStyle =
    focusStyles[activeTheme.accent as keyof typeof focusStyles] ||
    focusStyles.sky

  const sendShadowStyles = {
    sky: "hover:shadow-sky-500/10",
    teal: "hover:shadow-teal-500/10",
    amber: "hover:shadow-amber-500/10",
    emerald: "hover:shadow-emerald-500/10",
  }
  const currentSendShadow =
    sendShadowStyles[activeTheme.accent as keyof typeof sendShadowStyles] ||
    sendShadowStyles.sky

  const handleThemeChange = (id: string) => {
    setThemeId(id)
    localStorage.setItem("ai_theme", id)
  }

  // AI Personality state
  const [personality, setPersonality] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_personality") || "mentor"
    }
    return "mentor"
  })

  const activePersonality = useMemo(() => {
    return PERSONALITIES.find((p) => p.id === personality) || PERSONALITIES[0]
  }, [personality])

  // Current session selection state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(
    null
  )
  const [queuedMessage, setQueuedMessage] = useState<{
    text: string
    override?: string
  } | null>(null)

  const handleResetQuota = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Clear all AI quota storage keys to ensure clean demonstration state
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("pathfinder:ai-usage-quota") || key.includes("ai-usage-quota"))) {
          localStorage.removeItem(key);
        }
      }
      const activeKey = `pathfinder:ai-usage-quota:${user?.id || "default"}`;
      localStorage.setItem(activeKey, "0");
    } catch (err) {
      console.error("Failed to reset quota in local storage:", err);
    }
    setAiTrialsUsed(0);
    setRateLimitCountdown(null);
    setQueuedMessage(null);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // Initialize chat with a fresh session and do not pre-load old conversations
  useEffect(() => {
    setActiveSessionId("new")
    setLoadingHistory(false)
  }, [token])

  // Group messages into virtual sessions dynamically based on 30 minutes time gaps
  const sessions = useMemo((): ChatSession[] => {
    return getSessionsFromMessages(messages)
  }, [messages])

  // Handle auto-retry rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown === null) return

    if (rateLimitCountdown <= 0) {
      setRateLimitCountdown(null)
      if (queuedMessage) {
        const msg = queuedMessage
        setQueuedMessage(null)
        handleSendMessage(null, msg.override || msg.text, true)
      } else {
        setSending(false)
      }
      return
    }

    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null) return null
        return Math.max(0, prev - 0.1)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [rateLimitCountdown, queuedMessage])

  // Messages to render in the main panel
  const activeMessages = useMemo(() => {
    if (activeSessionId === "new") return []
    const foundSession = sessions.find((s) => s.id === activeSessionId)
    return foundSession ? foundSession.messages : []
  }, [sessions, activeSessionId])

  // Grouped sessions for history display
  const groupedSessions = useMemo((): GroupedSessions => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const groups: GroupedSessions = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    }

    sessions.forEach((session) => {
      const sessionDate = new Date(session.timestamp)
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      )

      if (sessionDay.getTime() === today.getTime()) {
        groups.today.push(session)
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session)
      } else if (sessionDay.getTime() >= oneWeekAgo.getTime()) {
        groups.lastWeek.push(session)
      } else {
        groups.older.push(session)
      }
    })

    return groups
  }, [sessions])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeMessages])

  const handleConsentResponse = async (agreed: boolean) => {
    setConsentLoading(true)
    try {
      if (onConsentChange) {
        await onConsentChange(agreed)
      }
      setShowConsentModal(false)
    } catch (error) {
      console.error("Failed to update consent:", error)
    } finally {
      setConsentLoading(false)
    }
  }

  const handlePersonalityChange = (newPersonality: string) => {
    setPersonality(newPersonality)
    localStorage.setItem("ai_personality", newPersonality)

    const targetPers = PERSONALITIES.find((p) => p.id === newPersonality)

    // Add visual notification message
    const noticeMessage: Message = {
      id: `system_${Date.now()}`,
      role: "system",
      content: `Personality changed to ${targetPers?.name}.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, noticeMessage])
  }

  const handleSelectOption = async (optionId: string) => {
    const lastMessage = activeMessages[activeMessages.length - 1]
    if (!lastMessage?.options) return

    const selectedOption = lastMessage.options.find(
      (opt) => opt.id === optionId
    )
    if (!selectedOption) return

    // Update the last message to show selected option in local state
    setMessages((prev) => {
      return prev.map((m) => {
        if (m.id === lastMessage.id) {
          return { ...m, selectedOption: optionId }
        }
        return m
      })
    })

    // Send the selected option as a message
    const userMsgId = `msg_${Date.now()}`
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: selectedOption.label,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setSending(true)

    try {
      const response = await onSendMessage(selectedOption.label, personality)

      // Parse response for options and strip any machine-readable JSON blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
      let assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1])

          // Prefer any human-friendly text that appears before the JSON block
          const textBeforeJson = response
            .substring(0, jsonMatch.index || 0)
            .trim()

          // If the JSON contains options, surface them and show only the human text
          if (parsed.options && Array.isArray(parsed.options)) {
            assistantMessage = {
              id: `msg_${Date.now() + 1}`,
              role: "assistant",
              content: textBeforeJson || parsed.message || "",
              timestamp: new Date(),
              options: parsed.options.map((opt: any) => ({
                id: opt.id || opt.label.toLowerCase().replace(/\s+/g, "_"),
                label: opt.label,
                description: opt.description,
              })),
            }
          } else if (parsed.recommendation) {
            // If AI emitted a machine-readable recommendation block, build a concise
            // display string (do NOT display the raw JSON).
            const r = parsed.recommendation
            const title = String(r.title || "Recommendation").trim()
            const short = String(r.summary || r.description || "").trim()
            const shortSummary = short.split("\n")[0].slice(0, 240)
            assistantMessage = {
              id: `msg_${Date.now() + 1}`,
              role: "assistant",
              content: textBeforeJson || `${title} — ${shortSummary}` || title,
              timestamp: new Date(),
            }
          } else {
            // Generic JSON block present but not recognized: show text before block
            assistantMessage = {
              id: `msg_${Date.now() + 1}`,
              role: "assistant",
              content: textBeforeJson || parsed.message || "",
              timestamp: new Date(),
            }
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e)
          // Fallback: remove any fenced JSON blocks from the displayed content
          assistantMessage = {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content: response.replace(/```json[\s\S]*?```/g, "").trim(),
            timestamp: new Date(),
          }
        }
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Persist any structured recommendations that may be present in the raw response
      saveRecommendations(response)
    } catch (error) {
      console.error("Failed to send option message:", error)
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally { 
      setSending(false)
    }
  }

  // ── Career extraction & persistence ────────────────────────────────────────
  const saveRecommendations = async (text: string) => {
    if (!token) return

    // Look for a structured recommendation JSON block first
    const jsonBlockMatch = text.match(/```json\n([\s\S]*?)\n```/)
    let payloads: Array<{
      title: string
      description?: string
      category?: string
      matchPercentage?: number
      salaryRange?: string
    }> = []

    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1])
        if (parsed && parsed.recommendation) {
          const r = parsed.recommendation
          if (r.title) {
            payloads.push({
              title: String(r.title).trim(),
              description: (
                r.summary ||
                r.description ||
                "Recommended by Pathfinder AI."
              )
                .trim()
                .slice(0, 140),
              category: r.category || "AI Recommendation",
              matchPercentage:
                typeof r.matchPercentage === "number"
                  ? r.matchPercentage
                  : undefined,
              salaryRange: r.salaryRange || "",
            })
          }
        }
      } catch (e) {
        console.error("Failed to parse recommendation JSON block:", e)
      }
    }

    // Fallback to heuristic extraction
    if (payloads.length === 0) {
      const { titles, salaryRange, matchPercentage, summary } =
        extractRecommendationMetadata(text)
      if (titles.length === 0) return

      const cleanSummary = summary
        .replace(
          /^(.*?)\s*(Why it matches|Why it fits|Match percentage|Suggested because).*/i,
          "$1"
        )
        .replace(/^\s*\*?\*?\s*/g, "")
        .trim()
        .slice(0, 120)

      payloads = titles.map((t) => ({
        title: t.trim(),
        description: cleanSummary || "Recommended by Pathfinder AI.",
        category: "AI Recommendation",
        matchPercentage,
        salaryRange,
      }))
    }

    const invalidPattern = /^(show|click|view|open|see|try|return|back|next|previous|select|choose)\b/i
    const optionPattern = /\b(option|options|button|buttons)\b/i

    payloads = payloads.filter(
      (p) => !invalidPattern.test(p.title) && !optionPattern.test(p.title)
    )

    await Promise.allSettled(
      payloads.map((p) =>
        fetch("/api/recommendations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: p.title,
            description: p.description,
            category: p.category,
            matchPercentage: p.matchPercentage,
            salaryRange: p.salaryRange,
            reason: "",
          }),
        })
      )
    )

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "pathfinder:recommendations-updated",
        Date.now().toString()
      )
      window.dispatchEvent(new Event("pathfinder:recommendations-updated"))
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  const handleStarterSelect = async (prompt: string) => {
    if (messages.length === 0 && userConsent === false) {
      setShowConsentModal(true)
      return
    }
    await handleSendMessage(null, prompt)
  }

  const handleSendMessage = async (
    e?: React.FormEvent | null,
    messageOverride?: string,
    isRetry?: boolean
  ) => {
    if (e) {
      e.preventDefault()
    }

    const messageText = messageOverride || input
    if (!messageText.trim()) return
    if (sending && !isRetry) return

    if (aiTrialsUsed >= MAX_AI_TRIALS && !isRetry) {
      const limitMsgId = `msg_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_user`,
          role: "user",
          content: messageText,
          timestamp: new Date(),
        },
        {
          id: limitMsgId,
          role: "assistant",
          content: `### AI Free Tier Quota Reached (15/15 Trials Used)\n\nYou have consumed the daily live AI mentorship trial allocation for **${user?.email || "this account"}**.\n\n#### How to Continue Demonstrating Immediately:\n1. **Demonstrate with a Different User:** Log out and sign in with any other user account (or create a brand new test user). **AI trial limits are tracked strictly per user account**, so a new user account starts with 100% fresh AI trial credits!\n2. **Reset Demo Allowance:** Click the **"Reset Quota (Demo)"** button in the dark header bar above to refill this account's trial credits back to 0/15 instantly for your demonstration!\n3. **Upgrade to Pro:** Upgrade to Pathfinder Pro for unlimited continuous streaming and zero daily quotas.`,
          timestamp: new Date(),
        }
      ]);
      if (!messageOverride) setInput("");
      return;
    }

    setSending(true)

    if (!isRetry) {
      const userMsgId = `msg_${Date.now()}`
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: messageText,
        timestamp: new Date(),
        sessionStart: activeSessionId === "new",
      }

      setMessages((prev) => [...prev, userMessage])
      if (!messageOverride) {
        setInput("")
      }

      if (activeSessionId === "new") {
        setActiveSessionId(`session_${userMsgId}`)
      }
    }

    try {
      const response = await onSendMessage(messageText, personality)

      // Parse options
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
      let assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1])
          if (parsed.options && Array.isArray(parsed.options)) {
            const textBeforeJson = response
              .substring(0, jsonMatch.index || 0)
              .trim()
            assistantMessage = {
              id: `msg_${Date.now() + 1}`,
              role: "assistant",
              content: textBeforeJson || parsed.message || "",
              timestamp: new Date(),
              options: parsed.options.map((opt: any) => ({
                id: opt.id || opt.label.toLowerCase().replace(/\s+/g, "_"),
                label: opt.label,
                description: opt.description,
              })),
            }
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e)
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSending(false)
      incrementAiQuota()

      // Silently extract and persist any career recommendations mentioned.
      // Use the original response (may still contain the machine JSON block)
      // so `saveRecommendations` can parse the structured data. The UI will
      // display the cleaned `assistantMessage.content` (without raw JSON).
      saveRecommendations(response)

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("pathfinder:progress-updated"))
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("AI Chat request notice:", errorMsg);

      const isRateLimit =
        errorMsg.includes("429") ||
        errorMsg.includes("rate_limit") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.toLowerCase().includes("free tier") ||
        errorMsg.toLowerCase().includes("limit");

      if (isRateLimit) {
        const limitMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: `### AI Free Tier Quota Reached\n\nThe live AI mentorship service experienced a temporary capacity or rate limit.\n\n#### How to Continue Demonstrating Immediately:\n1. **Retry in a few seconds:** Our backend automatically switches between high-capacity AI models, so simply try sending your message again!\n2. **Demonstrate with a Different User:** Log out and sign in with any other user account (or create a brand new test user). **AI trial limits are tracked strictly per user account**, so a new user account starts with 100% fresh AI trial credits!\n3. **Reset Demo Allowance:** Click the **"Reset Quota (Demo)"** button in the dark header bar above to refill this account's trial credits back to 0/15 instantly for your demonstration!\n4. **Upgrade to Pro:** Upgrade to Pathfinder Pro for unlimited continuous streaming and zero daily quotas.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, limitMessage]);
        setSending(false);
      } else {
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setSending(false)
      }
    }
  }

  const handleNewChat = () => {
    setActiveSessionId("new")
    setSidebarOpen(false)
  }

  const renderHistoryCategory = (title: string, list: ChatSession[]) => {
    if (list.length === 0) return null
    return (
      <div className="mt-4 space-y-1.5">
        <p className="mb-1.5 px-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {title}
        </p>
        {list.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setActiveSessionId(session.id)
              setSidebarOpen(false)
            }}
            className={`flex w-full items-center gap-2.5 truncate rounded-xl p-2.5 text-left text-xs transition-all ${
              activeSessionId === session.id
                ? "border border-border/50 bg-slate-800/80 font-semibold text-white shadow-inner"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            }`}
          >
            <MessageSquare
              className={`h-3.5 w-3.5 flex-shrink-0 ${activeSessionId === session.id ? activeTheme.accentText : "text-muted-foreground"}`}
            />
            <span className="truncate">{session.title}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className={`flex h-full w-full max-w-full overflow-hidden ${activeTheme.bg} font-sans text-white transition-all duration-300 relative rounded-2xl border border-slate-800/80 shadow-2xl`}
    >
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsentResponse}
        isLoading={consentLoading}
      />

      {/* SIDEBAR - Desktop / Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-xs flex-col ${activeTheme.sidebar} border-r transition-transform duration-300 ${
          !isMobileView ? "lg:static lg:w-72 lg:translate-x-0" : ""
        } ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Pathfinder AI" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Pathfinder AI
              </span>
              <span className="block text-xs font-medium text-muted-foreground">
                Career advisor
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-white ${
              !isMobileView ? "lg:hidden" : ""
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className={`w-full rounded-xl ${activeTheme.accentBg} flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-98`}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          {/* Theme Selector swatch list */}
          <div className="space-y-2 px-1">
            <span className="text-xs font-bold text-muted-foreground">
              Choose Theme
            </span>
            <div className="flex items-center gap-2 pt-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  title={theme.name}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                    themeId === theme.id
                      ? "scale-110 border-slate-100 shadow-md"
                      : "border-border hover:border-input"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full ${theme.colorPreview}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* AI Personality Selection */}
          <div className="space-y-2.5">
            <div className="px-1">
              <span className="text-xs font-bold text-muted-foreground">
                AI Persona Model
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((pers) => (
                <button
                  key={pers.id}
                  onClick={() => handlePersonalityChange(pers.id)}
                  title={pers.description}
                  className={`relative flex h-20 flex-col justify-between rounded-xl border p-2.5 text-left shadow-sm transition-all ${
                    personality === pers.id
                      ? `border-${activeTheme.accent}-500 bg-slate-800/80`
                      : "border-border bg-slate-800/20 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`w-fit rounded-lg p-1.5 ${pers.color} text-white shadow-sm`}
                  >
                    {pers.icon}
                  </div>
                  <span className="mt-1 text-xs leading-tight font-bold text-foreground">
                    {pers.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* History Tab */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 py-1">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">
                Conversation History
              </span>
            </div>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="mt-2 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No past discussions saved.
                </div>
              ) : (
                <>
                  {renderHistoryCategory("Today", groupedSessions.today)}
                  {renderHistoryCategory(
                    "Yesterday",
                    groupedSessions.yesterday
                  )}
                  {renderHistoryCategory(
                    "Previous 7 Days",
                    groupedSessions.lastWeek
                  )}
                  {renderHistoryCategory("Older", groupedSessions.older)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Back to Dashboard */}
        <div className="border-t border-slate-800/80 bg-slate-900/20 p-4">
          <Link href="/dashboard">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Hub
            </button>
          </Link>
        </div>
      </div>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${
            !isMobileView ? "lg:hidden" : ""
          }`}
        />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950/20">
        {/* Chat Header & Mobile Quick Controls */}
        <header
          className={`sticky top-0 z-30 flex flex-col border-b ${activeTheme.header} backdrop-blur-md`}
        >
          <div className="flex items-center justify-between px-3 py-2 sm:px-6 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-transparent">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Hub</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors ${
                  !isMobileView ? "lg:hidden" : ""
                }`}
              >
                <Menu className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Menu</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${activePersonality.color} text-white shadow-xs`}>
                {activePersonality.icon}
              </div>
              <div className="text-right sm:text-left">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-foreground truncate max-w-[130px] sm:max-w-none">
                  {activePersonality.name}
                </h2>
                <span className="hidden sm:block text-xs font-medium text-slate-500 dark:text-muted-foreground">
                  {activePersonality.description}
                </span>
              </div>
            </div>
          </div>

          {/* Quick AI Coach Selector Strip (Visible on mobile & desktop for easy coach switching) */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 no-scrollbar bg-slate-100/90 dark:bg-slate-950/40 border-t border-slate-200/60 dark:border-slate-800/50">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 shrink-0 mr-1">Choose Coach:</span>
            {PERSONALITIES.map((p) => {
              const isSelected = activePersonality.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonalityChange(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-teal-600 border-teal-500 text-white shadow-sm font-black"
                      : "bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className={`p-0.5 rounded-full ${isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                    {p.icon}
                  </span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Per-User AI Quota Tracker & Alert Banner */}
          <div className="px-4 py-2.5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-teal-400">
                AI Trial Quota: {aiTrialsUsed} / {MAX_AI_TRIALS} Used
              </span>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all ${
                    aiTrialsUsed >= MAX_AI_TRIALS ? "bg-red-500" : aiTrialsUsed >= 12 ? "bg-amber-400" : "bg-emerald-400"
                  }`} 
                  style={{ width: `${Math.min(100, (aiTrialsUsed / MAX_AI_TRIALS) * 100)}%` }} 
                />
              </div>
              {aiTrialsUsed >= 12 && aiTrialsUsed < MAX_AI_TRIALS && (
                <span className="text-amber-300 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                  Notice: Quota Almost Reached (80% used for this account)
                </span>
              )}
              {aiTrialsUsed >= MAX_AI_TRIALS && (
                <span className="text-red-300 font-bold bg-red-400/10 px-2.5 py-0.5 rounded border border-red-400/30">
                  Limit Reached: Log into another test user for fresh trials or click Reset
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 hidden md:inline">Isolated per user account</span>
              <button
                type="button"
                onClick={handleResetQuota}
                className={`text-[11px] px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 border ${
                  resetSuccess 
                    ? "bg-emerald-600 text-white border-emerald-500" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 active:scale-95"
                }`}
                title="Reset this user's trial quota for demonstration purposes"
              >
                <RotateCcw className={`h-3 w-3 ${resetSuccess ? "animate-spin text-white" : "text-teal-400"}`} />
                <span>{resetSuccess ? "Quota Reset to 0!" : "Reset Quota (Demo)"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-transparent px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {loadingHistory ? (
              <div className="animate-fadeIn flex h-64 flex-col items-center justify-center px-4 py-12 text-center">
                <div className="space-y-4">
                  <div className="relative mx-auto h-9 w-9">
                    <div className="absolute inset-0 rounded-full border border-border"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-sky-500 border-r-sky-500"></div>
                  </div>
                  <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Syncing Secure History...
                  </p>
                </div>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="animate-fadeIn flex flex-col items-center justify-center px-4 py-10 text-center">
                <h1 className="text-center text-2xl font-black text-slate-900 dark:text-white">Pathfinder AI</h1>

                {/* Chat Starters - Three compact cards */}
                <div className="w-full pt-6">
                  <ChatStarters
                    onSelect={handleStarterSelect}
                    isLoading={sending}
                  />
                </div>
              </div>
            ) : null}

            {activeMessages.map((message) => {
              if (message.role === "system") {
                return (
                  <div key={message.id} className="my-2.5 flex justify-center">
                    <span className="rounded-full border border-slate-800/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      {message.content}
                    </span>
                  </div>
                )
              }

              return (
                <div key={message.id} className="animate-fadeIn space-y-1">
                  <div
                    className={`flex items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Assistant Bot Avatar */}
                    {message.role === "assistant" && (
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${activeTheme.chatAssistant} border shadow-md`}
                      >
                        <div
                          className={`rounded-lg p-1.5 ${activePersonality.color} text-white`}
                        >
                          {activePersonality.icon}
                        </div>
                      </div>
                    )}

                    <div
                      className={`w-fit max-w-xl rounded-2xl shadow-sm transition-all duration-300 md:max-w-2xl ${
                        message.role === "user"
                          ? `rounded-tr-none ${activeTheme.chatUser} px-4 py-2.5 text-sm font-medium text-white`
                          : `rounded-tl-none ${activeTheme.chatAssistant} border px-4 py-2.5 text-sm text-card-foreground`
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-card-foreground">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      ) : (
                        <p className="leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar */}
                    {message.role === "user" && (
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${activeTheme.chatUser} text-sm font-extrabold text-white uppercase shadow-md`}
                      >
                        {user?.name ? user.name.charAt(0) : "U"}
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp */}
                  <div
                    className={`flex px-11 text-xs font-bold text-slate-600 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Option Buttons */}
                  {message.options &&
                    message.options.length > 0 &&
                    !message.selectedOption && (
                      <div className="flex justify-start pl-11">
                        <div className="w-full max-w-xl">
                          <ChatOptions
                            options={message.options}
                            onSelect={handleSelectOption}
                            isLoading={sending}
                            themeAccent={activeTheme.accent as any}
                          />
                        </div>
                      </div>
                    )}
                </div>
              )
            })}

            {sending && rateLimitCountdown === null && (
              <div className="animate-fadeIn flex justify-start pl-11">
                <div
                  className={`flex gap-1.5 px-3.5 py-2.5 ${activeTheme.chatAssistant} rounded-xl border`}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${activeTheme.colorPreview || "bg-teal-500"} animate-bounce`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {rateLimitCountdown !== null && (
              <div className="animate-fadeIn flex justify-start pl-11">
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-800/60 bg-amber-950/40 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-md">
                  <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-amber-800"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-amber-400 border-r-amber-400"></div>
                  </div>
                  <span>
                    Rate limit hit. Retrying automatically in{" "}
                    {rateLimitCountdown.toFixed(1)}s...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`border-t ${activeTheme.accentBorder} ${activeTheme.header} px-3 py-3 sm:px-6 sm:py-4 bg-white dark:bg-slate-950/90 shrink-0`}
        >
          <form
            onSubmit={handleSendMessage}
            className="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3"
          >
            <div className="group relative flex flex-1 items-center min-w-0">
              <div
                className={`absolute left-3.5 ${activeTheme.accentText} pointer-events-none transition-colors hidden sm:block`}
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${activePersonality.name}...`}
                disabled={sending || externalLoading}
                className={`w-full rounded-xl ${activeTheme.chatAssistant} border border-slate-200 dark:border-slate-700 py-3 px-3 sm:pl-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:ring-2 focus:outline-none ${currentFocusStyle} shadow-inner transition-all duration-300 disabled:opacity-50 min-w-0 bg-slate-50 dark:bg-slate-900`}
              />
            </div>
            <button
              type="submit"
              disabled={sending || externalLoading || !input.trim()}
              className={`group rounded-xl ${activeTheme.accentBg} px-4 sm:px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all duration-300 active:scale-95 ${currentSendShadow} flex items-center gap-1.5 shrink-0 disabled:opacity-50`}
            >
              {sending || externalLoading ? (
                <Loader className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <>
                  <span className="inline">Ask AI</span>
                  <Send className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </>
              )}
            </button>
          </form>
          <div
            className={`mx-auto mt-1.5 max-w-3xl text-center text-[11px] ${activeTheme.accentText} font-medium opacity-60 truncate`}
          >
            Pathfinder AI can make mistakes. Verify important decisions.
          </div>
        </div>
      </div>
    </div>
  )
}
