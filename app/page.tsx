"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SplashScreen from "@/components/ui/splash-screen"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  return <SplashScreen message="Launching Pathfinder AI..." />
}

