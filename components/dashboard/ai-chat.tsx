"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { ChatOptions, ChatOption } from "./chat-options";
import { ConsentModal } from "./consent-modal";
import { ChatStarters } from "./chat-starters";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  selectedOption?: string;
  sessionStart?: boolean;
}

interface AiChatProps {
  onSendMessage: (message: string, personality?: string) => Promise<string>;
  isLoading?: boolean;
  userConsent?: boolean | null;
  onConsentChange?: (consented: boolean) => Promise<void>;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface GroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  lastWeek: ChatSession[];
  older: ChatSession[];
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
];

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
    bg: "bg-slate-950",
    sidebar: "bg-slate-900 border-slate-800",
    header: "bg-slate-950 border-slate-800",
    accent: "teal",
    accentBg: "bg-teal-600 hover:bg-teal-700",
    accentText: "text-teal-400",
    accentBorder: "border-teal-800",
    chatUser: "bg-teal-700",
    chatAssistant: "bg-slate-900 border-slate-800",
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
    chatAssistant: "bg-slate-900 border-slate-800",
    colorPreview: "bg-emerald-500",
  },
];

const getSessionsFromMessages = (allMsgs: Message[]): ChatSession[] => {
  const chatSessions: ChatSession[] = [];
  let currentSessionMsgs: Message[] = [];

  // Filter out system notifications
  const filteredMsgs = allMsgs.filter((m) => m.role !== "system");

  filteredMsgs.forEach((msg, idx) => {
    if (idx === 0) {
      currentSessionMsgs.push(msg);
      return;
    }

    const prevMsg = filteredMsgs[idx - 1];
    const timeDiff = msg.timestamp.getTime() - prevMsg.timestamp.getTime();

    if (msg.sessionStart || timeDiff > 30 * 60 * 1000) {
      // Start a new session
      const firstUserMsg = currentSessionMsgs.find((m) => m.role === "user");
      chatSessions.push({
        id: `session_${currentSessionMsgs[0].id}`,
        title: firstUserMsg ? firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "") : "Career Discussion",
        timestamp: currentSessionMsgs[0].timestamp,
        messages: currentSessionMsgs,
      });
      currentSessionMsgs = [msg];
    } else {
      currentSessionMsgs.push(msg);
    }
  });

  if (currentSessionMsgs.length > 0) {
    const firstUserMsg = currentSessionMsgs.find((m) => m.role === "user");
    chatSessions.push({
      id: `session_${currentSessionMsgs[0].id}`,
      title: firstUserMsg ? firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "") : "Career Discussion",
      timestamp: currentSessionMsgs[0].timestamp,
      messages: currentSessionMsgs,
    });
  }

  return chatSessions.reverse(); // Newest first
};

export function AiChat({
  onSendMessage,
  isLoading: externalLoading = false,
  userConsent = null,
  onConsentChange,
}: AiChatProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme state
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_theme") || "pathfinder";
    }
    return "pathfinder";
  });

  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0];
  }, [themeId]);

  const focusStyles = {
    sky: "focus:border-sky-500/80 focus:ring-sky-500/20 group-focus-within:text-sky-400",
    teal: "focus:border-teal-500/80 focus:ring-teal-500/20 group-focus-within:text-teal-400",
    amber: "focus:border-amber-500/80 focus:ring-amber-500/20 group-focus-within:text-amber-400",
    emerald: "focus:border-emerald-500/80 focus:ring-emerald-500/20 group-focus-within:text-emerald-400",
  };
  const currentFocusStyle = focusStyles[activeTheme.accent as keyof typeof focusStyles] || focusStyles.sky;

  const sendShadowStyles = {
    sky: "hover:shadow-sky-500/10",
    teal: "hover:shadow-teal-500/10",
    amber: "hover:shadow-amber-500/10",
    emerald: "hover:shadow-emerald-500/10",
  };
  const currentSendShadow = sendShadowStyles[activeTheme.accent as keyof typeof sendShadowStyles] || sendShadowStyles.sky;

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    localStorage.setItem("ai_theme", id);
  };

  // AI Personality state
  const [personality, setPersonality] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_personality") || "mentor";
    }
    return "mentor";
  });

  const activePersonality = useMemo(() => {
    return PERSONALITIES.find((p) => p.id === personality) || PERSONALITIES[0];
  }, [personality]);

  // Current session selection state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<{ text: string; override?: string } | null>(null);

  // Load chat history from backend on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/ai/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const parsedMessages: Message[] = data.data.map((msg: any) => {
              let options;
              let content = msg.content;
              if (msg.role === "assistant") {
                const jsonMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                  try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    if (parsed.options && Array.isArray(parsed.options)) {
                      content = msg.content.substring(0, jsonMatch.index || 0).trim() || parsed.message || "";
                      options = parsed.options.map((opt: any) => ({
                        id: opt.id || opt.label.toLowerCase().replace(/\s+/g, "_"),
                        label: opt.label,
                        description: opt.description,
                      }));
                    }
                  } catch (e) {
                    console.error("Failed to parse options in history load:", e);
                  }
                }
              }
              return {
                id: msg.id,
                role: msg.role as any,
                content,
                timestamp: new Date(msg.timestamp),
                options,
              };
            });

            // Mark older options as selected to prevent interactive buttons on old segments
            if (parsedMessages.length > 0) {
              const lastAssistantIdx = parsedMessages.map((m: Message) => m.role).lastIndexOf("assistant");
              parsedMessages.forEach((m: Message, idx: number) => {
                if (m.options && idx !== lastAssistantIdx) {
                  m.selectedOption = "historical";
                }
              });
            }

            setMessages(parsedMessages);

            const computedSessions = getSessionsFromMessages(parsedMessages);
            if (computedSessions.length > 0) {
              setActiveSessionId(computedSessions[0].id);
            } else {
              setActiveSessionId("new");
            }
          }
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
        setActiveSessionId("new");
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [token]);

  // Group messages into virtual sessions dynamically based on 30 minutes time gaps
  const sessions = useMemo((): ChatSession[] => {
    return getSessionsFromMessages(messages);
  }, [messages]);

  // Handle auto-retry rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown === null) return;

    if (rateLimitCountdown <= 0) {
      setRateLimitCountdown(null);
      if (queuedMessage) {
        const msg = queuedMessage;
        setQueuedMessage(null);
        handleSendMessage(null, msg.override || msg.text, true);
      } else {
        setSending(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [rateLimitCountdown, queuedMessage]);


  // Messages to render in the main panel
  const activeMessages = useMemo(() => {
    if (activeSessionId === "new") return [];
    const foundSession = sessions.find((s) => s.id === activeSessionId);
    return foundSession ? foundSession.messages : [];
  }, [sessions, activeSessionId]);

  // Grouped sessions for history display
  const groupedSessions = useMemo((): GroupedSessions => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const groups: GroupedSessions = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    sessions.forEach((session) => {
      const sessionDate = new Date(session.timestamp);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      if (sessionDay.getTime() === today.getTime()) {
        groups.today.push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session);
      } else if (sessionDay.getTime() >= oneWeekAgo.getTime()) {
        groups.lastWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleConsentResponse = async (agreed: boolean) => {
    setConsentLoading(true);
    try {
      if (onConsentChange) {
        await onConsentChange(agreed);
      }
      setShowConsentModal(false);
    } catch (error) {
      console.error("Failed to update consent:", error);
    } finally {
      setConsentLoading(false);
    }
  };

  const handlePersonalityChange = (newPersonality: string) => {
    setPersonality(newPersonality);
    localStorage.setItem("ai_personality", newPersonality);

    const targetPers = PERSONALITIES.find((p) => p.id === newPersonality);

    // Add visual notification message
    const noticeMessage: Message = {
      id: `system_${Date.now()}`,
      role: "system",
      content: `Personality changed to ${targetPers?.name}.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, noticeMessage]);
  };

  const handleSelectOption = async (optionId: string) => {
    const lastMessage = activeMessages[activeMessages.length - 1];
    if (!lastMessage?.options) return;

    const selectedOption = lastMessage.options.find((opt) => opt.id === optionId);
    if (!selectedOption) return;

    // Update the last message to show selected option in local state
    setMessages((prev) => {
      return prev.map((m) => {
        if (m.id === lastMessage.id) {
          return { ...m, selectedOption: optionId };
        }
        return m;
      });
    });

    // Send the selected option as a message
    const userMsgId = `msg_${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: selectedOption.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const response = await onSendMessage(selectedOption.label, personality);

      // Parse response for options
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      let assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.options && Array.isArray(parsed.options)) {
            const textBeforeJson = response.substring(0, jsonMatch.index || 0).trim();
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
            };
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send option message:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleStarterSelect = async (prompt: string) => {
    if (messages.length === 0 && userConsent === false) {
      setShowConsentModal(true);
      return;
    }
    await handleSendMessage(null, prompt);
  };

  const handleSendMessage = async (
    e?: React.FormEvent | null,
    messageOverride?: string,
    isRetry?: boolean
  ) => {
    if (e) {
      e.preventDefault();
    }

    const messageText = messageOverride || input;
    if (!messageText.trim()) return;
    if (sending && !isRetry) return;

    setSending(true);

    if (!isRetry) {
      const userMsgId = `msg_${Date.now()}`;
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: messageText,
        timestamp: new Date(),
        sessionStart: activeSessionId === "new",
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!messageOverride) {
        setInput("");
      }

      if (activeSessionId === "new") {
        setActiveSessionId(`session_${userMsgId}`);
      }
    }

    try {
      const response = await onSendMessage(messageText, personality);

      // Parse options
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      let assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.options && Array.isArray(parsed.options)) {
            const textBeforeJson = response.substring(0, jsonMatch.index || 0).trim();
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
            };
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }

      setMessages((prev) => [...prev, assistantMessage]);
      setSending(false);
    } catch (error) {
      console.error("Failed to send message:", error);

      const errorMsg = error instanceof Error ? error.message : "";
      const isRateLimit = errorMsg.includes("429") || errorMsg.includes("rate_limit");

      if (isRateLimit) {
        // Extract wait duration
        const match = errorMsg.match(/try again in ([0-9.]+)\s*s/i) || errorMsg.match(/try again in ([0-9.]+)\s*seconds/i);
        const retrySec = match ? parseFloat(match[1]) : 10;

        setRateLimitCountdown(retrySec);
        setQueuedMessage({ text: messageText, override: messageOverride });
      } else {
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setSending(false);
      }
    }
  };

  const handleNewChat = () => {
    setActiveSessionId("new");
    setSidebarOpen(false);
  };

  const renderHistoryCategory = (title: string, list: ChatSession[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1.5 mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">{title}</p>
        {list.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setActiveSessionId(session.id);
              setSidebarOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl text-xs truncate flex items-center gap-2.5 transition-all ${activeSessionId === session.id
                ? "bg-slate-800/80 text-white font-semibold shadow-inner border border-slate-700/50"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
              }`}
          >
            <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${activeSessionId === session.id ? activeTheme.accentText : "text-slate-500"}`} />
            <span className="truncate">{session.title}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${activeTheme.bg} text-white font-sans transition-all duration-300`}>
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsentResponse}
        isLoading={consentLoading}
      />

      {/* SIDEBAR - Desktop / Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col ${activeTheme.sidebar} border-r transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${activeTheme.chatUser} shadow-lg shadow-teal-500/10`}>
              <span className="text-base font-black text-white">P</span>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-100">Pathfinder AI</span>
              <span className="block text-xs text-slate-400 font-medium">Career advisor</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className={`w-full rounded-xl ${activeTheme.accentBg} text-white py-2.5 px-4 flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-md active:scale-98`}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          {/* Theme Selector swatch list */}
          <div className="space-y-2 px-1">
            <span className="text-xs font-bold text-slate-500">Choose Theme</span>
            <div className="flex items-center gap-2 pt-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  title={theme.name}
                  className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center ${themeId === theme.id ? "border-slate-100 scale-110 shadow-md" : "border-slate-800 hover:border-slate-600"
                    }`}
                >
                  <span className={`h-5 w-5 rounded-full ${theme.colorPreview}`} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Personality Selection */}
          <div className="space-y-2.5">
            <div className="px-1">
              <span className="text-xs font-bold text-slate-500 ">AI Persona Model</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((pers) => (
                <button
                  key={pers.id}
                  onClick={() => handlePersonalityChange(pers.id)}
                  title={pers.description}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 shadow-sm ${personality === pers.id
                      ? `border-${activeTheme.accent}-500 bg-slate-800/80 ring-1 ring-${activeTheme.accent}-500/20`
                      : "border-slate-800 bg-slate-800/20 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                >
                  <div className={`p-1.5 rounded-lg w-fit ${pers.color} text-white shadow-sm`}>
                    {pers.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-100 leading-tight mt-1">{pers.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History Tab */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 py-1">
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 ">Conversation History</span>
            </div>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl mt-2">
                  No past discussions saved.
                </div>
              ) : (
                <>
                  {renderHistoryCategory("Today", groupedSessions.today)}
                  {renderHistoryCategory("Yesterday", groupedSessions.yesterday)}
                  {renderHistoryCategory("Previous 7 Days", groupedSessions.lastWeek)}
                  {renderHistoryCategory("Older", groupedSessions.older)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Back to Dashboard */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <Link href="/dashboard">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:text-white text-xs font-bold text-slate-400 transition-all">
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950/20">
        {/* Chat Header */}
        <header className={`sticky top-0 z-30 flex items-center justify-between border-b ${activeTheme.header} px-4 py-2.5 sm:px-6 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${activePersonality.color} text-white shadow-sm`}>
                {activePersonality.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">{activePersonality.name}</h2>
                <span className="block text-xs text-slate-500 font-medium">{activePersonality.description}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 custom-scrollbar bg-transparent">
          <div className="max-w-3xl mx-auto space-y-6">
            {loadingHistory ? (
              <div className="flex h-64 flex-col items-center justify-center text-center py-12 px-4 animate-fadeIn">
                <div className="space-y-4">
                  <div className="relative w-9 h-9 mx-auto">
                    <div className="absolute inset-0 rounded-full border border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border border-transparent border-t-sky-500 border-r-sky-500 animate-spin"></div>
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Secure History...</p>
                </div>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fadeIn">
          

          <h1 className="text-center font-bold text-xl">PathFinder Ai</h1>   

                {/* Chat Starters - Three compact cards */}
                <div className="w-full pt-6">
                  <ChatStarters onSelect={handleStarterSelect} isLoading={sending} />
                </div>
              </div>
            ) : null}

            {activeMessages.map((message) => {
              if (message.role === "system") {
                return (
                  <div key={message.id} className="flex justify-center my-2.5">
                    <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {message.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={message.id} className="animate-fadeIn space-y-1">
                  <div className={`flex items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {/* Assistant Bot Avatar */}
                    {message.role === "assistant" && (
                      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl ${activeTheme.chatAssistant} shadow-md border`}>
                        <div className={`p-1.5 rounded-lg ${activePersonality.color} text-white`}>
                          {activePersonality.icon}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-xl md:max-w-2xl shadow-sm rounded-2xl transition-all duration-300 w-fit ${message.role === "user"
                          ? `rounded-tr-none ${activeTheme.chatUser} px-4 py-2.5 text-white text-sm font-medium`
                          : `rounded-tl-none ${activeTheme.chatAssistant} px-4 py-2.5 text-sm text-slate-200 border`
                        }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      ) : (
                        <p className="leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar */}
                    {message.role === "user" && (
                      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${activeTheme.chatUser} shadow-md text-white font-extrabold text-sm uppercase`}>
                        {user?.name ? user.name.charAt(0) : "U"}
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp */}
                  <div className={`flex text-xs text-slate-600 font-bold px-11 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Option Buttons */}
                  {message.options && message.options.length > 0 && !message.selectedOption && (
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
              );
            })}

            {sending && rateLimitCountdown === null && (
              <div className="flex justify-start animate-fadeIn pl-11">
                <div className={`flex gap-1.5 px-3.5 py-2.5 ${activeTheme.chatAssistant} border rounded-xl`}>
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
              <div className="flex justify-start animate-fadeIn pl-11">
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs font-bold shadow-md">
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-amber-800"></div>
                    <div className="absolute inset-0 rounded-full border border-transparent border-t-amber-400 border-r-amber-400 animate-spin"></div>
                  </div>
                  <span>Rate limit hit. Retrying automatically in {rateLimitCountdown.toFixed(1)}s...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`border-t ${activeTheme.accentBorder} ${activeTheme.header} px-4 py-4 sm:px-6`}>
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
            <div className="relative flex-1 flex items-center group">
              <div className={`absolute left-4 ${activeTheme.accentText} transition-colors pointer-events-none`}>
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Query Pathfinder as a ${activePersonality.name}...`}
                disabled={sending || externalLoading}
                className={`w-full rounded-xl ${activeTheme.chatAssistant} border pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 ${currentFocusStyle} transition-all duration-300 disabled:opacity-50 shadow-inner`}
              />
            </div>
            <button
              type="submit"
              disabled={sending || externalLoading || !input.trim()}
              className={`group rounded-xl ${activeTheme.accentBg} px-5 py-3 text-white font-bold text-sm shadow-md active:scale-95 transition-all duration-300 ${currentSendShadow} disabled:opacity-50 flex items-center gap-2`}
            >
              {sending || externalLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Ask AI</span>
                  <Send className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
          <div className={`max-w-3xl mx-auto mt-2 text-center text-xs ${activeTheme.accentText} opacity-60 font-medium`}>
            Pathfinder AI can make mistakes. Verify important career and learning decisions.
          </div>
        </div>
      </div>
    </div>
  );
}
