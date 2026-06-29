"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const { user } = useAuth();
  const { profile, sendChatMessage, loadData } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! 👋 I'm Pathfinder AI, your personal career guide. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage(input);
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Pathfinder AI</h1>
              <p className="text-xs text-slate-400">
                Your personal career guide
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 p-6 h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scrollbar">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fadeInUp`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur transition-all duration-300 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg"
                      : "bg-slate-700/50 text-slate-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start animate-fadeInUp">
                <div className="bg-slate-700/50 backdrop-blur px-4 py-3 rounded-2xl">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about careers..."
              disabled={sending}
              className="flex-1 rounded-full bg-slate-800 border border-slate-700 px-5 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-3 text-white hover:from-teal-700 hover:to-teal-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg font-semibold flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
