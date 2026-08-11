"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import { 
  Globe, 
  PlusCircle, 
  Trash2, 
  ExternalLink, 
  Briefcase, 
  Trophy, 
  Megaphone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Building2,
  Newspaper
} from "lucide-react";
import Link from "next/link";

interface OpportunityItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string;
  url: string;
  createdAt: string;
}

export default function AdminOpportunitiesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Nairobi & All 47 Counties, Kenya");
  const [type, setType] = useState("job");
  const [url, setUrl] = useState("");

  const fetchOpportunities = async () => {
    try {
      const res = await apiFetch("/api/opportunities");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching opportunities:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title || !company) return;

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await apiFetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, company, location, type, url })
      });

      if (res.ok) {
        setSuccessMsg("Opportunity successfully published to the public student hub!");
        setTitle("");
        setCompany("");
        setUrl("");
        fetchOpportunities();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        alert("Failed to create opportunity. Please check admin authorization.");
      }
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to remove this posting from the live hub?")) return;

    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/opportunities?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> Admin Broadcast Console
            </div>
            <h1 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-teal-500 shrink-0" />
              <span>Manage Opportunities & News</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Post new corporate jobs, industrial attachments, hackathons, and real-time news directly to the student portal.
            </p>
          </div>

          <Link
            href="/dashboard/opportunities"
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 font-black text-xs sm:text-sm text-slate-700 dark:text-slate-300 shadow-xs transition-all shrink-0"
          >
            <span>Preview Student Hub</span>
            <ExternalLink className="h-3.5 w-3.5 text-teal-500" />
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MAIN LAYOUT: FORM ON LEFT, LIST ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* CREATE OPPORTUNITY FORM (COLS 5) */}
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs sm:shadow-md space-y-4 sm:space-y-5 sticky top-6">
            <div className="flex items-center gap-2.5 sm:gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Publish New Posting</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold">Instantaneous broadcast to student portal</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 mb-1">Opportunity Title or Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Youth Tech Mentorship Program 2026"
                  className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 mb-1">Company, Organizer or Publisher</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Safaricom PLC / Google Devs / TechCabal"
                  className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 mb-1">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="job">Corporate Job Vacancy</option>
                  <option value="internship">Graduate Internship</option>
                  <option value="attachment">Industrial Attachment / Placement</option>
                  <option value="hackathon">Tech Community Hackathon & Sprint</option>
                  <option value="news">Tech Ecosystem News</option>
                  <option value="announcement">Official Pathfinder Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 mb-1">Location or Scope</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nairobi / Hybrid / Remote Global"
                  className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-extrabold uppercase text-slate-500 mb-1">Apply URL (Optional)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://safaricom.co.ke/careers"
                  className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm shadow-md shadow-teal-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Sparkles className="h-4 w-4 fill-white" />}
                <span>{submitting ? "Publishing..." : "Publish Opportunity Now"}</span>
              </button>
            </form>
          </div>

          {/* ACTIVE LIVE POSTINGS LIST (COLS 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Admin Postings</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-extrabold">
                  {items.length}
                </span>
              </h3>
              <button onClick={fetchOpportunities} className="text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:underline">
                Refresh List
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-extrabold uppercase">Loading Opportunities Database...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => {
                  const isDel = deletingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                          {item.type === "hackathon" && <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
                          {item.type === "news" && <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />}
                          {item.type === "announcement" && <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />}
                          {["job", "internship", "attachment"].includes(item.type) && <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
                              {item.type}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mt-1 leading-snug truncate">{item.title}</h4>
                          <div className="text-xs font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-slate-700 dark:text-slate-300 font-black">{item.company}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1 text-[11px] sm:text-xs"><MapPin className="h-3 w-3 text-teal-500 shrink-0" /> {item.location || "Kenya"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:w-auto sm:border-0 shrink-0">
                        {item.url && item.url !== "#" && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            title="Visit URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isDel}
                          className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                          title="Delete from Live Hub"
                        >
                          {isDel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-500 inline-flex mx-auto">
                  <Megaphone className="h-8 w-8" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">No custom announcements published yet</h4>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Use the form on the left to publish your first live opportunity or news update during your demo!
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
