"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import{RoadmapSidebar} from "@/components/roadmap/RoadmapSidebar";
import {RoadmapViewer} from "@/components/roadmap/RoadmapViewer";

interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  type: string;
  isRoot?: boolean;
}

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  edges?: Array<{ sourceId: string; targetId: string }>;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuth();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRoadmapData = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`/api/roadmaps/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap);
        setUserProgress(data.progress || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  // Use a ref to prevent cascading effect warnings on initial mount
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const handleNodeSelect = (nodeId: string) => {
    console.log("Selected node:", nodeId);
  };

  const handleNodeComplete = async (nodeId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/user/roadmaps/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapId: id, nodeId })
      });
      if (res.ok) {
        fetchRoadmapData(); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="p-8 text-center text-slate-500">
        Roadmap not found.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-50 dark:bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Sidebar - Hidden on mobile, visible on medium+ screens */}
      <div className="hidden md:block">
        <RoadmapSidebar 
          nodes={roadmap.nodes} 
          userProgress={userProgress} 
          onNodeSelect={handleNodeSelect} 
        />
      </div>
      
      {/* Main Graph Area */}
      <div className="flex-1 relative w-full h-full">
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 max-w-[75%] md:max-w-md pointer-events-none">
          <h1 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">
            {roadmap.title}
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 md:line-clamp-none">
            {roadmap.description}
          </p>
        </div>
        
        <RoadmapViewer 
          roadmap={roadmap} 
          userProgress={userProgress} 
          onNodeComplete={handleNodeComplete} 
        />
      </div>
    </div>
  );
}