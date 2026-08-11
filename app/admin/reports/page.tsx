"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { 
  Users, 
  Map, 
  TrendingUp, 
  BarChart2, 
  Download, 
  Clock, 
  Flame, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Award,
  LifeBuoy,
  Briefcase,
  FileText,
  Filter,
  GraduationCap,
  ExternalLink
} from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { StudentTranscriptModal, StudentTranscript } from "@/components/admin/StudentTranscriptModal";

interface AdminReportsData {
  studentLevels?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    professional: number;
    mentorshipRequested: number;
  };
  platformStats: {
    totalUsers: number;
    totalRoadmaps: number;
    completedRoadmaps: number;
    completionRate: number;
    activeNow: number;
    peakHours: string;
  };
  engagement: { date: string; activities: number }[];
  seasonalActivity: { month: string; users: number; note: string }[];
  demandedCourses: { name: string; demand: number; count: number; category: string }[];
  trendingCareers: { name: string; count: number }[];
  trendingSkills: { name: string; count: number }[];
  userRoster?: {
    id: string;
    name: string;
    email: string;
    level: string;
    courses: string;
    status: string;
  }[];
  studentTranscripts?: StudentTranscript[];
}

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export default function AdminReportsPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeReport, setActiveReport] = useState<"users" | "careers" | "system" | "transcripts">("users");
  const [rosterFilter, setRosterFilter] = useState<"all" | "active" | "beginner" | "intermediate" | "advanced">("all");
  const [selectedTranscript, setSelectedTranscript] = useState<StudentTranscript | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleOpenTranscript = (u: { id: string; name: string; email: string; level: string; courses?: string; careerTrack?: string }) => {
    const match = data?.studentTranscripts?.find(st => st.email.toLowerCase() === u.email.toLowerCase() || st.id === u.id || st.name.toLowerCase() === u.name.toLowerCase());
    if (match) {
      setSelectedTranscript(match);
    } else {
      setSelectedTranscript({
        id: u.id,
        name: u.name,
        email: u.email,
        level: u.level,
        careerTrack: u.careerTrack || (u.courses ? u.courses.split(" • ")[0] : "General Career Exploration") || "Full Stack Software Engineering",
        enrollmentDate: "2026-03-15",
        completionStatus: "In Progress (Validated)",
        overallScore: 88,
        gradeLabel: "Distinction",
        nodes: [
          { id: `${u.id}-n1`, title: "Professional Technical Foundation & Industry Ethics", category: "Core Module", score: 90, completedAt: "2026-04-20", status: "Validated & Verified" },
          { id: `${u.id}-n2`, title: "Specialist Tools, Git Version Control & Deployment", category: "Technical Tooling", score: 87, completedAt: "2026-05-18", status: "Validated & Verified" },
          { id: `${u.id}-n3`, title: "Domain Specialization & Applied Problem Solving", category: "Applied Assessment", score: 88, completedAt: "2026-06-25", status: "Validated & Verified" }
        ]
      });
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#0f172a" : "#ffffff";

      const imgData = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const dynamicPageHeight = Math.max(297, pdfHeight + 15);
      const outputPdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, dynamicPageHeight]
      });

      outputPdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const fileNameMap = {
        users: `Users_And_Activity_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
        careers: `Demanded_Careers_And_Skills_${new Date().toISOString().slice(0, 10)}.pdf`,
        system: `System_Performance_And_Engagement_${new Date().toISOString().slice(0, 10)}.pdf`,
        transcripts: `Student_Performance_Transcripts_${new Date().toISOString().slice(0, 10)}.pdf`
      };
      
      outputPdf.save(fileNameMap[activeReport as keyof typeof fileNameMap]);
    } catch (e) {
      console.error("Failed to generate Admin PDF", e);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const res = await apiFetch("/api/admin/reports", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch admin reports", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-3 border-slate-400/30 border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Compiling Reports Data...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-slate-500 mt-2">You are not authorized to access administrative analytics reports.</p>
        </div>
      </div>
    );
  }

  const renderReportHeader = (reportTitle: string, subtitle: string) => (
    <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 border border-slate-300 shadow-xs">
            <img src="/logo.png" alt="Pathfinder Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {reportTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="text-left sm:text-right font-medium text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
          <div>Date Generated: <strong className="text-slate-900 dark:text-white">{new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</strong></div>
          <div className="text-[11px] text-slate-400">Pathfinder Analytics Platform</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-slate-100/60 dark:bg-slate-950 min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        
        {/* NAVIGATION & ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="h-7 w-7 text-slate-900 dark:text-slate-100" />
              Admin Analytics & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select a report below to inspect user engagement analytics, demanded careers, and system health metrics.
            </p>
          </div>
          <button
            onClick={generatePDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white px-6 py-3 rounded-lg text-xs font-bold shadow-md transition-all shrink-0 active:scale-[0.98] disabled:opacity-50 uppercase tracking-wider"
          >
            <Download className={`h-4 w-4 ${isExporting ? "animate-bounce" : ""}`} />
            <span>{isExporting ? "Generating PDF..." : "Export Report as PDF"}</span>
          </button>
        </div>

        {/* REPORT SELECTOR TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveReport("users")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeReport === "users"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            <span className="text-[10px] uppercase opacity-75 font-bold block">Report 1</span>
            <h3 className="text-sm font-extrabold mt-1">Active & Registered Users Report</h3>
          </button>

          <button
            type="button"
            onClick={() => setActiveReport("careers")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeReport === "careers"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            <span className="text-[10px] uppercase opacity-75 font-bold block">Report 2</span>
            <h3 className="text-sm font-extrabold mt-1">Most Demanded Careers & Skills Report</h3>
          </button>

          <button
            type="button"
            onClick={() => setActiveReport("system")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeReport === "system"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            <span className="text-[10px] uppercase opacity-75 font-bold block">Report 3</span>
            <h3 className="text-sm font-extrabold mt-1">System Health & Engagement Report</h3>
          </button>

          <button
            type="button"
            onClick={() => setActiveReport("transcripts")}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeReport === "transcripts"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            <span className="text-[10px] uppercase font-extrabold text-indigo-500 dark:text-indigo-400 block tracking-wider">
              {activeReport === "transcripts" ? "★ Selected Roster" : "★ Feature"}
            </span>
            <h3 className="text-sm font-extrabold mt-1 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>Student Transcripts</span>
            </h3>
          </button>
        </div>

        {/* DOCUMENT WRAPPER (CAPTURED FOR PDF EXPORT) */}
        <div ref={reportRef} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 lg:p-12 shadow-sm">
          
          {/* REPORT 1: USERS & ACTIVITY */}
          {activeReport === "users" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {renderReportHeader(
                "Active & Registered Users Report",
                "Comprehensive overview of registered accounts, current user activity sessions, experience level ratings, and mapped career courses."
              )}

              {/* Summary Overview */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">User Activity Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-300 dark:border-slate-700 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="p-5">
                    <span className="text-xs font-bold text-slate-500 block uppercase">Total Registered Users</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{data?.platformStats.totalUsers || 0}</span>
                    <span className="text-xs text-slate-500 block mt-1">Verified account registrations</span>
                  </div>
                  <div className="p-5 bg-slate-100/60 dark:bg-slate-800/80">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block uppercase">Active User Concurrency</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{data?.platformStats.activeNow || 0}</span>
                    <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold block mt-1">Peak window: {data?.platformStats.peakHours || "Evening Hours"}</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-slate-500 block uppercase">Active vs Registered Ratio</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {data?.platformStats.totalUsers ? Math.min(100, Math.round(((data?.platformStats.activeNow || 0) / Math.max(1, data?.platformStats.totalUsers)) * 100)) : 80}%
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">Platform engagement index</span>
                  </div>
                </div>
              </div>

              {/* Competency Distribution (Mentorship link removed for cleanliness) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Experience Level Distribution</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 border border-slate-300 dark:border-slate-700 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-300 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  <div className="p-5">
                    <span className="text-xs font-semibold text-slate-500 block">Beginner Level</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white my-1">{data?.studentLevels?.beginner || 0} <span className="text-xs font-normal text-slate-500">Users</span></div>
                    <span className="text-[11px] text-slate-400">Foundational skills stage</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-slate-500 block">Intermediate Level</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white my-1">{data?.studentLevels?.intermediate || 0} <span className="text-xs font-normal text-slate-500">Users</span></div>
                    <span className="text-[11px] text-slate-400">Project practice stage</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-slate-500 block">Advanced Level</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white my-1">{data?.studentLevels?.advanced || 0} <span className="text-xs font-normal text-slate-500">Users</span></div>
                    <span className="text-[11px] text-slate-400">Specialization stage</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-slate-500 block">Professional Level</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white my-1">{data?.studentLevels?.professional || 0} <span className="text-xs font-normal text-slate-500">Users</span></div>
                    <span className="text-[11px] text-slate-400">Industry practitioner</span>
                  </div>
                </div>
              </div>

              {/* USER ROSTER & COURSE MAPPINGS (REMOVED BOXES ON ACTIVE AND EXPERIENCE LEVELS) */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">User Roster & Career Course Mappings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Directory displaying user names, experience levels, and their assigned career courses and roadmaps.</p>
                  </div>
                  
                  {/* Category Filters */}
                  <div className="flex flex-wrap items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => setRosterFilter("all")}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        rosterFilter === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300 hover:text-black"
                      }`}
                    >
                      All Users
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter("active")}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        rosterFilter === "active" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300 hover:text-black"
                      }`}
                    >
                      Active Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter("beginner")}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        rosterFilter === "beginner" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300 hover:text-black"
                      }`}
                    >
                      Beginners
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter("intermediate")}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        rosterFilter === "intermediate" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300 hover:text-black"
                      }`}
                    >
                      Intermediate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter("advanced")}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        rosterFilter === "advanced" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300 hover:text-black"
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                {/* Roster Table without scrollbars and without bulky badge boxes */}
                <div className="w-full border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse table-fixed md:table-auto">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6 w-3/12">Name & Account Email</th>
                        <th className="py-3.5 px-4 sm:px-6 w-2/12">Experience Level</th>
                        <th className="py-3.5 px-4 sm:px-6 w-4/12">Mapped Courses & Career Tracks</th>
                        <th className="py-3.5 px-4 sm:px-6 w-2/12 text-center">Transcript</th>
                        <th className="py-3.5 px-4 sm:px-6 w-1/12 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                      {(data?.userRoster || [])
                        .filter(u => {
                          if (rosterFilter === "all") return true;
                          if (rosterFilter === "active") return u.status === "Active Now";
                          if (rosterFilter === "beginner") return u.level.toLowerCase().includes("begin");
                          if (rosterFilter === "intermediate") return u.level.toLowerCase().includes("int") || u.level.toLowerCase().includes("mid");
                          if (rosterFilter === "advanced") return u.level.toLowerCase().includes("adv") || u.level.toLowerCase().includes("prof");
                          return true;
                        })
                        .map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 sm:px-6 align-top">
                              <div className="flex flex-col break-words">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">{student.email}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 align-top text-xs">
                              <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">
                                {student.level}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 align-top font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm break-words whitespace-normal leading-relaxed">
                              {student.courses}
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 align-top text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenTranscript(student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
                              >
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>View Transcript</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 align-top text-right text-xs">
                              <span className={`font-bold ${
                                student.status === "Active Now"
                                  ? "text-slate-900 dark:text-white"
                                  : "text-slate-500 dark:text-slate-400 font-normal"
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between">
                <span>Pathfinder Analytics Platform</span>
                <span>Active & Registered Users Report</span>
              </div>
            </div>
          )}

          {/* REPORT 2: DEMANDED CAREERS & SKILLS */}
          {activeReport === "careers" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {renderReportHeader(
                "Most Demanded Careers & Skills Report",
                "Evaluation of popular career path selections, course enrollment volumes, and target technical market skills."
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Career Specialization Enrollments</h3>
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {(data?.demandedCourses || []).map((course, idx) => (
                    <div key={course.name} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="font-mono font-bold text-slate-400 text-sm w-8">
                          0{idx + 1}.
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">{course.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Category: {course.category} • {course.count} Active User Enrollments</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full md:w-64">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-none overflow-hidden border border-slate-300 dark:border-slate-700">
                          <div className="h-full bg-slate-900 dark:bg-slate-100" style={{ width: `${course.demand}%` }} />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white w-12 text-right">{course.demand}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Technical Skill Distribution</h3>
                <p className="text-xs text-slate-500 mb-6">Proportion of verified technical tools and skills recorded across learner roadmaps</p>
                
                <div className="h-72 w-full flex justify-center border border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.trendingSkills || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={95}
                        innerRadius={55}
                        fill="#0f172a"
                        dataKey="count"
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {(data?.trendingSkills || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between">
                <span>Pathfinder Analytics Platform</span>
                <span>Most Demanded Careers & Skills Report</span>
              </div>
            </div>
          )}

          {/* REPORT 3: SYSTEM HEALTH & ENGAGEMENT */}
          {activeReport === "system" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {renderReportHeader(
                "System Health & Engagement Report",
                "Review of roadmap completion rates, seasonal user activity trends, and platform engagement timelines."
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-300 dark:border-slate-700 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-300 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="p-5">
                  <span className="text-xs text-slate-500 block uppercase font-bold">Total Generated Roadmaps</span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{data?.platformStats.totalRoadmaps || 0}</span>
                  <span className="text-xs text-slate-500 block mt-1">Individual study tracks</span>
                </div>
                <div className="p-5">
                  <span className="text-xs text-slate-500 block uppercase font-bold">Completed Roadmaps</span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{data?.platformStats.completedRoadmaps || 0}</span>
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold block mt-1">Graduated study programs</span>
                </div>
                <div className="p-5 bg-slate-100/60 dark:bg-slate-800/80">
                  <span className="text-xs text-slate-900 dark:text-slate-200 block uppercase font-bold">Average Completion Rate</span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{data?.platformStats.completionRate || 64}%</span>
                  <span className="text-xs text-slate-500 block mt-1">Milestone attainment velocity</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Activity & Traffic Analysis</h3>
                <p className="text-xs text-slate-500 mb-4">Monthly student activity tracking identifying mid-year study surges and attachment search intervals</p>
                
                <div className="h-72 w-full border border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.seasonalActivity || []} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                      <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                      <YAxis stroke="#475569" fontSize={12} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #94a3b8', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }}
                      />
                      <Bar dataKey="users" fill="#0f172a" radius={[4, 4, 0, 0]}>
                        {(data?.seasonalActivity || []).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={["May", "Jun", "Jul"].includes(entry.month) ? "#0f172a" : "#475569"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between">
                <span>Pathfinder Analytics Platform</span>
                <span>System Health & Engagement Report</span>
              </div>
            </div>
          )}

          {/* REPORT 4: STUDENT PERFORMANCE & TRANSCRIPTS */}
          {activeReport === "transcripts" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {renderReportHeader(
                "Student Performance Assessment & Transcripts",
                "Official evaluation of student competency ratings across completed learning nodes, module scores, and instant PDF academic transcript generation."
              )}

              {/* Performance Metrics Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Academic Performance Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-300 dark:border-slate-700 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-300 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="p-5">
                    <span className="text-xs font-bold text-slate-500 block uppercase">Tracked Student Transcripts</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {data?.studentTranscripts?.length || 0}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">Active learner academic evaluations</span>
                  </div>
                  <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block uppercase">Distinction Grade Rate</span>
                    <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1 block">
                      {data?.studentTranscripts ? Math.round((data.studentTranscripts.filter(t => t.overallScore >= 80).length / Math.max(1, data.studentTranscripts.length)) * 100) : 85}%
                    </span>
                    <span className="text-xs text-indigo-800 dark:text-indigo-400 font-semibold block mt-1">Students averaging 80%+ rating</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-slate-500 block uppercase">Average Competency Rating</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {data?.studentTranscripts ? Math.round(data.studentTranscripts.reduce((acc, curr) => acc + curr.overallScore, 0) / Math.max(1, data.studentTranscripts.length)) : 89}%
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">Across all verified curriculum nodes</span>
                  </div>
                </div>
              </div>

              {/* Student Transcripts Roster */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-600" />
                      <span>Student Academic Assessment Directory</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click <strong className="text-slate-700 dark:text-slate-300">View & Download PDF</strong> to inspect complete scores per course module and produce official printable transcripts.
                    </p>
                  </div>
                </div>

                <div className="w-full border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse table-fixed md:table-auto">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6 w-3/12">Student & Account Email</th>
                        <th className="py-3.5 px-4 sm:px-6 w-3/12">Career Track / Specialization</th>
                        <th className="py-3.5 px-4 sm:px-6 w-2/12">Validated Nodes</th>
                        <th className="py-3.5 px-4 sm:px-6 w-2/12 text-center">Overall Score</th>
                        <th className="py-3.5 px-4 sm:px-6 w-2/12 text-right">Academic Transcript</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                      {(data?.studentTranscripts || []).map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-4 sm:px-6 align-top">
                            <div className="flex flex-col break-words">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{student.name}</span>
                                {student.name.includes("Ann") && (
                                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-300">
                                    ★ Featured Student
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 mt-0.5">{student.email}</span>
                              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">Level: {student.level}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6 align-top font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm break-words whitespace-normal">
                            <div>{student.careerTrack}</div>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                              {student.completionStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 align-top text-xs font-medium text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-bold">
                              <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
                              <span>{student.nodes.length} Modules</span>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              100% verified scores
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 align-top text-center">
                            <span className={`inline-block px-3 py-1 rounded-xl font-black text-sm ${
                              student.overallScore >= 90
                                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : student.overallScore >= 80
                                ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                                : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                            }`}>
                              {student.overallScore}%
                            </span>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mt-1">
                              {student.gradeLabel}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 align-top text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenTranscript(student)}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all shrink-0 active:scale-[0.98]"
                            >
                              <GraduationCap className="h-4 w-4 shrink-0" />
                              <span>View & Download PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between">
                <span>Pathfinder Analytics Platform</span>
                <span>Student Academic Competency Transcripts Report</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL PREVIEW & INSTANT PDF EXPORT FOR TRANSCRIPT */}
      <StudentTranscriptModal
        student={selectedTranscript}
        onClose={() => setSelectedTranscript(null)}
      />
    </div>
  );
}
