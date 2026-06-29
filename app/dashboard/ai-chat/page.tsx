"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiPathfinderCard } from "@/components/dashboard/ai-pathfinder-card";

export default function AIChatPage() {
  const { user } = useAuth();
  const { sendChatMessage, loadData } = useDashboard();

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <AiPathfinderCard
          onSendMessage={sendChatMessage}
          userDisplayName={user?.email?.split("@")[0] || "there"}
        />
      </main>
    </div>
  );
}
