"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";
import { RoadmapSidebar } from "@/components/roadmap/RoadmapSidebar";
import { Loader2, Compass } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface RoadmapResponse {
  id?: string;
  title?: string;
  description?: string;
  nodes?: Array<{
    id: string;
    title: string;
    description?: string;
    type?: string;
    status?: string;
  }>;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const roadmapId = params.id as string;
  const { token } = useAuth();

  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      if (!token) return; 

      try {
        const res = await fetch(`/api/roadmaps/${roadmapId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch roadmap");
        const rawData = await res.json();
        
        // --- THE FIX: Smart Data Unpacking ---
        // If your API sends { data: { ... } } or { roadmap: { ... } }, this extracts it.
        // If it sends the raw object, it just uses rawData.
        const actualRoadmap = rawData.data || rawData.roadmap || rawData;
        
        console.log("Successfully unpacked Roadmap Data:", actualRoadmap);
        setRoadmap(actualRoadmap);

        const progressRes = await fetch(`/api/user/progress`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          // Unpack progress data safely as well
          const actualProgress = progressData.data || progressData.progress || progressData;
          setUserProgress(Array.isArray(actualProgress) ? actualProgress : []);
        }
      } catch (err) {
        console.error("Error loading roadmap:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId && token) {
      fetchRoadmapData();
    }
  }, [roadmapId, token]); 

  const handleNodeSelect = (nodeId: string) => {
    console.log("Navigated to node:", nodeId);
  };

  const handleNodeComplete = async (nodeId: string) => {
    if (!token) return;

    setUserProgress((prev) => {
      const exists = prev.find((p) => p.nodeId === nodeId);
      if (exists) {
        return prev.map((p) => (p.nodeId === nodeId ? { ...p, status: "completed" } : p));
      }
      return [...prev, { nodeId, status: "completed" }];
    });

    try {
      await fetch('/api/user/progress', { 
        method: 'POST', 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapId, nodeId, status: 'completed' }) 
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm font-medium text-slate-500">Loading your engineered roadmap...</p>
        </div>
      </div>
    );
  }

  // Adjusted safety check to ensure we have a roadmap object AND an ID
  if (error || !roadmap || !roadmap.id) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="text-center flex flex-col items-center">
          <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 p-6 mb-6">
            <Compass className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Roadmap Not Found</h1>
          <p className="text-slate-500 max-w-sm">{"We couldn't load this roadmap. It may have been deleted or the database connection failed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      <RoadmapSidebar 
        roadmap={roadmap} 
        nodes={roadmap.nodes || []} 
        userProgress={userProgress} 
        onNodeSelect={handleNodeSelect} 
      />
      
      <div className="flex-1 h-full relative">
        <RoadmapViewer 
          roadmap={roadmap} 
          userProgress={userProgress} 
          onNodeComplete={handleNodeComplete} 
        />
      </div>
    </div>
  );
}