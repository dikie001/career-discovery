"use client";

import React, { useEffect, useState, useRef } from "react";
import { Users, Briefcase, Map, ShieldAlert, BarChart2, CheckCircle, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface AdminReportsData {
  platformStats: {
    totalUsers: number;
    totalRoadmaps: number;
    completedRoadmaps: number;
    completionRate: number;
  };
  engagement: { date: string; activities: number }[];
  trendingCareers: { name: string; count: number }[];
  trendingSkills: { name: string; count: number }[];
}

const COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const generatePDF = async () => {
    if (!reportRef.current) return;
    try {
      const imgData = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0f172a" // slate-900 match
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Platform_Analytics_Report.pdf");
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            System Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">Platform analytics and quick management access.</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Download className="h-5 w-5" />
          Export Admin Report
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Stat Card 1 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Users</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.platformStats.totalUsers || 0}</h3>
            </div>
          </div>
          <Link href="/admin/users" className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Manage users &rarr;
          </Link>
        </div>

        {/* Quick Stat Card 2 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Career Paths</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Database</h3>
            </div>
          </div>
          <Link href="/admin/careers" className="mt-4 block text-sm font-medium text-emerald-600 hover:text-emerald-500">
            Edit careers &rarr;
          </Link>
        </div>

        {/* Quick Stat Card 3 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Roadmaps</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.platformStats.totalRoadmaps || 0}</h3>
            </div>
          </div>
          <Link href="/admin/roadmaps" className="mt-4 block text-sm font-medium text-amber-600 hover:text-amber-500">
            Manage roadmaps &rarr;
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm flex items-start gap-4">
         <ShieldAlert className="h-8 w-8 text-slate-400 shrink-0" />
         <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Administrator Access Logged</h3>
            <p className="text-sm text-slate-500 mt-1">You are currently viewing the system with elevated privileges. Any changes made to the database through the Data Tables will immediately reflect in production for all active users.</p>
         </div>
      </div>

      {/* Analytics Section to be exported */}
      <div ref={reportRef} className="space-y-6 pt-4 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Engagement Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Engagement (Last 7 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.engagement || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line type="monotone" dataKey="activities" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trending Careers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Trending Careers</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.trendingCareers || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    cursor={{ fill: '#334155', opacity: 0.1 }}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trending Skills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top User Skills</h3>
            <div className="h-72 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.trendingSkills || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(data?.trendingSkills || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}