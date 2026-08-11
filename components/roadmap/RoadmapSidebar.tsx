import React, { useRef, useState } from "react";
import { ChevronRight, CheckCircle2, Lock, PlayCircle, BookOpen, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

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
  roadmap: RoadmapData;
  nodes: RoadmapNodeData[];
  userProgress: Record<string, string>[];
  onNodeSelect: (nodeId: string) => void;
}

export function RoadmapSidebar({ roadmap, nodes, userProgress, onNodeSelect }: SidebarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);
  
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

  const handleDownloadChecklist = async () => {
    if (!checklistRef.current) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(checklistRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff"
      });
      
      const tempPdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgProps = tempPdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, Math.max(297, pdfHeight + 15)]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const safeTitle = (roadmap?.title || "Career_Roadmap").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`${safeTitle}_Curriculum_Checklist.pdf`);
    } catch (e) {
      console.error("Failed to generate curriculum checklist PDF", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 h-full overflow-y-auto shrink-0 flex flex-col p-4 sm:p-6 space-y-5 sm:space-y-6 relative">
      
      {/* --- Relocated Title Card --- */}
      <div className="mb-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {roadmap?.title || "Career Roadmap"}
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          {roadmap?.description || "A comprehensive step-by-step master path."}
        </p>
        
        <button
          onClick={handleDownloadChecklist}
          disabled={isExporting || nodes.length === 0}
          className="mt-5 w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-60"
          title="Download printable PDF learning guide for offline courses (Udemy, Coursera) when AI tokens are reached"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download PDF Checklist</span>
            </>
          )}
        </button>
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
          💡 Offline study checklist for Udemy & Coursera without AI quota limits.
        </p>
      </div>

      {/* --- Existing Quick Navigation --- */}
      <div className="flex-1">
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
                      <span className="truncate">{node.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* OFF-SCREEN INSTITUTIONAL CURRICULUM CHECKLIST (FOR PDF EXPORT) */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none z-0">
        <div 
          ref={checklistRef} 
          style={{ width: "210mm", minHeight: "297mm", padding: "20mm", background: "#ffffff", color: "#0f172a", fontFamily: "sans-serif" }}
          className="bg-white text-slate-900"
        >
          {/* Institutional Header */}
          <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "15px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.5px", margin: 0, color: "#0f172a" }}>
                {roadmap?.title || "Career Curriculum"}
              </h1>
              <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", margin: "4px 0 0 0" }}>
                PATHFINDER INSTITUTIONAL CURRICULUM & SKILLS CHECKLIST
              </p>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
              <div>DATE: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}</div>
              <div>TOTAL MODULES: {nodes.length}</div>
            </div>
          </div>

          {/* Guidance Banner */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", marginBottom: "25px", fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>
            <strong style={{ color: "#0f172a" }}>INSTRUCTIONS & OFFLINE CONTINUITY:</strong> This curriculum checklist serves as your official study guide. Use this document to track completion of practical milestones and technical competencies across enrolled platforms such as <strong>Udemy, Coursera, GitHub Labs, and MDN Web Docs</strong>. This ensures uninterrupted professional development regardless of live AI token allocations or internet connectivity.
          </div>

          {/* Curriculum Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", border: "1px solid #e2e8f0" }}>
            <thead>
              <tr style={{ background: "#0f172a", color: "#ffffff", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th style={{ padding: "10px 14px", width: "50px", textAlign: "center", borderRight: "1px solid #334155" }}>STATUS</th>
                <th style={{ padding: "10px 14px", width: "110px", borderRight: "1px solid #334155" }}>MODULE TYPE</th>
                <th style={{ padding: "10px 14px" }}>TECHNICAL SKILL / MILESTONE OBJECTIVE</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node, i) => {
                const status = progressMap[node.id] || "locked";
                const isCompleted = status === "completed";
                return (
                  <tr key={node.id || i} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                      <div style={{ width: "20px", height: "20px", border: isCompleted ? "2px solid #059669" : "2px solid #64748b", borderRadius: "4px", margin: "0 auto", backgroundColor: isCompleted ? "#059669" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "bold", fontSize: "12px" }}>
                        {isCompleted ? "✓" : ""}
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#475569", fontSize: "10px", borderRight: "1px solid #e2e8f0", verticalAlign: "top" }}>
                      {(node.type || "skill").replace("_", " ")}
                    </td>
                    <td style={{ padding: "14px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", marginBottom: "4px" }}>
                        {node.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
                        {node.description || "Master core industry foundations, tools, and real-world implementation best practices."}
                      </div>
                      <div style={{ marginTop: "6px", fontSize: "10px", color: "#059669", fontWeight: "700" }}>
                        RECOMMENDED PLATFORMS: Udemy • Coursera • Official Documentation • freeCodeCamp
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Note */}
          <div style={{ marginTop: "40px", paddingTop: "15px", borderTop: "1px solid #e2e8f0", fontSize: "10px", color: "#64748b", display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
            <span>PATHFINDER ACADEMY • OFFLINE LEARNING PROTOCOL</span>
            <span>SEED REF: {roadmap?.title ? roadmap.title.slice(0, 15).toUpperCase() : "DB_CACHE"} • CONTINUOUS MASTERY</span>
          </div>
        </div>
      </div>

    </div>
  );
}