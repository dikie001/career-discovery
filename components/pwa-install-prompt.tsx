"use client"

import React, { useEffect, useState } from "react"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check localStorage to see if user dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const now = Date.now()
    const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

    if (dismissedTime && now - dismissedTime < DISMISS_DURATION) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Show prompt after a delay
      setTimeout(() => {
        if (!localStorage.getItem("pwa-install-dismissed")) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check for app installed event
    const handleAppInstalled = () => {
      console.log("PWA installed")
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      setIsLoading(true)
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
        // Dismiss for 7 days
        localStorage.setItem("pwa-install-dismissed", Date.now().toString())
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Error during PWA installation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Dismiss for 7 days
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  // Don't show if not enabled, installed, or no deferred prompt
  if (!process.env.NEXT_PUBLIC_ENABLE_PWA || isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-28 sm:bottom-24 left-4 right-4 z-50 animate-slideInUp">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border border-teal-500/30 shadow-2xl shadow-teal-500/20 p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
              <span className="text-lg font-black text-white">P</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Install Pathfinder
              </h3>
              <p className="text-xs text-muted-foreground">
                Add to your home screen
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-card-foreground transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Benefits:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="text-teal-400">✓</span>
              <span>Home screen icon</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="text-teal-400">✓</span>
              <span>Faster loading</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="text-teal-400">✓</span>
              <span>No app store</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="text-teal-400">✓</span>
              <span>App-like experience</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-sm font-semibold transition-all"
          >
            Maybe later
          </button>
          <button
            onClick={handleInstall}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white text-sm font-semibold transition-all"
          >
            <Download className="h-4 w-4" />
            {isLoading ? "Installing..." : "Install"}
          </button>
        </div>
      </div>
    </div>
  )
}
