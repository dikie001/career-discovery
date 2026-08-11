"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import {
  LifeBuoy,
  Users,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  RefreshCw,
  Target,
  Filter,
  Briefcase,
  GraduationCap,
  Compass,
  HelpCircle,
  Layers,
  BookOpen
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  experienceLevel: string;
  educationLevel?: string;
  targetRole: string;
  interests?: string[];
  skills?: string[];
  mentorshipStatus: string;
}

interface TicketItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
}

const INDUSTRY_MENTORS = [
  "Eng. David O. (Safaricom Software & AI Lead)",
  "Dr. Sarah M. (Data Science & Analytics Chief)",
  "Alex K. (Cloud Infrastructure & Security Specialist)",
  "Grace W. (Product & UI/UX Director @ BrighterMonday)",
  "Peter N. (Full-Stack Architecture & Attachment Coach)",
  "Mercy T. (Enterprise Cybersecurity Mentor)",
  "Samuel J. (Machine Learning & Python Executive)"
];

export default function AdminSupportMentorshipPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mentorship" | "tickets">("mentorship");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterCareer, setFilterCareer] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/support", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStudents(json.data?.students || []);
        setTickets(json.data?.tickets || []);
      }
    } catch (e) {
      console.error("Failed to load admin support data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAssignMentor = async (studentId: string, mentorName: string) => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/support", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "assign_mentor",
          studentId,
          assignedMentor: mentorName
        })
      });

      if (res.ok) {
        setSuccessMsg(`Mentor successfully assigned: ${mentorName}`);
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, mentorshipStatus: `mentor_assigned:${mentorName}` } : s
        ));
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error("Error assigning mentor:", e);
    }
  };

  const handleResolveTicket = async (ticketId: string, status: string) => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/support", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "update_ticket",
          ticketId,
          newStatus: status
        })
      });

      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
        setSuccessMsg(`Ticket status updated to ${status.toUpperCase()}!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error("Error updating ticket:", e);
    }
  };

  const requestingCount = students.filter(s => !s.mentorshipStatus?.startsWith("mentor_assigned:") && s.mentorshipStatus !== "self_directed").length;
  const assignedCount = students.filter(s => s.mentorshipStatus?.startsWith("mentor_assigned:")).length;
  const uniqueCareers = Array.from(new Set(students.map(s => s.targetRole || "Software Engineering")));

  const filteredStudents = students.filter(s => {
    const matchQuery = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || (s.targetRole && s.targetRole.toLowerCase().includes(search.toLowerCase()));
    const lvl = (s.experienceLevel || "beginner").toLowerCase();
    const matchLevel = filterLevel === "all" || 
      (filterLevel === "professional" ? (lvl.includes("prof") || lvl.includes("work") || lvl.includes("exp")) : lvl.includes(filterLevel));
    const matchCareer = filterCareer === "all" || (s.targetRole || "Software Engineering").toLowerCase() === filterCareer.toLowerCase();
    
    const isAssigned = s.mentorshipStatus && s.mentorshipStatus.startsWith("mentor_assigned:");
    const isRequesting = !isAssigned && s.mentorshipStatus !== "self_directed";
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "requesting" && isRequesting) ||
      (filterStatus === "assigned" && isAssigned) ||
      (filterStatus === "self_directed" && !isAssigned && !isRequesting);

    return matchQuery && matchLevel && matchCareer && matchStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Student Categorization & Technical Mentorship Hub
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Candidate Rosters & Career Mapping
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Review candidates categorized by onboarding proficiency (Beginner to Professional), map users to target career tracks, and assign dedicated technical mentors to individuals requiring guidance.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm transition-all shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-500 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live Roster</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab("mentorship")}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-t-2xl font-black text-sm transition-all border-b-2 ${
              activeTab === "mentorship"
                ? "bg-indigo-500/10 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Candidate Rosters & Career Maps ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-t-2xl font-black text-sm transition-all border-b-2 ${
              activeTab === "tickets"
                ? "bg-indigo-500/10 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Help Desk Inquiries & Tickets ({tickets.filter(t => t.status === "open").length} Open)</span>
          </button>
        </div>

        {/* TAB 1: MENTORSHIP ROSTER */}
        {activeTab === "mentorship" && (
          <div className="space-y-6">
            
            {/* SUMMARY STATS & QUICK ACTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => { setFilterLevel("all"); setFilterStatus("all"); setFilterCareer("all"); }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Candidate Roster</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{students.length} Students</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">Click to view all</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div 
                onClick={() => setFilterStatus(filterStatus === "requesting" ? "all" : "requesting")}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all flex items-center justify-between group ${
                  filterStatus === "requesting"
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                }`}
              >
                <div>
                  <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> Requesting Guidance
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{requestingCount} Candidates</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 block">Click to filter requiring mentor</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <HelpCircle className="h-6 w-6" />
                </div>
              </div>

              <div 
                onClick={() => setFilterStatus(filterStatus === "assigned" ? "all" : "assigned")}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all flex items-center justify-between group ${
                  filterStatus === "assigned"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-900 dark:text-emerald-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Dedicated Mentors Assigned</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{assignedCount} Assigned</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Click to review assigned</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Mapped Career Tracks</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{uniqueCareers.length} Tracks</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">From Onboarding Intent</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* ADVANCED FILTER CONSOLE */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              {/* Row 1: Search and Guidance Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, email, or career track..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5" /> Guidance Status:
                  </span>
                  {[
                    { id: "all", label: "All Candidates" },
                    { id: "requesting", label: "Requires Guidance (Requested)" },
                    { id: "assigned", label: "Mentor Assigned" },
                    { id: "self_directed", label: "Self-Directed" }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setFilterStatus(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        filterStatus === st.id
                          ? st.id === "requesting" ? "bg-amber-600 text-white shadow-md shadow-amber-500/20" : "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Onboarding Categorization (Beginner to Professional) */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> Categorized Level (Beginner to Professional):
                </span>
                {[
                  { id: "all", label: "All Levels" },
                  { id: "beginner", label: "Beginner (Foundation)" },
                  { id: "intermediate", label: "Intermediate (Project Stage)" },
                  { id: "advanced", label: "Advanced (Specializing)" },
                  { id: "professional", label: "Professional (Industry Ready)" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilterLevel(btn.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      filterLevel === btn.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Row 3: Mapped Career Track Filter */}
              {uniqueCareers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Compass className="h-3.5 w-3.5 text-purple-500" /> Mapped Career Track:
                  </span>
                  <button
                    onClick={() => setFilterCareer("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      filterCareer === "all" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    All Careers
                  </button>
                  {uniqueCareers.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCareer(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                        filterCareer.toLowerCase() === c.toLowerCase()
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* STUDENTS ROSTER TABLE & CAREER MAPPING */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 font-extrabold text-sm">Loading categorized candidate rosters from onboarding data...</div>
              ) : filteredStudents.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredStudents.map((stud) => {
                    const lvl = (stud.experienceLevel || "beginner").toLowerCase();
                    const isProfessional = lvl.includes("prof") || lvl.includes("work") || lvl.includes("exp");
                    const isAdvanced = !isProfessional && lvl.includes("adv");
                    const isIntermediate = !isProfessional && !isAdvanced && (lvl.includes("int") || lvl.includes("mid") || lvl.includes("univ"));
                    
                    const isAssigned = stud.mentorshipStatus && stud.mentorshipStatus.startsWith("mentor_assigned:");
                    const assignedName = isAssigned ? stud.mentorshipStatus.replace("mentor_assigned:", "") : null;
                    const isRequesting = !isAssigned && stud.mentorshipStatus !== "self_directed";

                    return (
                      <div key={stud.id} className="p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* LEFT STUDENT & CAREER MAPPING INFO */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-500/20">
                            {stud.name ? stud.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="font-black text-lg text-slate-900 dark:text-white">{stud.name || "Student User"}</h4>
                              <span className="text-xs font-bold text-slate-500">({stud.email})</span>
                              
                              {/* ONBOARDING LEVEL BADGE (Beginner to Professional) */}
                              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                                isProfessional ? "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300" :
                                isAdvanced ? "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300" :
                                isIntermediate ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300" :
                                "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                              }`}>
                                {isProfessional ? "Professional / Industry" : isAdvanced ? "Advanced / Senior" : isIntermediate ? "Intermediate / Projects" : "Beginner / Foundation"}
                              </span>

                              {/* GUIDANCE NEEDED ALERT BADGE */}
                              {isRequesting && (
                                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1 border border-amber-500/30 animate-pulse">
                                  <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  Requires Technical Mentor (Requested Guidance)
                                </span>
                              )}
                            </div>

                            {/* CAREER TRACK & ONBOARDING COMPETENCIES MAPPING BOX */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                                <Target className="h-4 w-4 text-indigo-500 shrink-0" />
                                <span>Mapped Career Track:</span>
                                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">{stud.targetRole || "Software Engineering"}</span>
                              </div>
                              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                              <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>Onboarding Background: {stud.educationLevel ? stud.educationLevel.replace("_", " ").toUpperCase() : "UNIVERSITY / COLLEGE"}</span>
                              </div>
                              {stud.skills && stud.skills.length > 0 && (
                                <>
                                  <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                                  <div className="flex items-center gap-1 font-bold text-slate-500 truncate max-w-[240px]">
                                    <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>Skills: {stud.skills.slice(0, 3).join(", ")}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT MENTOR ASSIGNMENT ACTION */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                          {isAssigned ? (
                            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-2 shadow-xs">
                              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] uppercase tracking-wider opacity-80">Dedicated Mentor</span>
                                <span>{assignedName}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-400 italic flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-2 rounded-xl">
                              <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                              <span>No personal mentor assigned yet</span>
                            </div>
                          )}

                          <select
                            onChange={(e) => {
                              if (e.target.value) handleAssignMentor(stud.id, e.target.value);
                              e.target.value = "";
                            }}
                            defaultValue=""
                            className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 shadow-md shadow-indigo-500/25 transition-all cursor-pointer focus:outline-none min-w-[200px]"
                          >
                            <option value="" disabled>{isAssigned ? "Reassign Mentor..." : "Assign Dedicated Mentor..."}</option>
                            {INDUSTRY_MENTORS.map((m) => (
                              <option key={m} value={m} className="bg-slate-900 text-white font-bold">{m}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Filter className="h-6 w-6" />
                  </div>
                  <h4 className="font-black text-slate-700 dark:text-slate-300 text-base">No candidate rosters found matching this filter criteria</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting the experience level (Beginner to Professional), guidance status, or career track filters.</p>
                  <button
                    onClick={() => { setFilterLevel("all"); setFilterStatus("all"); setFilterCareer("all"); setSearch(""); }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 shadow-sm transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: HELP DESK SUPPORT TICKETS */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Student Support & Mentorship Inquiries</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-black">
                  {tickets.length} Total
                </span>
              </h3>
            </div>

            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        t.status === "resolved" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                        t.status === "in_progress" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                        "bg-blue-500/15 text-blue-700 dark:text-blue-400 animate-pulse"
                      }`}>
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-extrabold text-slate-400">Category: {t.category}</span>
                      <span className="text-xs font-extrabold text-slate-400">• {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== "in_progress" && (
                        <button
                          onClick={() => handleResolveTicket(t.id, "in_progress")}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-black transition-all"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {t.status !== "resolved" && (
                        <button
                          onClick={() => handleResolveTicket(t.id, "resolved")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-black transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white">{t.subject}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 leading-relaxed">
                      "{t.message}"
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>Submitted by: <strong className="text-slate-800 dark:text-slate-200">{t.userName}</strong> ({t.userEmail})</span>
                    </div>
                  </div>

                </div>
              ))}

              {tickets.length === 0 && (
                <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm">
                  No open Help Desk tickets at this moment.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
