"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Zap, AlertTriangle, ArrowRight, BookOpen, Award, CheckCircle2, Loader2, Target } from "lucide-react";

// Strictly typed interfaces replacing 'any'
interface RecommendedCourse {
  title: string;
  provider?: string;
  url?: string;
}

interface RecommendedProject {
  name: string;
  description?: string;
  url?: string;
}

interface RecommendedCertification {
  name: string;
  provider?: string;
  url?: string;
}

interface GapAnalysis {
  targetRole: string;
  missingSkills: string[];
  recommendations: {
    courses: RecommendedCourse[];
    projects: RecommendedProject[];
    certifications: RecommendedCertification[];
  };
}

export default function SkillGapPage() {
  const { token } = useAuth(); // Removed unused 'user' variable
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch("/api/skill-gap", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setAnalysis(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Unavailable</h2>
          <p className="text-slate-500 mt-2">We couldn&apos;t perform a skill gap analysis right now. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 pb-24">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
              <Zap className="h-4 w-4" /> Automated Analysis
            </div>
            <h1 className="text-3xl font-black tracking-tight">Your Skill Gap Analysis</h1>
            <p className="text-emerald-100 mt-2 font-medium">
              Target Role: <span className="font-bold text-white">{analysis.targetRole}</span>
            </p>
          </div>
          
          <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md md:min-w-50">
            <div className="text-sm font-semibold text-emerald-100 mb-1">Missing Critical Skills</div>
            <div className="text-4xl font-black">{analysis.missingSkills.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Missing Skills List */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-500" />
            Skills to acquire
          </h2>
          {analysis.missingSkills.length > 0 ? (
            <ul className="space-y-3">
              {analysis.missingSkills.map((skill, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-900 dark:text-white">You&apos;re fully equipped!</p>
              <p className="text-sm text-slate-500">You have all the core skills for this role.</p>
            </div>
          )}
        </div>

        {/* Next Steps & Recommendations */}
        <div className="space-y-6 md:col-span-2">
          {/* Courses */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Recommended Courses
              </h2>
            </div>
            {analysis.recommendations.courses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.recommendations.courses.map((course, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{course.provider || "Various"}</p>
                    <a href={course.url || "#"} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
                      Start learning <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No specific courses recommended at this time.</p>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-purple-500" />
              Target Certifications
            </h2>
            {analysis.recommendations.certifications.length > 0 ? (
              <div className="space-y-3">
                {analysis.recommendations.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <div>
                      <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100">{cert.name}</h3>
                      <p className="text-xs text-purple-600 dark:text-purple-300">{cert.provider}</p>
                    </div>
                    {cert.url && (
                      <a href={cert.url} className="text-purple-600 dark:text-purple-400 p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No specific certifications recommended.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}