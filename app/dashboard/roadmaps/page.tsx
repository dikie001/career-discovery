"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, BookOpen, Compass, Briefcase, Code, Palette, Calculator, Stethoscope, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useDeviceMode } from "@/contexts/device-mode-context";

interface EnrolledRoadmap {
  id: string;
  roadmapId: string;
  status: string;
  roadmap: {
    id: string;
    title: string;
    description?: string;
  };
  progress?: {
    completedNodes?: string[];
  };
}

// Educational Content based on the Career Wheel Pathways
const CAREER_PATHWAYS = [
  {
    category: "STEM: Technical & Engineering",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    careers: [
      {
        title: "Software Engineer",
        description: "Designs and builds complex software systems, web applications, and backend architectures.",
        requirements: ["Algorithms & Data Structures", "Full-stack web development (React, Node.js)", "System Design"],
      },
      {
        title: "Civil Engineer",
        description: "Plans, designs, and oversees construction and maintenance of building structures and infrastructure.",
        requirements: ["Mathematics & Physics", "AutoCAD / 3D Modeling", "Project Management"],
      },
      {
        title: "IT Technician",
        description: "Maintains computer systems, troubleshoots network issues, and ensures enterprise security.",
        requirements: ["Hardware diagnostics", "Network administration", "Cybersecurity basics"],
      }
    ]
  },
  {
    category: "Business Studies & Humanities",
    icon: <Calculator className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    careers: [
      {
        title: "Accountant & Auditor",
        description: "Prepares financial records, ensures tax compliance, and analyzes business financial health.",
        requirements: ["Financial Reporting", "Tax Law", "Analytical Mathematics"],
      },
      {
        title: "Entrepreneur",
        description: "Organizes and operates businesses, taking on greater than normal financial risks to build innovation.",
        requirements: ["Market Research", "Risk Management", "Leadership & Sales"],
      },
      {
        title: "Urban Planner",
        description: "Develops plans and programs for the use of land and physical facilities of towns and cities.",
        requirements: ["Geography & Sociology", "Public Policy", "Data Analysis"],
      }
    ]
  },
  {
    category: "Arts & Sports Science",
    icon: <Palette className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400",
    careers: [
      {
        title: "Graphic Designer",
        description: "Creates visual concepts by hand or using software to communicate ideas that inspire and inform.",
        requirements: ["Color Theory", "Typography", "Adobe Creative Suite"],
      },
      {
        title: "Animator / 3D Modeler",
        description: "Creates multiple images that give an illusion of movement for movies, games, and 3D environments.",
        requirements: ["Blender / Maya", "Anatomy & Physics", "Storyboarding"],
      },
      {
        title: "Sports Therapist",
        description: "Helps athletes prevent and recover from injuries, utilizing sports science to optimize performance.",
        requirements: ["Kinesiology", "First Aid & Rehabilitation", "Anatomy"],
      }
    ]
  },
  {
    category: "Applied & Pure Sciences",
    icon: <Stethoscope className="h-6 w-6 text-rose-500" />,
    color: "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400",
    careers: [
      {
        title: "Biomedical Scientist",
        description: "Carries out laboratory tests on human samples to help clinicians diagnose illnesses and evaluate treatments.",
        requirements: ["Microbiology", "Data Analysis", "Laboratory Procedures"],
      },
      {
        title: "Pharmacist",
        description: "Dispenses prescription medications and provides expertise in the safe use of prescriptions.",
        requirements: ["Chemistry", "Human Physiology", "Attention to Detail"],
      }
    ]
  }
];

export default function CareerExplorerPage() {
  const { viewMode, isRealMobile } = useDeviceMode();
  const isMobileView = viewMode === "mobile" || isRealMobile;
  const { token } = useAuth();
  const router = useRouter();
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);
  const [enrolledRoadmaps, setEnrolledRoadmaps] = useState<EnrolledRoadmap[]>([]);
  const [targetRole, setTargetRole] = useState<string>("");
  const [loadingMyRoadmaps, setLoadingMyRoadmaps] = useState<boolean>(true);

  useEffect(() => {
    const fetchMyData = async () => {
      if (!token) return;
      setLoadingMyRoadmaps(true);
      try {
        const [roadmapsRes, profileRes] = await Promise.all([
          apiFetch("/api/user/roadmaps", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (roadmapsRes.ok) {
          const data = await roadmapsRes.json();
          if (Array.isArray(data)) {
            setEnrolledRoadmaps(data);
          }
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.data?.targetRole) {
            setTargetRole(data.data.targetRole);
          }
        }
      } catch (e) {
        console.error("Error fetching roadmaps/profile:", e);
      } finally {
        setLoadingMyRoadmaps(false);
      }
    };
    fetchMyData();
  }, [token]);

  // Added category parameter
  const handleGenerateRoadmap = async (careerTitle: string, category: string) => {
    if (!token) return;
    setGeneratingTitle(careerTitle);
    
    try {
      const res = await apiFetch("/api/roadmaps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ careerTitle, category }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const correctId = data.roadmapId || data.id;

        if (!correctId) {
          console.error("Critical Error: The API did not return an ID.", data);
          return;
        }

        router.push(`/dashboard/roadmaps/${correctId}`);
      } else {
        console.error("Failed to generate roadmap via API. Status:", res.status);
      }
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setGeneratingTitle(null);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${isMobileView ? "py-4 px-3.5 pb-20" : "py-8 px-4 sm:px-6 lg:px-8 pb-24"}`}>
      {/* Header Section */}
      <div className={isMobileView ? "mb-5 rounded-2xl bg-slate-900 p-4 text-white shadow-md" : "mb-10 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl"}>
        <div className={`flex items-center ${isMobileView ? "gap-3.5" : "gap-5"}`}>
          <div className={`rounded-2xl bg-teal-500/20 backdrop-blur-md shrink-0 ${isMobileView ? "p-2.5" : "p-4"}`}>
            <Compass className={isMobileView ? "h-6 w-6 text-teal-400" : "h-10 w-10 text-teal-400"} />
          </div>
          <div>
            <h1 className={`${isMobileView ? "text-lg" : "text-3xl"} font-black tracking-tight leading-tight`}>
              Career Roadmaps
            </h1>
            {!isMobileView && (
              <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                Dive directly into your chosen specialty roadmap or explore educational pathways across various industries to discover what roles entail.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Active Roadmap Section (Top Priority) */}
      {(enrolledRoadmaps.length > 0 || (targetRole && targetRole !== "General Career")) && (
        <section className="mb-8 space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-400 fill-teal-400/20 animate-pulse" />
              <h2 className={`${isMobileView ? "text-lg" : "text-2xl"} font-black text-slate-900 dark:text-white tracking-tight`}>
                My Career Roadmap
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Specialized Track
            </span>
          </div>

          {loadingMyRoadmaps ? (
            <div className="flex items-center justify-center p-8 bg-card/30 rounded-3xl border border-border/40">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            </div>
          ) : (
            <div className={isMobileView ? "grid grid-cols-1 gap-4" : "grid gap-6 md:grid-cols-2"}>
              {enrolledRoadmaps.map((ur) => (
                <div
                  key={ur.id}
                  onClick={() => router.push(`/dashboard/roadmaps/${ur.roadmapId}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-card to-card/90 p-6 shadow-xl shadow-teal-500/5 hover:border-teal-500 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Active & Enrolled
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">
                        {ur.roadmap?.title || "Specialized Roadmap"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {ur.roadmap?.description || "Your interactive learning curriculum and industry assessments."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Status: <span className="text-teal-500 font-bold capitalize">{ur.status}</span>
                      </span>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-500 group-hover:translate-x-1 transition-transform">
                        Continue Journey <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* If user selected a career but hasn't started its roadmap yet */}
              {enrolledRoadmaps.length === 0 && targetRole && (
                <div className="relative overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-teal-950/40 to-card p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full">
                        Selected Target Career
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                        {targetRole}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">
                        You picked this career during your AI discovery. Let&apos;s build your dynamic step-by-step roadmap and industry-ready assessments.
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateRoadmap(targetRole, "AI Generated")}
                      disabled={generatingTitle === targetRole}
                      className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 transition-all"
                    >
                      {generatingTitle === targetRole ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Preparing...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Start My Roadmap</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* General Knowledge Hub Section Title */}
      <div className="mb-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className={`${isMobileView ? "text-lg" : "text-2xl"} font-black text-slate-800 dark:text-slate-200 tracking-tight`}>
          General Career Knowledge Hub
        </h2>
        {!isMobileView && (
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Explore alternative pathways, industry fundamentals, and skill requirements below.
          </p>
        )}
      </div>

      {/* Pathways Grid */}
      <div className="space-y-8">
        {CAREER_PATHWAYS.map((pathway) => (
          <section key={pathway.category} className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className={`p-1.5 rounded-lg border ${pathway.color}`}>
                {pathway.icon}
              </div>
              <h2 className={`${isMobileView ? "text-base" : "text-2xl"} font-black text-slate-900 dark:text-white`}>
                {pathway.category}
              </h2>
            </div>

            <div className={isMobileView ? "grid grid-cols-1 gap-3" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
              {pathway.careers.map((career) => (
                <div 
                  key={career.title}
                  className={`flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xs sm:shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 ${
                    isMobileView ? "p-4" : "p-6"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {career.title}
                      </h3>
                    </div>
                    
                    <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed ${
                      isMobileView ? "line-clamp-2" : ""
                    }`}>
                      {career.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Key Skills & Focus Areas
                      </h4>
                      <div className={isMobileView ? "flex flex-wrap gap-1.5" : "space-y-1.5"}>
                        {career.requirements.map((req, idx) => (
                          isMobileView ? (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {req}
                            </span>
                          ) : (
                            <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 list-none">
                              <BookOpen className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                              <span>{req}</span>
                            </li>
                          )
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 ${
                    isMobileView ? "mt-3" : "mt-6"
                  }`}>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-bold">Explore Path</span>
                    <button
                      onClick={() => handleGenerateRoadmap(career.title, pathway.category)}
                      disabled={generatingTitle === career.title}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition-all shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {generatingTitle === career.title ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Building...
                        </>
                      ) : (
                        <>
                          Generate Roadmap
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}