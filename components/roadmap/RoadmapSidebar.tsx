import React from "react";
import { ChevronRight, CheckCircle2, Lock, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  nodes: any[];
  userProgress: any[];
  onNodeSelect: (nodeId: string) => void;
}

export function RoadmapSidebar({ nodes, userProgress, onNodeSelect }: SidebarProps) {
  // Map progress by nodeId
  const progressMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    userProgress.forEach(p => {
      map[p.nodeId] = p.status;
    });
    return map;
  }, [userProgress]);

  // Group nodes by type for navigation
  const groupedNodes = React.useMemo(() => {
    return nodes.reduce((acc, node) => {
      const type = node.type || "other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(node);
      return acc;
    }, {} as Record<string, typeof nodes>);
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
    <div className="w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 h-full overflow-y-auto flex flex-col p-4 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          Quick Navigation
        </h2>
        
        {Object.entries(groupedNodes).map(([type, items]) => (
          <div key={type} className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              {type.replace("_", " ")}
            </h3>
            <ul className="space-y-1">
              {(items as any[]).map(node => {
                const status = progressMap[node.id] || "locked";
                return (
                  <li key={node.id}>
                    <button
                      onClick={() => onNodeSelect(node.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-sm transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-slate-800",
                        status === "locked" ? "text-slate-500 dark:text-slate-400 opacity-70" : "text-slate-700 dark:text-slate-200"
                      )}
                    >
                      {getStatusIcon(status)}
                      <span className="truncate">{node.title}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
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
