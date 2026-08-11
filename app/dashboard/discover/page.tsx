"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ScreenHeader } from "@/components/dashboard/ScreenHeader";
import {
  MessageSquare,
  Search,
  ClipboardList,
  Briefcase,
  Heart,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  Target,
  ArrowLeft,
  Trash2,
  X,
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  matchPercentage: number;
  salaryRange: string;
  reason: string;
}

export default function DiscoverPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [careers, setCareers] = useState<Array<{ id: string; title: string; category: string; description: string }>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedRecs, setSavedRecs] = useState<string[]>([]);
  
  // State to track which specific roadmap is currently being generated
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");
  const [selectingTitle, setSelectingTitle] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [recRes, careerRes, profileRes] = await Promise.all([
          apiFetch("/api/recommendations", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch("/api/careers", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (recRes.ok) {
          const data = await recRes.json();
          const rawList: Recommendation[] = data.data || [];
          const normalizedList = rawList.map((rec) => {
            let fixedTitle = rec.title;
            if (/^(programming languages|technology interest|soft skills|web technologies)$/i.test(rec.title)) {
              fixedTitle = "Software Engineer";
            }
            return {
              ...rec,
              title: fixedTitle,
              matchPercentage: (rec.matchPercentage && rec.matchPercentage > 0 && rec.matchPercentage <= 100) ? rec.matchPercentage : 88,
            };
          });
          setRecommendations(normalizedList);
        }
        if (careerRes.ok) {
          const data = await careerRes.json();
          setCareers(data.data || []);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.data?.targetRole) {
            setTargetRole(data.data.targetRole);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredCareers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return careers.slice(0, 8);
    return careers.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [careers, search]);

  const toggleSave = (id: string) => {
    setSavedRecs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
    );
  };

  const handleSelectCareer = async (title: string) => {
    if (!token) return;
    setSelectingTitle(title);
    try {
      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole: title }),
      });
      if (res.ok) {
        setTargetRole(title);
      }
    } catch (error) {
      console.error("Failed to select target career", error);
    } finally {
      setSelectingTitle(null);
    }
  };

  const handleUnselectCareer = async (title: string) => {
    if (!token) return;
    setSelectingTitle(title);
    try {
      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole: "" }),
      });
      if (res.ok) {
        setTargetRole("");
      }
    } catch (error) {
      console.error("Failed to unselect target career", error);
    } finally {
      setSelectingTitle(null);
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    if (!token) return;
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    try {
      await apiFetch(`/api/recommendations?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete recommendation", error);
    }
  };

  // Dynamic Roadmap Generator Function
  const handleStartRoadmap = async (careerTitle: string, recId: string) => {
    if (!token) return;
    setGeneratingId(recId);
    
    try {
      const res = await apiFetch("/api/roadmaps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ careerTitle }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/roadmaps/${data.roadmapId}`);
      } else {
        console.error("Failed to generate roadmap via API");
      }
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-20 font-sans text-foreground antialiased">
      <ScreenHeader title="Discover" subtitle="Assessments & AI guidance" />

      <main className="mx-auto w-full max-w-lg space-y-5 px-4 py-5 md:max-w-3xl">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-extrabold text-muted-foreground hover:text-teal-500 transition-all duration-200 bg-card/80 px-3.5 py-2 rounded-2xl border border-border/60 shadow-xs hover:shadow-md hover:-translate-x-0.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* AI Career Assessment */}
        <Link
          href="/dashboard/ai-chat"
          className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600/90 to-teal-800/90 p-5 shadow-xl border border-teal-500/20"
        >
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <Image src="/bot.png" alt="Pathfinder AI" fill className="object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Career Assessment</h3>
              <p className="mt-0.5 text-xs text-teal-100">
                Chat with AI — get matches, confidence scores & why each fits you
              </p>
            </div>
            <Send className="h-5 w-5 text-white/80" />
          </div>
        </Link>
        {/* Quick tools */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/ai-chat"
            className="flex flex-col gap-2 rounded-2xl border border-teal-600/30 bg-teal-500/10 p-4 hover:bg-teal-500/15"
          >
            <MessageSquare className="h-5 w-5 text-teal-400" />
            <span className="text-xs font-bold">AI Chat</span>
          </Link>
          <Link
            href="/dashboard/onboarding"
            className="flex flex-col gap-2 rounded-2xl border border-indigo-600/30 bg-indigo-500/10 p-4 hover:bg-indigo-500/15"
          >
            <ClipboardList className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold">Profile Setup & Assessment</span>
          </Link>
        </div>

        {/* AI Recommendations */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <Sparkles className="h-4 w-4 text-teal-400" />
            AI Recommendations
          </h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Complete a career assessment chat to see personalized recommendations with match scores.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const isSelected = targetRole && targetRole.toLowerCase() === rec.title.toLowerCase();
                return (
                  <div
                    key={rec.id}
                    className={`rounded-2xl border p-4 shadow-sm transition-all ${
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10"
                        : "border-border/50 bg-card/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-teal-300">
                            {index === 0 ? "Top match" : "Recommended"}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                              <CheckCircle2 className="h-3 w-3" /> Selected Target Career
                            </span>
                          )}
                        </div>
                        <h4 className="mt-2 text-sm font-black">{rec.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleSave(rec.id)}
                          className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                          aria-label="Save recommendation"
                          title="Save recommendation"
                        >
                          <Heart className={`h-4 w-4 ${savedRecs.includes(rec.id) ? "fill-red-400 text-red-400" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecommendation(rec.id)}
                          className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                          aria-label="Delete recommendation"
                          title="Remove this recommendation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {rec.reason ? (
                      <p className="mt-3 rounded-xl bg-teal-500/10 px-3 py-2 text-[11px] leading-relaxed text-teal-200/90">
                        <span className="font-bold text-teal-300">Why it fits: </span>
                        {rec.reason}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-teal-600 transition-all"
                          style={{ width: `${Math.min(100, rec.matchPercentage)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground">
                        {rec.matchPercentage}% match
                      </span>
                    </div>

                    {rec.salaryRange ? (
                      <p className="mt-2 text-[10px] font-semibold text-teal-400">{rec.salaryRange}</p>
                    ) : null}

                    <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                      {!isSelected ? (
                        <button
                          onClick={() => handleSelectCareer(rec.title)}
                          disabled={selectingTitle === rec.title}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          {selectingTitle === rec.title ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Selecting...</>
                          ) : (
                            <><Target className="h-3.5 w-3.5" /> Select as My Career Path</>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Selected Target Career
                          </span>
                          <button
                            onClick={() => handleUnselectCareer(rec.title)}
                            disabled={selectingTitle === rec.title}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
                            title="Unselect target career to choose another"
                          >
                            {selectingTitle === rec.title ? (
                              <><Loader2 className="h-3 w-3 animate-spin" /> ...</>
                            ) : (
                              <><X className="h-3.5 w-3.5" /> Unselect</>
                            )}
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleStartRoadmap(rec.title, rec.id)}
                        disabled={generatingId === rec.id}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 disabled:opacity-50 transition-colors"
                      >
                        {generatingId === rec.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating roadmap...
                          </>
                        ) : (
                          <>Open Roadmap →</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Career search */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <Search className="h-4 w-4 text-cyan-400" />
            Career Search
          </h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search careers by title or field..."
            className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <div className="space-y-2">
            {filteredCareers.map((career) => (
              <div
                key={career.id}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3"
              >
                <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{career.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{career.category}</p>
                </div>
              </div>
            ))}
            {filteredCareers.length === 0 && (
              <p className="text-sm text-muted-foreground">No careers match your search.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}