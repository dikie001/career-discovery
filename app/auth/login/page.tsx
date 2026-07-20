"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

type LoginStep = "form" | "verifying" | "success" | "error"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error: authError } = useAuth()
  const [step, setStep] = useState<LoginStep>("form")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setLocalError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all fields")
      return
    }

    try {
      setStep("verifying")
      await login(formData)
      setStep("success")

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      setStep("error")
      setLocalError(authError || "Login failed. Please try again.")
    }
  }

  const handleRetry = () => {
    setStep("form")
    setLocalError(null)
    setFormData({ email: "", password: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mx-auto shadow-lg shadow-teal-500/50">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Pathfinder</h1>
            <p className="text-sm text-muted-foreground">Welcome back</p>
          </div>
        </div>

        {/* Verifying State */}
        {step === "verifying" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-border"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-r-teal-500 animate-spin"></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Signing you in...</p>
                <p className="text-xs text-muted-foreground">{formData.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="space-y-6 animate-scaleIn">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/50 p-4">
                  <CheckCircle2 className="h-8 w-8 text-teal-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-semibold">Welcome!</p>
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === "error" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-red-300">Login Failed</p>
                  <p className="text-sm text-red-200">{localError}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form State */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
            {localError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-300">{localError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-card-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card/50 text-foreground placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-card-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-card/50 text-foreground placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-teal-500/20"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Footer */}
            <div className="pt-4 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
