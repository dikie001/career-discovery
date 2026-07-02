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
    color: "from-teal-500 to-cyan-500",
    textBg: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  },
  {
    id: "coach",
    name: "Warm Coach",
    description: "Empathetic, warm, informal, & soft-skills focused",
    icon: <Smile className="h-3.5 w-3.5" />,
    color: "from-rose-500 to-pink-500",
    textBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  },
  {
    id: "analyst",
    name: "Direct Analyst",
    description: "Straight-to-the-point, metrics, salaries, & ROI focused",
    icon: <BarChart2 className="h-3.5 w-3.5" />,
    color: "from-amber-500 to-orange-500",
    textBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  {
    id: "pivot",
    name: "Creative Pivoter",
    description: "Lateral thinking, transferable skills, & transition advice",
    icon: <Compass className="h-3.5 w-3.5" />,
    color: "from-purple-500 to-indigo-500",
    textBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  },
];

const THEMES = [
  {
    id: "slate",
    name: "Obsidian Teal",
    bg: "from-slate-950 via-slate-900 to-slate-950",
    sidebar: "bg-slate-900/90 border-slate-800/80",
    header: "bg-slate-950/60 border-slate-800/80",
    accent: "teal",
    accentBg: "bg-teal-600 hover:bg-teal-700",
    accentText: "text-teal-400",
    accentBorder: "border-teal-500/20",
    chatUser: "bg-gradient-to-r from-teal-600 to-cyan-600",
    chatAssistant: "bg-slate-900/60 border-slate-800/80 backdrop-blur-md",
    colorPreview: "bg-teal-500",
  },
  {
    id: "sepia",
    name: "Warm Sepia",
    bg: "from-stone-950 via-stone-900 to-stone-950",
    sidebar: "bg-stone-900/90 border-stone-800/80",
    header: "bg-stone-950/60 border-stone-800/80",
    accent: "amber",
    accentBg: "bg-amber-600 hover:bg-amber-700",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/20",
    chatUser: "bg-gradient-to-r from-amber-600 to-orange-600",
    chatAssistant: "bg-stone-900/60 border-stone-800/80 backdrop-blur-md",
    colorPreview: "bg-amber-500",
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    bg: "from-zinc-950 via-zinc-900 to-zinc-950",
    sidebar: "bg-zinc-900/90 border-zinc-800/80",
    header: "bg-zinc-950/60 border-zinc-800/80",
    accent: "sky",
    accentBg: "bg-sky-600 hover:bg-sky-700",
    accentText: "text-sky-400",
    accentBorder: "border-sky-500/20",
    chatUser: "bg-gradient-to-r from-sky-600 to-blue-600",
    chatAssistant: "bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md",
    colorPreview: "bg-sky-500",
  },
  {
    id: "emerald",
    name: "Jade Executive",
    bg: "from-slate-950 via-emerald-950/30 to-slate-950",
    sidebar: "bg-slate-900/95 border-emerald-950/40",
    header: "bg-slate-950/60 border-emerald-950/40",
    accent: "emerald",
    accentBg: "bg-emerald-600 hover:bg-emerald-700",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/20",
    chatUser: "bg-gradient-to-r from-emerald-600 to-teal-600",
    chatAssistant: "bg-slate-900/60 border-slate-800/80 backdrop-blur-md",
    colorPreview: "bg-emerald-500",
  },
];

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
      return localStorage.getItem("ai_theme") || "slate";
    }
    return "slate";
  });

  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0];
  }, [themeId]);

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
          }
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    };
    fetchHistory();
  }, [token]);

  // Group messages into virtual sessions dynamically based on 30 minutes time gaps
  const sessions = useMemo((): ChatSession[] => {
    const chatSessions: ChatSession[] = [];
    let currentSessionMsgs: Message[] = [];

    // Filter out system notifications
    const filteredMsgs = messages.filter((m) => m.role !== "system");

    filteredMsgs.forEach((msg, idx) => {
      if (idx === 0) {
        currentSessionMsgs.push(msg);
        return;
      }

      const prevMsg = filteredMsgs[idx - 1];
      const timeDiff = msg.timestamp.getTime() - prevMsg.timestamp.getTime();

      if (timeDiff > 30 * 60 * 1000) {
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
  }, [messages]);

  // Set default active session to the latest session if available, else new
  useEffect(() => {
    if (messages.length > 0) {
      if (!activeSessionId) {
        const computedSessions = sessions;
        if (computedSessions.length > 0) {
          setActiveSessionId(computedSessions[0].id);
        }
      }
    } else {
      setActiveSessionId("new");
    }
  }, [messages, activeSessionId, sessions]);

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

  const handleSendMessage = async (e?: React.FormEvent | null, messageOverride?: string) => {
    if (e) {
      e.preventDefault();
    }

    const messageText = messageOverride || input;
    if (!messageText.trim() || sending) return;

    const userMsgId = `msg_${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageOverride) {
      setInput("");
    }
    setSending(true);

    if (activeSessionId === "new") {
      setActiveSessionId(`session_${userMsgId}`);
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
    } catch (error) {
      console.error("Failed to send message:", error);
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

  const handleNewChat = () => {
    setActiveSessionId("new");
    setSidebarOpen(false);
  };

  const renderHistoryCategory = (title: string, list: ChatSession[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1.5 mt-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">{title}</p>
        {list.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setActiveSessionId(session.id);
              setSidebarOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl text-xs truncate flex items-center gap-2.5 transition-all ${
              activeSessionId === session.id
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
    <div className={`flex h-screen w-screen overflow-hidden bg-gradient-to-br ${activeTheme.bg} text-white font-sans transition-all duration-300`}>
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsentResponse}
        isLoading={consentLoading}
      />

      {/* SIDEBAR - Desktop / Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col ${activeTheme.sidebar} border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${activeTheme.chatUser} shadow-lg shadow-teal-500/10`}>
              <span className="text-base font-black text-white">P</span>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-100">Pathfinder AI</span>
              <span className="block text-[10px] text-slate-400 font-medium">Enterprise Assistant</span>
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
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enterprise Colorways</span>
            <div className="flex items-center gap-2 pt-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  title={theme.name}
                  className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    themeId === theme.id ? "border-slate-100 scale-110 shadow-md" : "border-slate-800 hover:border-slate-600"
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
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Persona Model</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((pers) => (
                <button
                  key={pers.id}
                  onClick={() => handlePersonalityChange(pers.id)}
                  title={pers.description}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 shadow-sm ${
                    personality === pers.id
                      ? `border-${activeTheme.accent}-500 bg-slate-800/80 ring-1 ring-${activeTheme.accent}-500/20`
                      : "border-slate-800 bg-slate-800/20 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg w-fit bg-gradient-to-br ${pers.color} text-white shadow-sm`}>
                    {pers.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-100 leading-tight mt-1">{pers.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History Tab */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 py-1">
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversation Log</span>
            </div>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-500 border border-dashed border-slate-800 rounded-xl mt-2">
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
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${activePersonality.color} text-white shadow-sm`}>
                {activePersonality.icon}
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-100">{activePersonality.name}</h2>
                <span className="block text-[9px] text-slate-500 font-medium">{activePersonality.description}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 custom-scrollbar bg-transparent">
          <div className="max-w-3xl mx-auto space-y-6">
            {activeMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fadeIn">
                <div className="mb-6 relative">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${activeTheme.chatUser} opacity-10 blur-xl scale-125`} />
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activeTheme.chatUser} shadow-md text-white`}>
                    <Sparkles className="h-7 w-7" />
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
                  Pathfinder Suggestion Console
                </h2>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-2 leading-relaxed font-medium">
                  Welcome to your personalized career matching interface. Choose a topic below or type your inquiry to get started.
                </p>

                {/* Chat Starters - Three compact cards */}
                <div className="w-full pt-6">
                  <ChatStarters onSelect={handleStarterSelect} isLoading={sending} />
                </div>
              </div>
            )}

            {activeMessages.map((message) => {
              if (message.role === "system") {
                return (
                  <div key={message.id} className="flex justify-center my-2.5">
                    <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
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
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow-sm">
                        <div className={`p-1 rounded bg-gradient-to-br ${activePersonality.color} text-white scale-75`}>
                          {activePersonality.icon}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-2xl shadow-sm rounded-2xl transition-all duration-300 ${
                        message.role === "user"
                          ? `rounded-tr-none ${activeTheme.chatUser} px-4 py-2.5 text-white text-xs font-medium`
                          : `rounded-tl-none ${activeTheme.chatAssistant} w-full px-5 py-3.5 text-xs text-slate-200 border`
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      ) : (
                        <p className="leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar */}
                    {message.role === "user" && (
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow-sm text-slate-300 font-extrabold text-[10px] uppercase">
                        {user?.name ? user.name.charAt(0) : "U"}
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp */}
                  <div className={`flex text-[9px] text-slate-600 font-bold px-10 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Option Buttons */}
                  {message.options && message.options.length > 0 && !message.selectedOption && (
                    <div className="flex justify-start pl-10">
                      <div className="w-full max-w-2xl">
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

            {sending && (
              <div className="flex justify-start animate-fadeIn pl-10">
                <div className="flex gap-1.5 px-3.5 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
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

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 sm:px-6">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Query Pathfinder as a ${activePersonality.name}...`}
                disabled={sending || externalLoading}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-850 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700/50 transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={sending || externalLoading || !input.trim()}
              className={`rounded-xl ${activeTheme.accentBg} p-3 text-white shadow-md active:scale-95 transition-all disabled:opacity-50`}
            >
              {sending || externalLoading ? (
                <Loader className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Send className="h-4.5 w-4.5" />
              )}
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-2 text-center text-[9px] text-slate-500 font-medium">
            Pathfinder Console • Enterprise Mode • Styled as <span className="font-semibold text-slate-400">{activePersonality.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
