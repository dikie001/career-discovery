"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Image from "next/image";

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

    // Add user message
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
    <div className="flex h-full flex-col rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 p-6 text-white shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Image
              src="/bot.png"
              alt="Pathfinder AI"
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="font-semibold">Ask Pathfinder AI</h3>
            <p className="text-xs opacity-90">Your personal career guide</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg bg-white/10 p-4 backdrop-blur-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                message.role === "user"
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
            <div className="rounded-lg bg-white/95 px-4 py-2 text-sm text-gray-800">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
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
          placeholder="Ask me anything..."
          disabled={sending || isLoading}
          className="flex-1 rounded-full bg-white/20 px-4 py-2 text-white placeholder-white/60 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <Button
          type="submit"
          disabled={sending || isLoading || !input.trim()}
          size="sm"
          className="rounded-full bg-white text-teal-600 hover:bg-white/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
