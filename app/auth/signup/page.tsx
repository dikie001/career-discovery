"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import OnboardingQuestionnaire, { OnboardingData } from "@/components/onboarding/onboarding-questionnaire"

type SignupStep = "credentials" | "onboarding" | "success"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading, error } = useAuth()
  const [step, setStep] = useState<SignupStep>("credentials")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!formData.name || !formData.email || !formData.password) {
      setValidationError("All fields are required")
      return
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    // Move to onboarding
    setStep("onboarding")
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      setOnboardingData(data)
      setSuccessMessage("Creating your profile...")

      // Create account with onboarding data
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      setStep("success")

      // Redirect after short delay to show success state
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch {
      // Error is handled by context
      setStep("onboarding")
    }
  }

  return (
    <>
      {step === "credentials" && (
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

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-8 rounded-full bg-teal-500"></div>
              <div className="h-2 w-2 rounded-full bg-slate-700"></div>
              <div className="h-2 w-2 rounded-full bg-slate-700"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || validationError) && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-in fade-in duration-300">
                  {error || validationError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-200">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Validating...
                  </>
                ) : (
                  <>
                    Next Step
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

            {/* Login Link */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === "onboarding" && (
        <OnboardingQuestionnaire onComplete={handleOnboardingComplete} isLoading={isLoading} />
      )}

      {step === "success" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center h-full rounded-full bg-teal-500/10 border-2 border-teal-500">
                  <CheckCircle2 className="h-10 w-10 text-teal-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-50">Welcome! 🎉</h2>
              <p className="text-slate-400">Your account has been created successfully.</p>
            </div>

            <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 space-y-2">
              <p className="text-sm text-slate-300">{successMessage}</p>
              <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
            </div>

            <div className="h-1 w-16 rounded-full bg-teal-500/20 mx-auto overflow-hidden">
              <div className="h-full bg-teal-500 animate-pulse" style={{ animation: "slideIn 2s ease-in-out" }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
