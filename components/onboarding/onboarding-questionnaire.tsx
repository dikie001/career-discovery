"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronLeft, CheckCircle2, Zap } from "lucide-react"

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
  { id: "tech", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative & Design" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "finance", label: "Finance" },
  { id: "sales", label: "Sales & Marketing" },
  { id: "operations", label: "Operations" },
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
      <div className="w-full max-w-3xl">
        {/* Header with Logo */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30">
            <Zap className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-400">Let's get started</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Build Your Career Path</h1>
          <p className="text-lg text-slate-400">Tell us about yourself so we can provide personalized recommendations</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-50">{steps[currentStep].title}</h2>
              <p className="text-sm text-slate-400 mt-2">{steps[currentStep].subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-teal-400">{currentStep + 1} of {steps.length}</div>
            </div>
          </div>

          {/* Progress Bar Indicator */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 md:p-10 space-y-8">
          {/* Step 0: Interests */}
          {currentStep === 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {INTERESTS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleInterestToggle(option.id)}
                  className={`p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 font-semibold ${data.interests.includes(option.id)
                      ? "border-teal-500 bg-teal-500/20 text-teal-50 shadow-lg shadow-teal-500/20"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-teal-500/50 hover:bg-slate-800/60"
                    }`}
                >
                  {option.label}
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
                  className={`p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left font-semibold flex items-center gap-3 ${data.skills.includes(option.id)
                      ? "border-teal-500 bg-teal-500/20 text-teal-50 shadow-lg shadow-teal-500/20"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-teal-500/50 hover:bg-slate-800/60"
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${data.skills.includes(option.id)
                        ? "border-teal-300 bg-teal-500"
                        : "border-slate-600"
                      }`}
                  >
                    {data.skills.includes(option.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Experience Level */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleExperienceSelect(option.id as "beginner" | "intermediate" | "advanced")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center space-y-2 ${data.experienceLevel === option.id
                      ? "border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/20"
                      : "border-slate-700 bg-slate-800/40 hover:border-teal-500/50 hover:bg-slate-800/60"
                    }`}
                >
                  <div className={`font-semibold text-base ${data.experienceLevel === option.id ? "text-teal-50" : "text-slate-200"}`}>
                    {option.label}
                  </div>
                  <div className={`text-sm ${data.experienceLevel === option.id ? "text-teal-200/80" : "text-slate-400"}`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Target Role */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-200">Target Role</label>
                <input
                  type="text"
                  value={data.targetRole}
                  onChange={handleRoleChange}
                  placeholder="e.g., Product Manager, Data Analyst, UX Designer..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-700 bg-slate-800/40 text-slate-50 placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all outline-none text-base font-medium"
                />
                <p className="text-sm text-slate-400">Be specific about the role you're interested in. This helps us give you better recommendations.</p>
              </div>

              {/* Preview Summary */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 space-y-4">
                <h3 className="text-base font-semibold text-teal-300">Your Profile Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Interests</p>
                    <p className="text-slate-200 font-semibold">{data.interests.length} selected</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Skills</p>
                    <p className="text-slate-200 font-semibold">{data.skills.length} selected</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Experience</p>
                    <p className="text-slate-200 font-semibold capitalize">{data.experienceLevel}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Target Role</p>
                    <p className="text-slate-200 font-semibold">{data.targetRole || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex gap-4 justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-base"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all text-base shadow-lg shadow-teal-500/30"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle2 className="h-5 w-5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={`rounded-full transition-all duration-300 ${idx === currentStep
                  ? "w-8 h-3 bg-gradient-to-r from-teal-500 to-cyan-400"
                  : idx < currentStep
                    ? "w-3 h-3 bg-teal-500/60"
                    : "w-3 h-3 bg-slate-700"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
