"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";
import { RoadmapSidebar, RoadmapNodeData } from "@/components/roadmap/RoadmapSidebar";
import { NodeDetailsPanel } from "@/components/roadmap/NodeDetailsPanel"; // Added missing import
import { Loader2, Compass, ArrowLeft, BookOpen, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";

interface RoadmapResponse {
  id?: string;
  title?: string;
  description?: string;
  nodes?: RoadmapNodeData[];
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const roadmapId = params.id as string;
  const { token } = useAuth();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Added missing state for the sliding panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      if (!token) return; 

      try {
        const res = await apiFetch(`/api/roadmaps/${roadmapId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          setError(true);
          return;
        }
        const rawData = await res.json();
        
        const actualRoadmap = rawData.data || rawData.roadmap || rawData;
        setRoadmap(actualRoadmap);

        const progressRes = await apiFetch(`/api/user/progress?roadmapId=${roadmapId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
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
    setSelectedNodeId(nodeId); // Replaced console.log with actual state update
  };

  const handleNodeComplete = async (nodeId: string, validated?: boolean, score?: number) => {
    if (!token) return;

    setUserProgress((prev) => {
      const exists = prev.find((p) => p.nodeId === nodeId);
      if (exists) {
        return prev.map((p) => (p.nodeId === nodeId ? { ...p, status: "completed", validated: validated || p.validated, assessmentScore: score || p.assessmentScore } : p));
      }
      return [...prev, { nodeId, status: "completed", validated, assessmentScore: score }];
    });

    setSelectedNodeId(null); // Close the panel automatically on completion

    try {
      await apiFetch('/api/user/progress', { 
        method: 'POST', 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapId, nodeId, status: 'completed', validated, assessmentScore: score }) 
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

  // Added missing derived variables for the panel
  const activeNode = roadmap.nodes?.find(n => n.id === selectedNodeId) || null;
  const activeNodeStatus = userProgress.find(p => p.nodeId === selectedNodeId)?.status || 'locked';
  const activeNodeValidated = userProgress.find(p => p.nodeId === selectedNodeId)?.validated || false;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-[#0f172a] relative">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push("/dashboard/roadmaps")}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              {roadmap?.title || "Career Roadmap"}
            </h1>
            <p className="text-[10px] text-slate-500 truncate hidden sm:block">
              Tap any node in curriculum to inspect
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-xs shrink-0 hover:bg-teal-600 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <RoadmapSidebar 
          roadmap={roadmap} 
          nodes={roadmap.nodes || []} 
          userProgress={userProgress} 
          onNodeSelect={handleNodeSelect} 
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white dark:bg-slate-900 animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <span className="font-black text-slate-900 dark:text-white text-base">Course Curriculum</span>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RoadmapSidebar 
              roadmap={roadmap} 
              nodes={roadmap.nodes || []} 
              userProgress={userProgress} 
              onNodeSelect={(id) => {
                handleNodeSelect(id);
                setShowMobileSidebar(false);
              }} 
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 h-full min-h-0 relative w-full">
        <RoadmapViewer 
          roadmap={roadmap} 
          userProgress={userProgress} 
          onNodeSelect={handleNodeSelect} 
        />
        
        <NodeDetailsPanel 
          node={activeNode} 
          status={activeNodeStatus}
          isValidated={activeNodeValidated}
          onClose={() => setSelectedNodeId(null)} 
          onComplete={handleNodeComplete} 
        />
      </div>
    </div>
  );
} 