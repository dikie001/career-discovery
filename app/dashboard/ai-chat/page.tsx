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
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-1rem)] w-full overflow-hidden flex flex-col pb-1">
      <AiChat
        onSendMessage={sendChatMessage}
        userConsent={consent?.useProfileDataForAI ?? null}
        onConsentChange={handleConsentChange}
      />
    </div>
  );
}
