"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronLeft, CheckCircle2, Zap, Lightbulb, Briefcase, Target, ArrowRight, Sparkles } from "lucide-react"

export interface OnboardingData {
  interests: string[]
  skills: string[]
  experienceLevel: "beginner" | "intermediate" | "advanced"
  targetRole: string
}

interface OnboardingQuestionnaireProps {
  onComplete: (data: OnboardingData) => void
  isLoading?: boolean
}

const INTERESTS_OPTIONS = [
  { id: "tech", label: "Technology", icon: Lightbulb },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "creative", label: "Creative & Design", icon: Sparkles },
  { id: "healthcare", label: "Healthcare", icon: Target },
  { id: "education", label: "Education", icon: Lightbulb },
  { id: "finance", label: "Finance", icon: Briefcase },
  { id: "sales", label: "Sales & Marketing", icon: Zap },
  { id: "operations", label: "Operations", icon: Target },
]

const SKILLS_OPTIONS = [
  { id: "communication", label: "Communication" },
  { id: "problemsolving", label: "Problem Solving" },
  { id: "leadership", label: "Leadership" },
  { id: "creativity", label: "Creativity" },
  { id: "teamwork", label: "Teamwork" },
  { id: "analysis", label: "Data Analysis" },
  { id: "management", label: "Project Management" },
  { id: "technical", label: "Technical Skills" },
]

const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Just Starting Out", description: "0-1 years" },
  { id: "intermediate", label: "Some Experience", description: "1-3 years" },
  { id: "advanced", label: "Experienced Professional", description: "3+ years" },
]

export default function OnboardingQuestionnaire({ onComplete, isLoading }: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    interests: [],
    skills: [],
    experienceLevel: "beginner",
    targetRole: "",
  })

  const steps = [
    { title: "What interests you?", subtitle: "Select topics that excite you" },
    { title: "What are your strengths?", subtitle: "Choose your top abilities" },
    { title: "Your experience level", subtitle: "Help us tailor recommendations" },
    { title: "Your dream role", subtitle: "What's your goal?" },
  ]

  const handleInterestToggle = (id: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }))
  }

  const handleSkillToggle = (id: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }))
  }

  const handleExperienceSelect = (level: "beginner" | "intermediate" | "advanced") => {
    setData((prev) => ({
      ...prev,
      experienceLevel: level,
    }))
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({
      ...prev,
      targetRole: e.target.value,
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.interests.length >= 1
      case 1:
        return data.skills.length >= 1
      case 2:
        return !!data.experienceLevel
      case 3:
        return data.targetRole.trim().length >= 2
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete(data)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:py-8 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-teal-500/15 border border-teal-500/40 backdrop-blur-md">
            <Zap className="h-4 w-4 text-teal-400 animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-teal-400">Career Discovery</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">Build Your Career Path</h1>
            <p className="text-sm sm:text-base text-slate-400 px-2">Tell us about yourself for personalized recommendations</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 sm:mb-10 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight">{steps[currentStep].title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{steps[currentStep].subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {currentStep + 1}/{steps.length}
              </div>
            </div>
          </div>

          <div className="h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-md border border-slate-700/30">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400 transition-all duration-700 shadow-lg shadow-teal-500/50"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 shadow-2xl shadow-slate-900/50">
          {currentStep === 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {INTERESTS_OPTIONS.map((option, idx) => {
                const Icon = option.icon
                const isSelected = data.interests.includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => handleInterestToggle(option.id)}
                    className={`group p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${isSelected
                      ? "border-teal-500 bg-gradient-to-br from-teal-500/30 to-cyan-500/20 shadow-lg shadow-teal-500/30"
                      : "border-slate-700/50 bg-slate-800/30 hover:border-teal-500/50 hover:bg-slate-800/50"
                      }`}
                    style={{ animation: `slideInUp 0.6s ease-out ${idx * 0.05}s both` }}
                  >
                    <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${isSelected ? "bg-teal-500/40 scale-110" : "bg-slate-800/50 group-hover:scale-105"}`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isSelected ? "text-teal-300 animate-bounce" : "text-slate-400 group-hover:text-teal-400"}`} />
                      </div>
                      <span className={`font-semibold text-xs sm:text-sm text-center leading-tight ${isSelected ? "text-teal-50" : "text-slate-300 group-hover:text-slate-100"}`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
              {SKILLS_OPTIONS.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handleSkillToggle(option.id)}
                  className={`group p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left font-semibold flex items-center gap-3 transform hover:scale-102 active:scale-95 ${data.skills.includes(option.id)
                    ? "border-teal-500 bg-gradient-to-r from-teal-500/30 to-cyan-500/20 shadow-lg shadow-teal-500/30"
                    : "border-slate-700/50 bg-slate-800/30 hover:border-teal-500/50 hover:bg-slate-800/50"
                    }`}
                  style={{ animation: `slideInRight 0.6s ease-out ${idx * 0.05}s both` }}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${data.skills.includes(option.id)
                    ? "border-teal-300 bg-gradient-to-br from-teal-500 to-cyan-400"
                    : "border-slate-600 group-hover:border-teal-400"
                    }`}>
                    {data.skills.includes(option.id) && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                  </div>
                  <span className={`text-sm sm:text-base ${data.skills.includes(option.id) ? "text-teal-50" : "text-slate-300 group-hover:text-slate-100"}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
              {EXPERIENCE_OPTIONS.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handleExperienceSelect(option.id as "beginner" | "intermediate" | "advanced")}
                  className={`group p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-center space-y-2 sm:space-y-3 transform hover:scale-105 active:scale-95 ${data.experienceLevel === option.id
                    ? "border-teal-500 bg-gradient-to-br from-teal-500/30 to-cyan-500/20 shadow-lg shadow-teal-500/30"
                    : "border-slate-700/50 bg-slate-800/30 hover:border-teal-500/50 hover:bg-slate-800/50"
                    }`}
                  style={{ animation: `scaleIn 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className={`inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${data.experienceLevel === option.id ? "bg-teal-500/40 scale-110" : "bg-slate-800/50 group-hover:scale-105"}`}>
                      <Target className={`h-5 w-5 sm:h-6 sm:w-6 ${data.experienceLevel === option.id ? "text-teal-300 animate-bounce" : "text-slate-400 group-hover:text-teal-400"}`} />
                    </div>
                    <div>
                      <div className={`font-bold text-base sm:text-lg ${data.experienceLevel === option.id ? "text-teal-50" : "text-slate-200 group-hover:text-slate-100"}`}>
                        {option.label}
                      </div>
                      <div className={`text-xs sm:text-sm ${data.experienceLevel === option.id ? "text-teal-200/80" : "text-slate-400 group-hover:text-slate-300"}`}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  Target Role
                </label>
                <input
                  type="text"
                  value={data.targetRole}
                  onChange={handleRoleChange}
                  placeholder="e.g., Product Manager, Data Analyst..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all outline-none text-base font-medium backdrop-blur-sm hover:border-slate-600/70"
                />
                <p className="text-xs sm:text-sm text-slate-400 px-2 flex items-center gap-2">
                  <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                  Be specific about the role.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 border border-teal-500/40 backdrop-blur-md space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400 animate-pulse flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-teal-300">Your Profile Summary</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Interests</p>
                    <p className="text-lg sm:text-2xl font-bold text-teal-400">{data.interests.length}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Skills</p>
                    <p className="text-lg sm:text-2xl font-bold text-cyan-400">{data.skills.length}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Experience</p>
                    <p className="text-sm sm:text-lg font-bold text-teal-300 capitalize">{data.experienceLevel}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Role</p>
                    <p className="text-sm sm:text-lg font-bold text-cyan-300">{data.targetRole ? "✓" : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 sm:mt-10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center justify-center sm:justify-start gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl border-2 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-base backdrop-blur-sm group"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all text-sm sm:text-base shadow-lg shadow-teal-500/40 hover:shadow-teal-500/60 backdrop-blur-sm group transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-2 sm:gap-3">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={`rounded-full transition-all duration-500 ${idx === currentStep
                ? "w-8 sm:w-10 h-2 sm:h-3 bg-gradient-to-r from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/50"
                : idx < currentStep
                  ? "w-2 sm:w-3 h-2 sm:h-3 bg-teal-500/60 hover:bg-teal-500"
                  : "w-2 sm:w-3 h-2 sm:h-3 bg-slate-700 hover:bg-slate-600"
                }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
