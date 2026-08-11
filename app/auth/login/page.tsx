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

    // Validation feedback
    const validationErrors: string[] = []
    if (!formData.email) validationErrors.push("Email is required")
    if (!formData.password) validationErrors.push("Password is required")

    if (validationErrors.length > 0) {
      setLocalError(validationErrors.join(" • "))
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address")
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
      // Provide friendly error messages
      let friendlyError = authError || "Login failed. Please try again."
      if (authError?.toLowerCase().includes("not found")) {
        friendlyError = "Email not found. Please check your email or create an account."
      } else if (authError?.toLowerCase().includes("invalid") || authError?.toLowerCase().includes("incorrect")) {
        friendlyError = "Email or password is incorrect. Please try again."
      } else if (authError?.toLowerCase().includes("network")) {
        friendlyError = "Network error. Please check your connection and try again."
      }
      setLocalError(friendlyError)
    }
  }

  const handleRetry = () => {
    setStep("form")
    setLocalError(null)
    setFormData({ email: "", password: "" })
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Background image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sign-in.webp')" }}
      />
      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-black/15" />

      {/* Background decoration (optional, keeping for vibe) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[380px] space-y-3.5 relative z-10 bg-white dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/15 p-5 sm:p-6 rounded-3xl shadow-2xl my-auto">
        {/* Compact Header */}
        <div className="flex items-center gap-3.5 justify-center pb-2 border-b border-slate-100 dark:border-white/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-md shadow-emerald-500/15 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <img src="/logo.png" alt="Pathfinder Logo" className="h-full w-full object-contain rounded-xl" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Pathfinder</h1>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">Welcome back</p>
          </div>
        </div>

        {/* Verifying State */}
        {step === "verifying" && (
          <div className="space-y-4 py-4 animate-fadeInUp">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-border"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-r-teal-500 animate-spin"></div>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-slate-900 dark:text-white font-bold">Signing you in...</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{formData.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="space-y-4 py-4 animate-scaleIn">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 p-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 dark:text-white text-base font-black">Welcome back!</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === "error" && (
          <div className="space-y-4 animate-fadeInUp">
            <div className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-red-700 dark:text-red-200">Login Unsuccessful</p>
                  <p className="text-xs text-red-600 dark:text-red-300">{localError}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-200 pt-0.5">Tip: Check your email & password or create an account below.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button
                onClick={handleRetry}
                className="flex-1 h-10 text-xs bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
              >
                Try Again
              </Button>
              <Link href="/auth/signup" className="flex-1">
                <Button className="w-full h-10 text-xs bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Form State */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-3 animate-fadeInUp">
            {localError && (
              <div className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 p-2.5 flex items-center gap-2 text-xs text-red-700 dark:text-red-200">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
                <span className="flex-1 font-medium">{localError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white text-sm font-black rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30 mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Compact Footer */}
            <div className="pt-1 text-center space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-extrabold underline transition-colors">
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
