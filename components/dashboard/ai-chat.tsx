"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onSendMessage: (message: string) => Promise<string>;
  isLoading?: boolean;
}

export function AIChat({ onSendMessage, isLoading = false }: AIChatProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
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
      const response = await onSendMessage(input);
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
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 p-4 text-white shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm">Ask Pathfinder AI</h3>
          <p className="text-xs opacity-90">Your personal career guide</p>
        </div>
      </div>

      <div className="mb-3 flex-1 space-y-3 overflow-y-auto rounded-lg bg-white/10 p-3 backdrop-blur-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-xs ${message.role === "user"
                  ? "bg-white/20 text-white"
                  : "bg-white/95 text-gray-800"
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-white/95 px-3 py-2 text-xs text-gray-800">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me..."
          disabled={sending || isLoading}
          className="flex-1 rounded-full bg-white/20 px-3 py-2 text-xs text-white placeholder-white/60 focus:bg-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || isLoading || !input.trim()}
          className="rounded-full bg-white p-2 text-teal-600 hover:bg-white/90 disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
