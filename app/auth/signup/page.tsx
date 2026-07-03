"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

    setStep("onboarding")
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      setSuccessMessage("Creating your profile...")

      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      setStep("success")

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch {
      setStep("onboarding")
    }
  }

  return (
    <>
      {step === "credentials" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
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
                <h1 className="text-3xl font-bold text-white">Join Pathfinder</h1>
                <p className="text-sm text-slate-400">Step 1 of 2</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
              {(error || validationError) && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-300">{error || validationError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-200">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-teal-500/20 mt-2"
              >
                {isLoading ? "Creating account..." : "Continue"}
              </Button>

              {/* Footer */}
              <div className="pt-2 text-center space-y-3">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-slate-500 px-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "onboarding" && (
        <OnboardingQuestionnaire onComplete={handleOnboardingComplete} isLoading={isLoading} />
      )}

      {step === "success" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm space-y-8 text-center relative z-10">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/50 p-4">
                  <CheckCircle2 className="h-12 w-12 text-teal-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Account Created!</h1>
                <p className="text-sm text-slate-400">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
