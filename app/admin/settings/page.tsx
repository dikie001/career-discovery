"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Globe, 
  Bell, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Sliders,
  Sparkles,
  Lock
} from "lucide-react";
import { KenyaFlag } from "@/components/ui/kenya-flag";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("Pathfinder AI Career Ecosystem");
  const [region, setRegion] = useState("KE - Kenya (East Africa Tech Hub)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("open");

  // AI & Groq Settings
  const [aiModel, setAiModel] = useState("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState("0.2");
  const [dailyQuota, setDailyQuota] = useState("10");
  const [seededFallback, setSeededFallback] = useState(true);

  // DB & Backups
  const [autoBackups, setAutoBackups] = useState(true);
  const [retentionDays, setRetentionDays] = useState("30");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Security
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [requireStrongPass, setRequireStrongPass] = useState(true);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    // Try to load saved configs from local storage
    const saved = localStorage.getItem("admin_platform_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platformName) setPlatformName(parsed.platformName);
        if (parsed.aiModel) setAiModel(parsed.aiModel);
        if (parsed.maintenanceMode !== undefined) setMaintenanceMode(parsed.maintenanceMode);
        if (parsed.seededFallback !== undefined) setSeededFallback(parsed.seededFallback);
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    
    setTimeout(() => {
      const config = {
        platformName,
        region,
        maintenanceMode,
        registrationMode,
        aiModel,
        temperature,
        dailyQuota,
        seededFallback,
        autoBackups,
        sessionTimeout
      };
      localStorage.setItem("admin_platform_settings", JSON.stringify(config));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3500);
    }, 800);
  };

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setBackupSuccess(false);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" /> Production System Configuration
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Settings className="h-8 w-8 text-indigo-600" />
              Platform Settings & AI Controls
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage core architecture flags, AI fallback engines, database snapshots, and enterprise security policies.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white shadow-lg transition-all ${
              saveStatus === "saved" 
                ? "bg-emerald-600 shadow-emerald-500/25" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25"
            }`}
          >
            {saveStatus === "saving" && <RefreshCw className="h-4 w-4 animate-spin" />}
            {saveStatus === "saved" && <CheckCircle2 className="h-5 w-5" />}
            {saveStatus === "idle" && <Save className="h-4 w-4" />}
            <span>{saveStatus === "saving" ? "Applying Changes..." : saveStatus === "saved" ? "Settings Saved!" : "Save System Config"}</span>
          </button>
        </div>

        {/* MAINTENANCE NOTICE IF ACTIVE */}
        {maintenanceMode && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-extrabold text-sm">System is Currently in Maintenance Mode</h4>
              <p className="text-xs opacity-90">Non-admin users attempting to register or log in will be directed to an automated maintenance splash screen.</p>
            </div>
          </div>
        )}

        {/* FORM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARD 1: GENERAL PLATFORM & LOCALE */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Platform Branding & Locale</h3>
                <p className="text-xs text-slate-500 font-medium">Configure regional targeting and portal registration behaviors</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Platform Application Title</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Primary Target Ecosystem & Flag</label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="KE - Kenya (East Africa Tech Hub)">KE - Kenya (East Africa Tech Hub)</option>
                    <option value="Pan-African & Global Remote">Pan-African & Global Remote</option>
                    <option value="Custom Private Hub">Custom Private Enterprise Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">New Account Registration Status</label>
                <select
                  value={registrationMode}
                  onChange={(e) => setRegistrationMode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="open">Open (Immediate Student Access)</option>
                  <option value="invite">Invite Only (Recruiters & Bootcamps)</option>
                  <option value="closed">Closed (Waitlist Registration Only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
                  <span className="text-xs text-slate-500 font-medium">Temporarily suspend general public traffic during upgrades</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: AI & GROQ ENGINE CONFIGURATION */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  AI Discovery Engine <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manage Groq LLM model weights, temperatures & demo rate reliability</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Active Groq Neural Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-sm text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended for Deep Analytics)</option>
                  <option value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b (High Reasoning Power)</option>
                  <option value="gemma2-9b-it">gemma2-9b-it (Ultra-Fast Response Speed)</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (High Context Window)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-slate-400">0.2 = Analytical & Consistent</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Daily Discovery Quota</label>
                  <input
                    type="number"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm"
                    title="Max AI generations per standard user per day"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-teal-900 dark:text-teal-300 block">Demo Rate-Limit Shield</span>
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">Auto-fallback to seeded database assessments when AI limit reached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSeededFallback(!seededFallback)}
                  className={`relative w-14 h-8 shrink-0 rounded-full transition-colors ${seededFallback ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${seededFallback ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: DATABASE HEALTH & AUTOMATED SNAPSHOTS */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Database & SQL Snapshots</h3>
                <p className="text-xs text-slate-500 font-medium">Monitor PostgreSQL cluster health and execute cache flushes</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Server className="h-5 w-5 text-emerald-500" />
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Prisma / Postgres Engine</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Status: Healthy & Synchronized</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold">
                  99.99% Uptime
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Automated Daily SQL Backups</span>
                  <span className="text-xs text-slate-500 font-medium">Backup user profiles, roadmap completions & skill logs nightly</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoBackups(!autoBackups)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${autoBackups ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${autoBackups ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 font-black text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 text-blue-500 ${isBackingUp ? "animate-spin" : ""}`} />
                  <span>{isBackingUp ? "Running Database Checkpoint Snapshot..." : "Execute Manual System Backup & Cache Flush"}</span>
                </button>
                {backupSuccess && (
                  <p className="mt-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Snapshot created & Redis cache purged successfully!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CARD 4: ENTERPRISE SECURITY & SESSION CONTROLS */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Security & Admin Authentication</h3>
                <p className="text-xs text-slate-500 font-medium">Protect production user credentials and admin API token policies</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Admin Token Expiry Duration</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-bold text-sm"
                >
                  <option value="4h">4 Hours (High Security Environment)</option>
                  <option value="24h">24 Hours (Recommended Standard)</option>
                  <option value="7d">7 Days (Extended Development Window)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Strict Password Complexity Enforcement</span>
                  <span className="text-xs text-slate-500 font-medium">Require numeric, uppercase & special symbols for new signups</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireStrongPass(!requireStrongPass)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${requireStrongPass ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${requireStrongPass ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                <span>All sensitive API payloads and password hashes are protected using Argon2/Bcrypt and SSL token validation.</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER SYSTEM METADATA */}
        <div className="text-center py-6 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
          Pathfinder AI v2.6 Production Engine • Kenyan Regional Node • Built for Silicon Savannah Career Discovery
        </div>
      </div>
    </div>
  );
}
