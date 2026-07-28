import React from "react";
import { ChevronRight, CheckCircle2, Lock, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// --- STRICT TYPES ---
export interface RoadmapNodeData {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  resources?: any[];
  skills?: any[];
  projects?: any[];
  certifications?: any[];
}

export interface RoadmapData {
  title?: string;
  description?: string;
}

interface SidebarProps {
  roadmap: RoadmapData; // Added to handle the title card UI
  nodes: RoadmapNodeData[]; // Replaced 'any[]'
  userProgress: Record<string, string>[]; // Replaced 'any[]'
  onNodeSelect: (nodeId: string) => void;
}

export function RoadmapSidebar({ roadmap, nodes, userProgress, onNodeSelect }: SidebarProps) {
  
  // Map progress by nodeId safely
  const progressMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (userProgress && Array.isArray(userProgress)) {
      userProgress.forEach((p) => {
        if (p?.nodeId) {
          map[p.nodeId] = p.status;
        }
      });
    }
    return map;
  }, [userProgress]);

  // Group nodes by type for navigation, strictly typed
  const groupedNodes = React.useMemo(() => {
    return nodes.reduce((acc, node) => {
      const type = node.type || "other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(node);
      return acc;
    }, {} as Record<string, RoadmapNodeData[]>);
  }, [nodes]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "available": return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress": return <PlayCircle className="w-4 h-4 text-amber-500" />;
      default: return <Lock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 h-full overflow-y-auto flex-shrink-0 flex flex-col p-6 space-y-6">
      
      {/* --- NEW: Relocated Title Card --- */}
      <div className="mb-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {roadmap?.title || "Career Roadmap"}
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          {roadmap?.description || "A comprehensive step-by-step master path."}
        </p>
      </div>

      {/* --- Existing Quick Navigation --- */}
      <div>
        <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          Quick Navigation
        </h2>
        
        {Object.entries(groupedNodes).map(([type, items]) => (
          <div key={type} className="mb-6">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
              {type.replace("_", " ")}
            </h3>
            <ul className="space-y-1.5">
              {items.map((node) => {
                const status = progressMap[node.id] || "locked";
                return (
                  <li key={node.id}>
                    <button
                      onClick={() => onNodeSelect(node.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-slate-800",
                        status === "locked" 
                          ? "text-slate-500 dark:text-slate-400 opacity-70" 
                          : "text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {getStatusIcon(status)}
                      <span className="truncate">{node.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}