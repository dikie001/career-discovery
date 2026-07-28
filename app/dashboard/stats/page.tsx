"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useDashboard } from "@/contexts/dashboard-context";
import { ScreenHeader } from "@/components/dashboard/ScreenHeader";
import {
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Map,
  Target,
} from "lucide-react";

interface SkillGapData {
  targetCareer: string;
  coveragePercent: number;
  gaps: Array<{ skill: string; status: string; source?: string }>;
  userSkills: string[];
  completedFromRoadmap: string[];
}

export default function DashboardStatsPage() {
  const { token } = useAuth();
  const { progress, loadData } = useDashboard();
  const [skillGap, setSkillGap] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const fetchGap = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch("/api/user/skill-gap", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSkillGap(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGap();
  }, [token]);

  const missing = skillGap?.gaps.filter((g) => g.status === "missing") ?? [];
  const completed = skillGap?.gaps.filter((g) => g.status === "completed") ?? [];
  const inProgress = skillGap?.gaps.filter((g) => g.status === "in_progress") ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-20 font-sans text-foreground antialiased">
      <ScreenHeader title="Dashboard" subtitle="Analytics & skill gaps" />

      <main className="mx-auto w-full max-w-lg space-y-5 px-4 py-5 md:max-w-3xl">
        {/* Overall stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Journey progress</p>
            <p className="mt-1 text-2xl font-black text-teal-400">
              {progress?.overallProgress ?? 0}%
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Skill coverage</p>
            <p className="mt-1 text-2xl font-black text-cyan-400">
              {skillGap?.coveragePercent ?? 0}%
            </p>
          </div>
        </div>

        {/* Skill gap analysis */}
        <section className="rounded-3xl border border-border/50 bg-card/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <BarChart2 className="h-4 w-4 text-amber-400" />
              Skill Gap Analysis
            </h3>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your skills...
            </div>
          ) : skillGap ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Comparing skills for{" "}
                <span className="font-bold text-foreground">{skillGap.targetCareer}</span> against
                your profile, certificates, projects, and completed roadmap steps.
              </p>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                  style={{ width: `${skillGap.coveragePercent}%` }}
                />
              </div>

              {completed.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-teal-400">
                    Skills you have ({completed.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {completed.map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-1 text-[10px] font-semibold text-teal-300"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {g.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inProgress.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-amber-400">In progress</p>
                  <div className="flex flex-wrap gap-2">
                    {inProgress.map((g) => (
                      <span
                        key={g.skill}
                        className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-amber-300"
                      >
                        {g.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missing.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-red-400">
                    Gaps to close ({missing.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-300"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {g.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/dashboard/roadmaps"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700"
              >
                <Map className="h-4 w-4" />
                Continue roadmap to close gaps
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete onboarding and start a roadmap to see skill gap analysis.
            </p>
          )}
        </section>

        {/* Progress stages detail */}
        {progress && (
          <section className="rounded-2xl border border-border/50 bg-card/30 p-4">
            <h3 className="mb-3 text-sm font-extrabold">Career journey stages</h3>
            <div className="space-y-2">
              {progress.stages
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold">{stage.title}</span>
                    <span className="capitalize text-muted-foreground">
                      {stage.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
