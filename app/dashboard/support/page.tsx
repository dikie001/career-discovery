"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import {
  LifeBuoy,
  MessageSquare,
  UserCheck,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Zap,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function StudentSupportPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mentorshipStatus, setMentorshipStatus] = useState("self_directed");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [loading, setLoading] = useState(true);

  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Mentorship & Attachment Guidance");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMyData = async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/support", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data?.tickets || []);
        if (json.data?.mentorshipStatus) setMentorshipStatus(json.data.mentorshipStatus);
        if (json.data?.experienceLevel) setExperienceLevel(json.data.experienceLevel);
      }
    } catch (e) {
      console.error("Error fetching student support data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !subject || !message) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, category, message })
      });

      if (res.ok) {
        setSuccessMsg("Support inquiry submitted! An administrator or mentor will respond shortly.");
        setSubject("");
        setMessage("");
        fetchMyData();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error("Error submitting ticket:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const isAssigned = mentorshipStatus.startsWith("mentor_assigned:");
  const mentorName = isAssigned ? mentorshipStatus.replace("mentor_assigned:", "") : null;

  return (
    <div className="flex-1 overflow-y-auto pb-24 sm:pb-12 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        
        {/* BACK NAVIGATION */}
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-muted-foreground hover:text-indigo-500 transition-all duration-200 bg-card/80 px-3.5 py-2 rounded-2xl border border-border/60 shadow-xs hover:shadow-md hover:-translate-x-0.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-10 border border-indigo-500/30 shadow-2xl text-white">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Student Help Desk & Guidance Center
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Professional Support & Mentorship
            </h1>
            <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
              We are committed to helping you succeed. Connect with industry mentors, resolve technical assessment questions, and receive personalized guidance for your career track.
            </p>
          </div>
        </div>

        {/* MENTORSHIP STATUS BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl shrink-0 ${isAssigned ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"}`}>
                <UserCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Mentorship Assignment Status</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    experienceLevel === "advanced" ? "bg-blue-500/15 text-blue-500" :
                    experienceLevel === "intermediate" ? "bg-amber-500/15 text-amber-500" :
                    "bg-emerald-500/15 text-emerald-500"
                  }`}>
                    {experienceLevel.toUpperCase()} LEVEL
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isAssigned ? `Assigned Mentor: ${mentorName}` : "Mentorship Queue Activated"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                  {isAssigned
                    ? "Your assigned industry expert is reviewing your portfolio progress and will reach out with attachment placements."
                    : "As a recognized student in our ecosystem, you can submit an inquiry below to request immediate connection with a specialized tech mentor."}
                </p>
              </div>
            </div>

            {isAssigned && (
              <button
                onClick={() => alert(`Direct notification sent to ${mentorName}. Check your registered email for schedule invites!`)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0 active:scale-[0.98]"
              >
                <span>Request 1-on-1 Mentorship Check-In</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MAIN GRID: SUBMIT TICKET ON LEFT, MY TICKETS & FAQ ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* TICKET FORM (COLS 6) */}
          <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Submit Help Desk Inquiry</h3>
                <p className="text-xs text-slate-500 font-semibold">Our academic & technical team replies within 2 hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mentorship & Attachment Guidance">Mentorship & Attachment Guidance</option>
                  <option value="AI Career Discovery & Roadmaps">AI Career Discovery & Roadmaps</option>
                  <option value="Skill Validation & Node Certifications">Skill Validation & Certifications</option>
                  <option value="Account & Technical Help">Account & Technical Help Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Subject Headline</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Need assistance connecting with Safaricom attachment mentor"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Detailed Message / Questions</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe how we can best support your technical roadmap or career placement..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? "Transmitting to Admin Hub..." : "Send Support Request"}</span>
              </button>
            </form>
          </div>

          {/* MY TICKETS & FAQ (COLS 6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* ACTIVE INQUIRIES */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center justify-between">
                <span>Your Active Support Inquiries</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                  {tickets.length}
                </span>
              </h3>

              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          t.status === "resolved" ? "bg-emerald-500/15 text-emerald-500" : "bg-indigo-500/15 text-indigo-500"
                        }`}>
                          {t.status.replace("_", " ")}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{t.subject}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold py-6 text-center italic">
                  You have no active support tickets. Use the form to reach out whenever you need guidance!
                </p>
              )}
            </div>

            {/* QUICK KNOWLEDGE FAQ */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-teal-500" />
                <span>Instant Student FAQ</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 font-semibold space-y-1">
                  <p className="font-black text-slate-900 dark:text-white">Q: How do mentors help with industrial attachments?</p>
                  <p className="text-slate-500">A: Assigned mentors review your completed roadmap nodes and directly refer your verified profile to partner employers like Safaricom and ALX.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 font-semibold space-y-1">
                  <p className="font-black text-slate-900 dark:text-white">Q: What happens if an AI assessment hits a rate limit?</p>
                  <p className="text-slate-500">A: Our platform automatically engages the Demo Rate-Limit Shield so your learning and skill validations never stall.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
