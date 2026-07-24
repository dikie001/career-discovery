"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Map, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  career?: {
    title: string;
  };
}

export default function RoadmapsIndexPage() {
  const { token } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/roadmaps", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRoadmaps(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Career Roadmaps
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Interactive, step-by-step guides to mastering your dream career.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-3">
          <Map className="h-8 w-8 text-amber-500" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap.id}
            href={`/dashboard/roadmaps/${roadmap.id}`}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-500/30 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div>
              <div className="mb-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {roadmap.career?.title || "General"}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {roadmap.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                {roadmap.description}
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-teal-600 dark:text-teal-400">
              View Roadmap
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}

        {roadmaps.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No roadmaps available yet. Go to Discover and click &quot;Start roadmap&quot; on any AI recommendation!
          </div>
        )}
      </div>
    </div>
  );
}