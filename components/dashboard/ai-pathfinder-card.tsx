"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";
import Image from "next/image";
import { MarkdownRenderer } from "./markdown-renderer";
import { SelectionCards, SelectionOption } from "./selection-cards";

interface ConversationMessage {
  id: string;
  type: "question" | "selection" | "response" | "user_input";
  content: string;
  timestamp: Date;
  selectionOptions?: SelectionOption[];
  userResponse?: string;
  isLoading?: boolean;
}

interface AiPathfinderCardProps {
  onSendMessage: (message: string) => Promise<string>;
  isLoading?: boolean;
  userDisplayName?: string;
}

export function AiPathfinderCard({
  onSendMessage,
  isLoading: externalLoading = false,
  userDisplayName = "there",
}: AiPathfinderCardProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: "welcome",
      type: "question",
      content: "What would you like to explore today?",
      timestamp: new Date(),
      selectionOptions: [
        {
          id: "best-careers",
          label: "Best careers for me",
          description: "Get personalized career recommendations",
          icon: "🎯",
        },
        {
          id: "skills-needed",
          label: "Skills I need",
          description: "Identify skill gaps for your goals",
          icon: "📊",
        },
        {
          id: "courses-study",
          label: "Courses to study",
          description: "Find relevant learning resources",
          icon: "📚",
        },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectionChange = (optionId: string) => {
    setSelectedOptions((prev) => {
      const newSelected = prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId];
      return newSelected;
    });
  };

  const handleSendSelection = async (optionId: string) => {
    const selectedOption = messages[messages.length - 1]?.selectionOptions?.find(
      (opt) => opt.id === optionId
    );

    if (!selectedOption) return;

    // Add user response
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      type: "user_input",
      content: selectedOption.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const response = await onSendMessage(selectedOption.label);
      const assistantMessage: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "response",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "response",
        content:
          "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      type: "user_input",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await onSendMessage(input);
      const assistantMessage: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "response",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "response",
        content:
          "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const hasSelectionOptions =
    lastMessage?.selectionOptions && lastMessage.selectionOptions.length > 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-b from-teal-600 to-teal-700 shadow-xl">
      {/* Header - Compact */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src="/bot.png"
              alt="Pathfinder AI"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">Pathfinder AI</h3>
            <p className="text-xs text-teal-100">Career guidance</p>
          </div>
        </div>
      </div>

      {/* Messages Container - Compact */}
      <div className="h-56 space-y-2 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className="animate-fadeInUp space-y-1.5"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* Question/Response */}
            {(message.type === "question" || message.type === "response") && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-muted border border-border px-3 py-2 text-xs sm:text-sm shadow-lg">
                  {message.type === "response" ? (
                    <MarkdownRenderer
                      content={message.content}
                      className="prose prose-sm"
                    />
                  ) : (
                    <p className="font-medium text-white text-xs sm:text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            )}

            {/* User Input */}
            {message.type === "user_input" && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-2 text-xs sm:text-sm font-medium text-white shadow-lg">
                  {message.content}
                </div>
              </div>
            )}

            {/* Selection Options - Compact */}
            {message.selectionOptions && message.selectionOptions.length > 0 && (
              <div className="space-y-1.5">
                {message.selectionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSendSelection(option.id)}
                    disabled={sending || externalLoading}
                    className="w-full rounded-lg border border-input bg-slate-800/80 hover:bg-accent px-2.5 py-2 text-left text-xs font-medium text-white backdrop-blur-sm transition-all hover:border-teal-400 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base flex-shrink-0">{option.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{option.label}</p>
                        {option.description && (
                          <p className="text-xs text-muted-foreground opacity-85 truncate">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {message.isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted border border-border px-3 py-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="rounded-lg bg-muted border border-border px-3 py-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Compact */}
      <div className="border-t border-teal-500/30 px-3 py-2.5 sm:px-4">
        {hasSelectionOptions && !sending ? (
          <div className="text-center text-xs text-teal-100">
            Select above or type
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask..."
              disabled={sending || externalLoading}
              className="flex-1 rounded-full bg-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || externalLoading || !input.trim()}
              className="flex-shrink-0 rounded-full bg-white p-2 text-teal-600 transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {sending || externalLoading ? (
                <Loader className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
              ) : (
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
