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
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "good" | null>(null)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)

    // Real-time feedback for password strength
    if (name === "password") {
      if (value.length === 0) {
        setPasswordStrength(null)
      } else if (value.length < 6) {
        setPasswordStrength("weak")
      } else if (value.length < 12) {
        setPasswordStrength("fair")
      } else {
        setPasswordStrength("good")
      }

      // Check if passwords match
      if (formData.confirmPassword) {
        setPasswordMatch(value === formData.confirmPassword)
      }
    }

    // Real-time feedback for password confirm
    if (name === "confirmPassword") {
      setPasswordMatch(value === formData.password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Comprehensive validation with friendly feedback
    const validationErrors: string[] = []

    if (!formData.name) validationErrors.push("Full name is required")
    if (!formData.email) validationErrors.push("Email address is required")
    if (!formData.password) validationErrors.push("Password is required")
    if (!formData.confirmPassword) validationErrors.push("Please confirm your password")

    if (validationErrors.length > 0) {
      setValidationError(validationErrors.join(" • "))
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email address (e.g., you@example.com)")
      return
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      setValidationError("Please enter your full name (at least 2 characters)")
      return
    }

    // Password strength validation
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long for security")
      return
    }


    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords don't match. Please make sure they're identical")
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
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center px-4 py-8 sm:px-6 relative overflow-hidden">
          {/* Background decoration - enhanced */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Top right - emerald */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
            {/* Bottom left - teal */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
            {/* Center - purple accent */}
            <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
          </div>

          <div className="w-full max-w-sm space-y-8 relative z-10">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mx-auto shadow-lg shadow-emerald-500/50">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">Join Pathfinder</h1>
                <p className="text-sm text-muted-foreground">Step 1 of 2</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
              {(error || validationError) && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-red-300">Let's fix this</p>
                    <p className="text-sm text-red-200">{error || validationError}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-card-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card/50 text-foreground placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 transition-all disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-card-foreground">
                  Email Address
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card/50 text-foreground placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 transition-all disabled:opacity-50"
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
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-card/50 text-foreground placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                          passwordStrength === "fair" ? "w-2/3 bg-yellow-500" :
                            "w-full bg-emerald-500"
                          }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {passwordStrength === "weak" ? "Weak" :
                        passwordStrength === "fair" ? "Fair" :
                          "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-card-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-card/50 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${passwordMatch === false ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" :
                        passwordMatch === true ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/40" :
                          "border-border focus:border-emerald-500 focus:ring-emerald-500/40"
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && passwordMatch !== null && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className={`text-xs font-medium ${passwordMatch ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                      {passwordMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20 mt-2"
              >
                {isLoading ? "Creating account..." : "Continue"}
              </Button>

              {/* Footer */}
              <div className="pt-2 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground px-4">
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
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center px-4 py-8">
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
          </div>

          {/* Modal backdrop */}
          <div className="fixed inset-0 bg-background/40 backdrop-blur-sm" />

          {/* Success Modal */}
          <div className="relative z-10 w-full max-w-md">
            <div className="rounded-3xl border border-emerald-500/30 bg-card/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-emerald-500/10 space-y-8 animate-scaleIn">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-xl opacity-40" />
                  <div className="relative rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 p-5">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 text-center">
                <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Welcome to Pathfinder!
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Your account is ready. Let's discover your ideal career path.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1">Step 1</div>
                  <div className="text-lg font-black text-emerald-500 dark:text-emerald-400">✓</div>
                </div>
                <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1">Step 2</div>
                  <div className="text-lg font-black text-teal-500 dark:text-teal-400">✓</div>
                </div>
                <div className="rounded-lg bg-slate-500/10 border border-slate-500/20 p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1">Next</div>
                  <div className="text-lg font-black text-muted-foreground">→</div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-105 active:scale-95"
              >
                Get Started
              </button>

              {/* Footer message */}
              <p className="text-xs text-slate-500 text-center">
                Redirecting automatically in a moment...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
