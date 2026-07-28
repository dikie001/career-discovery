"use client";

import React from "react";
import { Users, Briefcase, Map, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Overview</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Stat Card 1 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Manage</h3>
            </div>
          </div>
          <Link href="/admin/users" className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all users &rarr;
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
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Content</h3>
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
    </div>
  );
}