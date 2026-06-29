"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"

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
  { id: "tech", label: "Technology", icon: "💻" },
  { id: "business", label: "Business", icon: "📊" },
  { id: "creative", label: "Creative & Design", icon: "🎨" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "sales", label: "Sales & Marketing", icon: "📢" },
  { id: "operations", label: "Operations", icon: "⚙️" },
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
    { title: "What interests you?", subtitle: "Select all that apply" },
    { title: "What are your strengths?", subtitle: "Pick your top skills" },
    { title: "What's your experience level?", subtitle: "Help us understand where you're at" },
    { title: "What's your dream role?", subtitle: "What role are you targeting?" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-50">{steps[currentStep].title}</h2>
              <p className="text-sm text-slate-400 mt-1">{steps[currentStep].subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-teal-400">{currentStep + 1} of {steps.length}</div>
            </div>
          </div>

          {/* Progress Bar Indicator */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 md:p-8 space-y-6">
          {/* Step 0: Interests */}
          {currentStep === 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {INTERESTS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleInterestToggle(option.id)}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all ${data.interests.includes(option.id)
                    ? "border-teal-500 bg-teal-500/10"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-xs md:text-sm font-medium text-slate-50 text-center">{option.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Skills */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SKILLS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSkillToggle(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${data.skills.includes(option.id)
                    ? "border-teal-500 bg-teal-500/10"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.skills.includes(option.id)
                        ? "border-teal-500 bg-teal-500"
                        : "border-slate-600"
                        }`}
                    >
                      {data.skills.includes(option.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-50">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Experience Level */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleExperienceSelect(option.id as "beginner" | "intermediate" | "advanced")}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${data.experienceLevel === option.id
                    ? "border-teal-500 bg-teal-500/10"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                >
                  <div className="font-semibold text-slate-50 mb-1">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Target Role */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <input
                type="text"
                value={data.targetRole}
                onChange={handleRoleChange}
                placeholder="e.g., Product Manager, Data Analyst, UX Designer..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-800/30 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-base"
              />
              <p className="text-xs text-slate-400 px-4">Be specific about the role you're interested in. This helps us give you better recommendations.</p>

              {/* Preview Summary */}
              <div className="mt-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                <h3 className="text-sm font-semibold text-teal-300">Your Profile Summary</h3>
                <div className="space-y-1 text-xs text-slate-300">
                  <p><span className="text-slate-400">Interests:</span> {data.interests.length} selected</p>
                  <p><span className="text-slate-400">Skills:</span> {data.skills.length} selected</p>
                  <p><span className="text-slate-400">Experience:</span> {data.experienceLevel}</p>
                  <p><span className="text-slate-400">Target Role:</span> {data.targetRole || "Not set"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3 justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm md:text-base"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="hidden md:inline">Processing...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="hidden md:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentStep
                ? "w-8 bg-teal-500"
                : idx < currentStep
                  ? "w-2 bg-teal-400/50"
                  : "w-2 bg-slate-700"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
