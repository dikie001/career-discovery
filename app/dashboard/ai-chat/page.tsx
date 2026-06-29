"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { AiChat } from "@/components/dashboard/ai-chat";

export default function AIChatPage() {
  const { sendChatMessage, loadData } = useDashboard();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return <AiChat onSendMessage={sendChatMessage} />;
}
