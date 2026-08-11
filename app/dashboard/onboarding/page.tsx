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
    <div className="min-h-screen bg-[#F3F9FA] dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-white transition-colors duration-300">
      {/* Subtle Ambient Glows (only prominent in dark mode) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/5 dark:bg-teal-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-cyan-500/5 dark:bg-cyan-600/10 blur-3xl" />
      </div>

      {/* Header & Step Indicator */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-10 pb-4 max-w-2xl mx-auto w-full">
        {step !== "level" ? (
          <button
            onClick={() =>
              setStep(step === "profile" ? "intent" : "level")
            }
            className="flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1 px-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-20" />
        )}

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-8 bg-[#00A8A8] dark:bg-teal-400 shadow-xs"
                  : i < stepIndex
                  ? "w-2 bg-[#00A8A8]/50 dark:bg-teal-600/60"
                  : "w-2 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
        <div className="w-20" />
      </header>

      {/* Content Area */}
      <main className="relative z-10 flex-1 px-5 pt-4 pb-16 max-w-xl mx-auto w-full flex flex-col justify-center">
        
        {/* STEP 1 — Education Level (Matching User Screenshot Exactly) */}
        {step === "level" && (
          <div className="animate-fadeInUp space-y-6">
            <div className="space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#00A8A8] text-white shadow-sm shadow-teal-600/15 dark:shadow-teal-500/25 mb-4">
                <GraduationCap className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-3xl font-black text-[#0D1C2E] dark:text-white tracking-tight">
                Where are you right now?
              </h1>
              <p className="text-[#66778C] dark:text-slate-400 text-sm font-semibold">
                This helps Pathfinder AI personalize everything for you.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {EDUCATION_LEVELS.map((level) => {
                const Icon = level.icon;
                const isSelected = educationLevel === level.id;
                return (
                  <button
                    key={level.id}
                    id={`level-${level.id}`}
                    onClick={() => setEducationLevel(level.id)}
                    className={`w-full flex items-center p-5 rounded-2xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-white dark:bg-slate-800 border-2 border-[#00A8A8] dark:border-teal-400 shadow-[0_4px_16px_rgba(0,168,168,0.12)]"
                        : "bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl mr-4 ${
                        isSelected
                          ? "bg-[#00A8A8]/10 text-[#00A8A8] dark:bg-teal-400/20 dark:text-teal-400"
                          : "bg-[#EDF2F6] text-[#4E6278] dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#0D1C2E] dark:text-white text-base leading-tight mb-1">{level.label}</p>
                      <p className="text-xs font-semibold text-[#66778C] dark:text-slate-400 leading-normal">{level.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#00A8A8] dark:bg-teal-400 flex items-center justify-center ml-3 shadow-xs">
                        <Check className="h-3.5 w-3.5 text-white dark:text-slate-950 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                id="btn-next-level"
                onClick={() => setStep("intent")}
                disabled={!educationLevel}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#00A8A8] hover:bg-[#009292] dark:bg-teal-500 dark:hover:bg-teal-400 py-4 font-black text-white dark:text-slate-950 shadow-md shadow-teal-700/15 dark:shadow-teal-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99] text-base"
              >
                <span>Continue</span>
                <ChevronRight className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Intent */}
        {step === "intent" && (
          <div className="animate-fadeInUp space-y-6">
            <div className="space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-indigo-600 text-white shadow-sm shadow-indigo-600/15 dark:shadow-indigo-500/25 mb-4">
                <Sparkles className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-3xl font-black text-[#0D1C2E] dark:text-white tracking-tight">
                What brings you here?
              </h1>
              <p className="text-[#66778C] dark:text-slate-400 text-sm font-semibold">
                Pathfinder AI adapts entirely to your goal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {INTENTS.map((item) => {
                const Icon = item.icon;
                const isSelected = intent === item.id;
                return (
                  <button
                    key={item.id}
                    id={`intent-${item.id}`}
                    onClick={() => setIntent(item.id)}
                    className={`w-full flex items-center p-5 rounded-2xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 shadow-[0_4px_16px_rgba(79,70,229,0.12)]"
                        : "bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl mr-4 ${
                        isSelected
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400"
                          : "bg-[#EDF2F6] text-[#4E6278] dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#0D1C2E] dark:text-white text-base leading-tight mb-1">{item.label}</p>
                      <p className="text-xs font-semibold text-[#66778C] dark:text-slate-400 leading-normal">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 dark:bg-indigo-400 flex items-center justify-center ml-3 shadow-xs">
                        <Check className="h-3.5 w-3.5 text-white dark:text-slate-950 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                id="btn-next-intent"
                onClick={() => setStep("profile")}
                disabled={!intent}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 py-4 font-black text-white dark:text-slate-950 shadow-md shadow-indigo-600/15 dark:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99] text-base"
              >
                <span>Continue</span>
                <ChevronRight className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Profile Setup */}
        {step === "profile" && (
          <div className="animate-fadeInUp space-y-6">
            <div className="space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-amber-500 text-white shadow-sm shadow-amber-500/15 dark:shadow-amber-500/25 mb-4">
                <BookOpen className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-3xl font-black text-[#0D1C2E] dark:text-white tracking-tight">
                Tell us about yourself
              </h1>
              <p className="text-[#66778C] dark:text-slate-400 text-sm font-semibold">
                Pick what resonates — you can always update this later.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Interests */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Select Your Interests</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMMON_INTERESTS.map((item) => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        id={`interest-${item.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => toggleItem(item, selectedInterests, setSelectedInterests)}
                        className={`rounded-full px-3.5 py-2 text-xs transition-all duration-200 border ${
                          isSelected
                            ? "bg-[#00A8A8] border-[#00A8A8] text-white font-black shadow-xs"
                            : "bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 font-bold"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Select Skills You Have</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMMON_SKILLS.map((item) => {
                    const isSelected = selectedSkills.includes(item);
                    return (
                      <button
                        key={item}
                        id={`skill-${item.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => toggleItem(item, selectedSkills, setSelectedSkills)}
                        className={`rounded-full px-3.5 py-2 text-xs transition-all duration-200 border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white font-black shadow-xs"
                            : "bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 font-bold"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Role (optional) */}
              {intent === "guided_existing" && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span>What career are you in or pursuing?</span>
                  </p>
                  <input
                    type="text"
                    id="input-target-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Nurse, UX Designer..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00A8A8] focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <button
                id="btn-finish-onboarding"
                onClick={handleFinish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#00A8A8] hover:bg-[#009292] dark:bg-teal-500 dark:hover:bg-teal-400 py-4 font-black text-white dark:text-slate-950 shadow-md shadow-teal-700/15 dark:shadow-teal-500/20 transition-all disabled:opacity-60 active:scale-[0.99] text-base"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 rounded-full animate-spin" />
                    <span>Setting up your journey...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Launch Pathfinder</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs font-semibold text-[#66778C] dark:text-slate-500">
                You can update everything in your Profile settings later
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
