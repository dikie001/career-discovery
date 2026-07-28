"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Compass,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Check,
  Target,
  Building,
  Leaf,
  Search,
  Map,
  Zap,
} from "lucide-react";

type Step = "level" | "intent" | "profile";

const EDUCATION_LEVELS = [
  {
    id: "high_school",
    label: "High School",
    icon: Building,
    desc: "Exploring future paths before university",
  },
  {
    id: "university",
    label: "University / College",
    icon: GraduationCap,
    desc: "Currently studying, planning my career",
  },
  {
    id: "working",
    label: "Already Working",
    icon: Briefcase,
    desc: "I have a job and want to grow or pivot",
  },
  {
    id: "other",
    label: "Other",
    icon: Leaf,
    desc: "My situation is different from the above",
  },
];

const INTENTS = [
  {
    id: "discover_new",
    label: "Discover my best career fit",
    desc: "Help me find which career suits my interests and strengths",
    icon: Search,
  },
  {
    id: "guided_existing",
    label: "Guide me on my current path",
    desc: "I know my direction — help me grow and fill skill gaps",
    icon: Map,
  },
];

const COMMON_INTERESTS = [
  "Technology", "Design", "Business", "Finance", "Healthcare",
  "Education", "Arts & Media", "Engineering", "Science", "Law",
  "Marketing", "Environment", "Sports", "Music", "Writing",
];

const COMMON_SKILLS = [
  "Programming", "Data Analysis", "Communication", "Leadership",
  "Problem Solving", "Design", "Research", "Marketing", "Sales",
  "Project Management", "Writing", "Excel/Spreadsheets", "Social Media",
  "Customer Service", "Teaching",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>("level");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [intent, setIntent] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleItem = (
    item: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinish = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          educationLevel,
          onboardingIntent: intent,
          onboardingCompleted: true,
          interests: selectedInterests,
          skills: selectedSkills,
          targetRole: targetRole || undefined,
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to save onboarding", e);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = { level: 0, intent: 1, profile: 2 }[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col font-sans text-foreground antialiased">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-6">
        {step !== "level" ? (
          <button
            onClick={() =>
              setStep(step === "intent" ? "level" : "intent")
            }
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-6 bg-teal-400"
                  : i < stepIndex
                  ? "w-3 bg-teal-600/60"
                  : "w-3 bg-slate-700"
              }`}
            />
          ))}
        </div>
        <div className="w-12" />
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-5 pb-10 max-w-lg mx-auto w-full">
        {/* STEP 1 — Education Level */}
        {step === "level" && (
          <div className="animate-fadeInUp">
            <div className="mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 mb-5 shadow-lg shadow-teal-500/30">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white leading-tight mb-2">
                Where are you right now?
              </h1>
              <p className="text-slate-400 text-sm">
                This helps Pathfinder AI personalize everything for you.
              </p>
            </div>

            <div className="space-y-3">
              {EDUCATION_LEVELS.map((level) => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    id={`level-${level.id}`}
                    onClick={() => setEducationLevel(level.id)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                      educationLevel === level.id
                        ? "border-teal-500/70 bg-teal-500/15 shadow-lg shadow-teal-500/10"
                        : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${educationLevel === level.id ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/50 text-slate-400"}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{level.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{level.desc}</p>
                    </div>
                    {educationLevel === level.id && (
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-next-level"
              onClick={() => setStep("intent")}
              disabled={!educationLevel}
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 py-4 font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:from-teal-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Continue <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 2 — Intent */}
        {step === "intent" && (
          <div className="animate-fadeInUp">
            <div className="mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-5 shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white leading-tight mb-2">
                What brings you here?
              </h1>
              <p className="text-slate-400 text-sm">
                Pathfinder AI adapts entirely to your goal.
              </p>
            </div>

            <div className="space-y-4">
              {INTENTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`intent-${item.id}`}
                    onClick={() => setIntent(item.id)}
                    className={`w-full flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                      intent === item.id
                        ? "border-indigo-500/70 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${
                        intent === item.id ? "bg-indigo-500/30" : "bg-slate-700/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${intent === item.id ? "text-indigo-300" : "text-slate-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">{item.label}</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                    {intent === item.id && (
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-next-intent"
              onClick={() => setStep("profile")}
              disabled={!intent}
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Continue <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 3 — Profile Setup */}
        {step === "profile" && (
          <div className="animate-fadeInUp">
            <div className="mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-5 shadow-lg shadow-amber-500/30">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white leading-tight mb-2">
                Tell us about yourself
              </h1>
              <p className="text-slate-400 text-sm">
                Pick what resonates — you can always update this later.
              </p>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" /> Your Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_INTERESTS.map((item) => (
                  <button
                    key={item}
                    id={`interest-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => toggleItem(item, selectedInterests, setSelectedInterests)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 border ${
                      selectedInterests.includes(item)
                        ? "bg-teal-500/20 border-teal-500/60 text-teal-300 shadow-sm shadow-teal-500/10"
                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Skills You Have
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((item) => (
                  <button
                    key={item}
                    id={`skill-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => toggleItem(item, selectedSkills, setSelectedSkills)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 border ${
                      selectedSkills.includes(item)
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/10"
                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role (optional) */}
            {intent === "guided_existing" && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" /> What career are you in or pursuing?
                </p>
                <input
                  type="text"
                  id="input-target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Nurse, UX Designer..."
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                />
              </div>
            )}

            <button
              id="btn-finish-onboarding"
              onClick={handleFinish}
              disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 py-4 font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up your journey...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Launch Pathfinder →
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-600 mt-3">
              You can update everything in your Profile settings
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
