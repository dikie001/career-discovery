"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
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
  const [verifyingEmail, setVerifyingEmail] = useState("")

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
      setVerifyingEmail(formData.email)
      setStep("verifying")

      await login(formData)

      setStep("success")

      // Redirect after showing success
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 mx-auto">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-50">Pathfinder</h1>
          <p className="text-sm text-slate-400">Discover. Plan. Succeed.</p>
        </div>

        {/* Main Form */}
        {step === "form" && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
              {localError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-start gap-2 animate-in shake">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{localError}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-950 text-slate-400">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                Create one
              </Link>
            </p>
          </>
        )}

        {/* Verifying State */}
        {step === "verifying" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center h-full rounded-full bg-teal-500/10 border-2 border-teal-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-400 border-t-transparent" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold text-slate-50">Verifying your credentials</h2>
                <p className="text-sm text-slate-400">{verifyingEmail}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 text-center">
              <p>Please wait while we verify your account...</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center h-full rounded-full bg-teal-500/10 border-2 border-teal-500">
                  <CheckCircle2 className="h-8 w-8 text-teal-400 animate-in zoom-in-50 duration-500" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-slate-50">Welcome back! 👋</h2>
              <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === "error" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-red-500/20 rounded-full" />
                <div className="relative flex items-center justify-center h-full rounded-full bg-red-500/10 border-2 border-red-500">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-xl font-semibold text-slate-50">Login Failed</h2>
              <p className="text-sm text-red-400">{localError}</p>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400">Make sure your email and password are correct.</p>
              </div>

              <button
                onClick={handleRetry}
                className="w-full px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Try Again
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link href="/auth/signup" className="block text-sm text-teal-400 hover:text-teal-300 transition-colors">
                Create a new account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
