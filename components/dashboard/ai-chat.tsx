"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { ChatOptions, ChatOption } from "./chat-options";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  selectedOption?: string;
}

interface AiChatProps {
  onSendMessage: (message: string) => Promise<string>;
  isLoading?: boolean;
}

export function AiChat({ onSendMessage, isLoading: externalLoading = false }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectOption = async (optionId: string) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.options) return;

    const selectedOption = lastMessage.options.find((opt) => opt.id === optionId);
    if (!selectedOption) return;

    // Update the last message to show selected option
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        selectedOption: optionId,
      };
      return updated;
    });

    // Send the selected option as a message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: selectedOption.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const response = await onSendMessage(selectedOption.label);

      // Parse the response for options
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
      const response = await onSendMessage(input);

      // Parse the response for options
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

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">Pathfinder AI</h2>
                <p className="text-slate-400">Your personal career guide</p>
                <p className="text-slate-500 text-sm max-w-md">
                  Ask me anything about careers, skills, learning paths, and recommendations
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="animate-fadeIn space-y-2">
              {/* Message Content */}
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl ${message.role === "user"
                    ? "rounded-2xl bg-teal-600 px-4 py-3 text-white"
                    : "w-full"
                    }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>

              {/* Options (if present) */}
              {message.options && message.options.length > 0 && !message.selectedOption && (
                <div className="flex justify-start">
                  <div className="w-full max-w-2xl">
                    <ChatOptions
                      options={message.options}
                      onSelect={handleSelectOption}
                      isLoading={sending}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex gap-2 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-teal-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 sm:p-6">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about careers, skills, or learning paths..."
            disabled={sending || externalLoading}
            className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || externalLoading || !input.trim()}
            className="rounded-lg bg-teal-600 p-3 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {sending || externalLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
