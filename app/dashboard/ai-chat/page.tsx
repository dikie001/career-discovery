"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { AiChat } from "@/components/dashboard/ai-chat";

export default function AIChatPage() {
  const { sendChatMessage, loadData, consent, updateConsent } = useDashboard();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConsentChange = async (consented: boolean) => {
    if (updateConsent) {
      await updateConsent(consented);
    }
  };

  return (
    <AiChat
      onSendMessage={sendChatMessage}
      userConsent={consent?.useProfileDataForAI ?? null}
      onConsentChange={handleConsentChange}
    />
  );
}
