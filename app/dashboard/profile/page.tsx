"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Edit2,
  Save,
  X,
  Mail,
  User,
  MapPin,
  Zap,
  Heart,
  Target,
  GraduationCap,
  LogOut,
  ArrowLeft,
  Check,
} from "lucide-react"

interface ProfileData {
  name: string
  email: string
  location: string
  avatar: string
  interests: string[]
  skills: string[]
  experienceLevel: "beginner" | "intermediate" | "advanced"
  targetRole: string
  careerGoal: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [newInterest, setNewInterest] = useState("")
  const [newSkill, setNewSkill] = useState("")

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    avatar: user?.avatar || "",
    interests: [],
    skills: [],
    experienceLevel: "beginner",
    targetRole: "",
    careerGoal: "",
  })

  const [formData, setFormData] = useState<ProfileData>(profile)

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data.data)
        setFormData(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const handleRemoveInterest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!token) return

    try {
      setIsSaving(true)
      setError(null)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const data = await response.json()
      setProfile(data.data)
      setFormData(data.data)
      setIsEditing(false)
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
    setError(null)
    setNewInterest("")
    setNewSkill("")
  }

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-teal-600/30"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-teal-400 border-r-teal-400"></div>
          </div>
          <p className="font-bold text-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-28 sm:pb-24 font-sans text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-lg shadow-black/10 dark:shadow-black/50">
        <div className="mx-auto flex w-full items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 md:max-w-6xl md:mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-semibold hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">My Profile</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md space-y-4 sm:space-y-6 px-3 sm:px-4 pt-4 sm:pt-5 md:max-w-2xl md:mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 flex items-start gap-3">
            <Check className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-teal-300">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
            <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-slate-900/50 to-slate-900/20 backdrop-blur-sm p-4 sm:p-6 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold text-xl shadow-lg shadow-teal-500/30">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{formData.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{formData.email}</p>
              </div>
            </div>
            <button
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded-lg transition-all"
            >
              {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20">
          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-teal-400" />
            Personal Information
          </h3>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-muted-foreground cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="Your location"
              />
            </div>
          </div>
        </div>

        {/* Career Profile Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20">
          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-400" />
            Career Profile
          </h3>

          <div className="space-y-3">
            {/* Target Role */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="e.g., Product Manager, UX Designer"
              />
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Career Goal
              </label>
              <textarea
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                placeholder="Describe your career aspirations"
                rows={3}
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground disabled:opacity-60 disabled:cursor-not-allowed focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20">
          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-teal-400" />
            Interests
          </h3>

          <div className="space-y-3">
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddInterest()}
                  placeholder="Add an interest"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  onClick={handleAddInterest}
                  className="px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.interests.length > 0 ? (
                formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-500/50 px-3 py-1.5 text-sm text-teal-300"
                  >
                    <span>{interest}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveInterest(index)}
                        className="text-teal-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No interests added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20">
          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-teal-400" />
            Skills
          </h3>

          <div className="space-y-3">
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder="Add a skill"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card/50 text-foreground placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 px-3 py-1.5 text-sm text-cyan-300"
                  >
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="text-cyan-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-muted hover:bg-accent text-card-foreground font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 font-semibold rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
