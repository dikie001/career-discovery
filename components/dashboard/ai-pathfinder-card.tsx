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
    <div className="w-full overflow-hidden rounded-3xl bg-gradient-to-b from-teal-600 to-teal-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-teal-500/30 px-6 py-4">
        <div className="relative h-14 w-14 flex-shrink-0">
          <Image
            src="/bot.png"
            alt="Pathfinder AI"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h3 className="font-semibold text-white">Ask Pathfinder AI</h3>
          <p className="text-xs text-teal-100">Your personal career guide</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-80 space-y-4 overflow-y-auto p-4 sm:h-96">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className="animate-fadeInUp space-y-3"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* Question/Response */}
            {(message.type === "question" || message.type === "response") && (
              <div className="flex justify-start">
                <div className="max-w-xs rounded-2xl bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-lg lg:max-w-md">
                  {message.type === "response" ? (
                    <MarkdownRenderer
                      content={message.content}
                      className="prose prose-sm"
                    />
                  ) : (
                    <p className="font-medium">{message.content}</p>
                  )}
                </div>
              </div>
            )}

            {/* User Input */}
            {message.type === "user_input" && (
              <div className="flex justify-end">
                <div className="max-w-xs rounded-2xl bg-gradient-to-r from-teal-400 to-teal-500 px-4 py-3 text-sm font-medium text-white shadow-lg lg:max-w-md">
                  {message.content}
                </div>
              </div>
            )}

            {/* Selection Options */}
            {message.selectionOptions && message.selectionOptions.length > 0 && (
              <div className="space-y-2">
                {message.selectionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSendSelection(option.id)}
                    disabled={sending || externalLoading}
                    className="w-full rounded-xl border-2 border-teal-300 bg-teal-500/10 px-3 py-2 text-left text-xs font-medium text-white backdrop-blur-sm transition-all hover:border-teal-200 hover:bg-teal-500/20 disabled:opacity-50 sm:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        {option.description && (
                          <p className="text-xs text-teal-100 opacity-75">
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
                <div className="rounded-2xl bg-white/95 px-4 py-3">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-teal-500"
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
            <div className="rounded-2xl bg-white/95 px-4 py-3">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-teal-500"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-teal-500/30 px-4 py-3 sm:px-6">
        {hasSelectionOptions && !sending ? (
          <div className="text-center text-xs text-teal-100">
            Select an option above or type your own question
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={sending || externalLoading}
              className="flex-1 rounded-full bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/30 focus:outline-none sm:text-base"
            />
            <button
              type="submit"
              disabled={sending || externalLoading || !input.trim()}
              className="flex-shrink-0 rounded-full bg-white p-2.5 text-teal-600 transition-all hover:bg-white/90 disabled:opacity-50 sm:p-3"
            >
              {sending || externalLoading ? (
                <Loader className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
