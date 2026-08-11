"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"

type SignupStep = "credentials" | "success"

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

    try {
      setSuccessMessage("Creating your profile...")
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setStep("success")
      setTimeout(() => {
        router.push("/dashboard/onboarding")
      }, 2000)
    } catch (err) {
      console.error("Signup error:", err)
    }
  }

  return (
    <>
      {step === "credentials" && (
        <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:px-6 overflow-hidden">
          {/* Background image */}
          <div 
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/sign-up.webp')" }}
          />
          {/* Dark overlay for better text readability */}
          <div className="fixed inset-0 z-0 bg-black/15" />

          {/* Background decoration - enhanced */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Top right - emerald */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            {/* Bottom left - teal */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            {/* Center - purple accent */}
            <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>

          <div className="w-full max-w-[380px] space-y-3.5 relative z-10 bg-white dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/15 p-5 sm:p-6 rounded-3xl shadow-2xl my-auto">
            {/* Compact Header */}
            <div className="flex items-center gap-3.5 justify-center pb-2 border-b border-slate-100 dark:border-white/10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-md shadow-emerald-500/15 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <img src="/logo.png" alt="Pathfinder Logo" className="h-full w-full object-contain rounded-xl" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Join Pathfinder</h1>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">Create your secure account</p>
              </div>
            </div>

            {/* Compact Form */}
            <form onSubmit={handleSubmit} className="space-y-3 animate-fadeInUp">
              {(error || validationError) && (
                <div className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 p-2.5 flex items-center gap-2 text-xs text-red-600 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
                  <span className="flex-1 font-medium">{error || validationError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                    placeholder="Channel Ann"
                  />
                </div>
              </div>

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
                {formData.password && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                          passwordStrength === "fair" ? "w-2/3 bg-yellow-500" :
                            "w-full bg-emerald-500"
                          }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {passwordStrength === "weak" ? "Weak" :
                        passwordStrength === "fair" ? "Fair" :
                          "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-10 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:ring-2 transition-all disabled:opacity-50 ${passwordMatch === false ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" :
                        passwordMatch === true ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20" :
                          "border-slate-200 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20"
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && passwordMatch !== null && (
                  <div className="pt-0.5">
                    <span className={`text-[10px] font-bold ${passwordMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {passwordMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white text-sm font-black rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30 mt-2"
              >
                {isLoading ? "Creating account..." : "Continue"}
              </Button>

              {/* Compact Footer */}
              <div className="pt-1 text-center space-y-1.5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-extrabold underline transition-colors">
                    Sign in
                  </Link>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  By joining, you agree to our Terms & Privacy Policy
                </p>
              </div>
            </form>
          </div>
        </div>
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
                onClick={() => router.push("/dashboard/onboarding")}
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
