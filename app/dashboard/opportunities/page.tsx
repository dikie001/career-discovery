"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { 
  Briefcase, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Search, 
  Trophy, 
  Flame, 
  GraduationCap, 
  Building2, 
  Globe, 
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KenyaFlag } from "@/components/ui/kenya-flag";
import { useDeviceMode } from "@/contexts/device-mode-context";

interface OpportunityPortal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  url: string;
  location: string;
  tags: string[];
  featured?: boolean;
  badge?: string;
  iconBg: string;
  accent: string;
}

interface TechEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  type: string;
  description: string;
  prize?: string;
  registrationUrl?: string;
  status: string;
  featured?: boolean;
}

const OPPORTUNITY_PORTALS: OpportunityPortal[] = [
  {
    id: "myjobmag",
    name: "MyJobMag Kenya",
    tagline: "Kenya's Premier Job & Attachment Market",
    description: "Daily updated open vacancies, corporate industrial attachments, and graduate internships across tech, analytics, and business sectors across all 47 counties.",
    category: "portal",
    url: "https://www.myjobmag.co.ke",
    location: "Nairobi & Nationwide",
    tags: ["Internships", "Industrial Attachments", "Entry-Level Tech", "All Disciplines"],
    featured: true,
    badge: "Top Pick in Kenya",
    iconBg: "from-blue-600 to-indigo-700",
    accent: "blue"
  },
  {
    id: "brightermonday",
    name: "BrighterMonday Kenya",
    tagline: "East Africa's Largest Talent Platform",
    description: "Connect with verified hiring employers and access specialized graduate talent programs, IT support roles, and verified corporate vacancies.",
    category: "portal",
    url: "https://www.brightermonday.co.ke",
    location: "Nairobi & East Africa",
    tags: ["Verified Recruiters", "IT Jobs", "Career Advice", "Remote Options"],
    featured: true,
    iconBg: "from-teal-600 to-emerald-700",
    accent: "teal"
  },
  {
    id: "alx-africa",
    name: "ALX Africa & Harambee",
    tagline: "Sponsored Tech Career Fellowships",
    description: "Access tuition-free, job-ready technology certifications in Software Engineering, Data Analytics, AI Essentials, and direct connections to pan-African hiring partners.",
    category: "fellowship",
    url: "https://www.alxafrica.com",
    location: "Hybrid / Tech Hubs Nairobi",
    tags: ["Tech Fellowship", "AI & Software", "Career Accelerator", "Free Tuition"],
    badge: "High Growth Path",
    featured: true,
    iconBg: "from-amber-500 to-orange-600",
    accent: "amber"
  },
  {
    id: "fuzu",
    name: "Fuzu Career Marketplace",
    tagline: "Personalized Career Discovery & Jobs",
    description: "An AI-guided career development engine offering automated talent matching for junior software developers, UI/UX designers, and project managers.",
    category: "portal",
    url: "https://www.fuzu.com/kenya/job-seekers",
    location: "Kenya & Uganda",
    tags: ["AI Matching", "Skill Courses", "Junior Developer Roles"],
    iconBg: "from-purple-600 to-pink-600",
    accent: "purple"
  },
  {
    id: "moringa",
    name: "Moringa School Tech Connect",
    tagline: "Premier Dev & Tech Launchpad",
    description: "Explore tech bootcamps, community hackathons, and corporate placement pipelines for aspiring Full Stack Developers, DevOps Engineers, and Product Managers.",
    category: "fellowship",
    url: "https://moringaschool.com",
    location: "Nairobi (Ngong Rd) / Online",
    tags: ["Bootcamp Network", "DevOps & Cloud", "Employer Showcase"],
    iconBg: "from-red-500 to-rose-700",
    accent: "red"
  },
  {
    id: "linkedin-ke",
    name: "LinkedIn Jobs Kenya",
    tagline: "Global Tech Networking & Direct Apply",
    description: "Filter and connect directly with hiring managers from multinational tech companies, fintech startups (Safaricom, Flutterwave, M-Pesa Africa), and NGOs.",
    category: "portal",
    url: "https://www.linkedin.com/jobs/kenya-jobs/",
    location: "Hybrid & Remote Global",
    tags: ["Direct Recruiter Access", "Fintech & Startups", "Remote Software Dev"],
    iconBg: "from-sky-600 to-blue-800",
    accent: "sky"
  },
  {
    id: "psc-kenya",
    name: "PSC Kenya Internship Program",
    tagline: "Government Industrial Attachment & Graduate Internships",
    description: "The Public Service Commission offers quarterly cohort applications for university students seeking recognized IT, networking, and administrative attachments.",
    category: "attachment",
    url: "https://www.publicservice.go.ke",
    location: "All 47 Counties in Kenya",
    tags: ["Govt Attachment", "Public Sector IT", "Certified Experience"],
    badge: "Official Cohorts",
    iconBg: "from-emerald-700 to-green-900",
    accent: "emerald"
  },
  {
    id: "shortlist",
    name: "Shortlist Africa",
    tagline: "Executive & Startup Tech Talent Matcher",
    description: "Specializes in matching ambitious software engineers, data analysts, and product marketers with high-growth African tech startups and social impact ventures.",
    category: "portal",
    url: "https://www.shortlist.net",
    location: "Nairobi / Pan-African",
    tags: ["Startup Careers", "Impact Tech", "Vetted Matching"],
    iconBg: "from-indigo-600 to-purple-700",
    accent: "indigo"
  }
];

const TECH_EVENTS_AND_NEWS: TechEvent[] = [
  {
    id: "techcul-hackathon",
    title: "TechCul Kenya AI & FinTech Hackathon 2026",
    organizer: "Nairobi Tech Hub & AI Innovators",
    date: "August 28 - 30, 2026",
    location: "iHub Nairobi / Hybrid",
    type: "hackathon",
    description: "Join over 500 developers across Kenya for a 48-hour build-a-thon. Build cutting-edge solutions using AI, M-Pesa APIs, and cloud microservices. Connect directly with hiring VC recruiters and senior engineering mentors!",
    prize: "$10,000 Prize Pool + Startup Incubation",
    registrationUrl: "https://hackathons.africa",
    status: "open",
    featured: true
  },
  {
    id: "gdg-nairobi",
    title: "Google Developer Groups (GDG) Nairobi: DevFest & Cloud Meetup",
    organizer: "GDG Nairobi Chapter",
    date: "This Saturday, 10:00 AM EAT",
    location: "Nairobi Garage, Kilimani",
    type: "meetup",
    description: "A practical developer meetup featuring live architectural deep-dives on React 19, Next.js App Router, Flutter, and serverless LLM integrations. Free networking coffee & portfolio review clinic included!",
    status: "upcoming",
    featured: true
  },
  {
    id: "africa-tech-summit",
    title: "Africa Tech Summit Nairobi: Talent Networking Day",
    organizer: "TechCabal & East Africa Tech Council",
    date: "September 14, 2026",
    location: "Sarit Centre Expo Hall, Westlands",
    type: "conference",
    description: "The continent's flagship gathering of tech leaders, product architects, and engineering vice-presidents. Features a dedicated Talent Showcase where candidates can live-demo their projects to top hiring managers.",
    status: "open"
  },
  {
    id: "mlh-global",
    title: "Major League Hacking (MLH): Global Open Software Sprint",
    organizer: "MLH International",
    date: "Every Friday - Sunday (Weekly)",
    location: "100% Virtual / Remote",
    type: "hackathon",
    description: "Participate remotely from anywhere in Kenya in open weekend sprints. Earn official GitHub contributor badges, free API cloud credits, and get shortlisted by remote European and US tech recruiters.",
    prize: "Bounty Trophies & Cloud Credits",
    status: "live"
  },
  {
    id: "tech-pulse",
    title: "Silicon Savannah News: High Demand for Cloud & Cybersecurity Engineers in Kenya",
    organizer: "TechWeez & Industry Analytics",
    date: "Updated Daily",
    location: "Regional Tech Market Analysis",
    type: "news",
    description: "Recent industry survey reveals a 40% year-over-year jump in employer requests for developers skilled in Docker, AWS Cloud, cybersecurity frameworks, and full-stack API integration in Nairobi and remote hubs.",
    status: "live"
  }
];

export default function OpportunitiesHubPage() {
  const { viewMode, isRealMobile } = useDeviceMode();
  const isMobileView = viewMode === "mobile" || isRealMobile;
  const [activeTab, setActiveTab] = useState<"all" | "jobs" | "events">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookmarked, setBookmarked] = useState<string[]>(["myjobmag", "techcul-hackathon"]);
  const [dbPostings, setDbPostings] = useState<any[]>([]);

  useEffect(() => {
    async function getLivePostings() {
      try {
        const res = await apiFetch("/api/opportunities");
        if (res.ok) {
          const json = await res.json();
          setDbPostings(json.data || []);
        }
      } catch (e) {
        console.error("Error loading DB opportunities:", e);
      }
    }
    getLivePostings();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Combine live DB jobs, internships, and attachments with curated portals
  const allPortals: OpportunityPortal[] = [
    ...dbPostings
      .filter(item => ["job", "internship", "attachment"].includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.title,
        tagline: `By ${item.company}`,
        description: `Active verified posting from our partner network. Click to explore terms and submit applications.`,
        category: item.type,
        url: item.url || "#",
        location: item.location || "Kenya",
        tags: ["Live Admin Posting", item.type.toUpperCase(), "Immediate Openings"],
        featured: true,
        badge: "Featured Admin Post",
        iconBg: "from-amber-600 to-red-600",
        accent: "amber"
      })),
    ...OPPORTUNITY_PORTALS
  ];

  // Combine live DB hackathons, news, and announcements with curated events
  const allEvents: TechEvent[] = [
    ...dbPostings
      .filter(item => ["hackathon", "news", "announcement"].includes(item.type))
      .map(item => ({
        id: item.id,
        title: item.title,
        organizer: item.company,
        date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        location: item.location || "Silicon Savannah Hub",
        type: item.type,
        description: `Live broadcast update from Pathfinder Admin Network. Stay informed with latest market alignments and opportunities!`,
        registrationUrl: item.url !== "#" ? item.url : undefined,
        status: "live",
        featured: true
      })),
    ...TECH_EVENTS_AND_NEWS
  ];

  const filteredPortals = allPortals.filter(portal => {
    const matchesSearch = 
      portal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      portal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portal.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCategory === "all" || portal.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredEvents = allEvents.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === "all" || evt.type === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24 sm:pb-12 bg-slate-50/50 dark:bg-background">
      <div className={isMobileView ? "max-w-6xl mx-auto p-3 space-y-3.5" : "max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6"}>
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-muted-foreground hover:text-teal-500 transition-all duration-200 bg-card/80 px-3.5 py-2 rounded-2xl border border-border/60 shadow-xs hover:shadow-md hover:-translate-x-0.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* HERO HEADER */}
        <div className={isMobileView ? "relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-4 border border-teal-500/30 text-white shadow-lg" : "relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 sm:p-10 border border-teal-500/30 shadow-2xl text-white"}>
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {!isMobileView && (
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-teal-300 mb-4 shadow-sm">
                <Sparkles className="h-4 w-4 fill-teal-400 text-teal-400" />
                <span>Career Opportunities & Silicon Savannah Hub</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1">Kenya <KenyaFlag className="inline-block" /> & Pan-African Network</span>
              </div>
            )}
            
            <h1 className={isMobileView ? "text-lg font-black tracking-tight text-white leading-tight" : "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"}>
              Discover Jobs, Internships, & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Live Hackathons</span>
            </h1>
            
            {!isMobileView && (
              <p className="mt-4 text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
                Take the next leap in your career journey. Explore verified Kenyan recruiting engines like MyJobMag, BrighterMonday, PSC industrial attachments, and compete in community hackathons to supercharge your real-world developer portfolio!
              </p>
            )}

            {/* SEARCH & NAVIGATION BAR */}
            <div className={isMobileView ? "mt-3 flex flex-col gap-2.5" : "mt-8 flex flex-col sm:flex-row gap-3"}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, internships, hackathons, skills or firms..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 placeholder-slate-400 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white">
                    Clear
                  </button>
                )}
              </div>

              <div className="flex bg-white/10 p-1 rounded-2xl border border-white/15 self-start sm:self-stretch">
                <button
                  onClick={() => { setActiveTab("all"); setSelectedCategory("all"); }}
                  className={cn("px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all", activeTab === "all" ? "bg-teal-500 text-white shadow-md shadow-teal-500/30" : "text-slate-300 hover:text-white")}
                >
                  All Hubs
                </button>
                <button
                  onClick={() => { setActiveTab("jobs"); setSelectedCategory("all"); }}
                  className={cn("px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all", activeTab === "jobs" ? "bg-teal-500 text-white shadow-md shadow-teal-500/30" : "text-slate-300 hover:text-white")}
                >
                  Jobs & Attachments
                </button>
                <button
                  onClick={() => { setActiveTab("events"); setSelectedCategory("all"); }}
                  className={cn("px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all", activeTab === "events" ? "bg-teal-500 text-white shadow-md shadow-teal-500/30" : "text-slate-300 hover:text-white")}
                >
                  Hackathons & News
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: KENYAN & REGIONAL OPPORTUNITY PORTALS */}
        {(activeTab === "all" || activeTab === "jobs") && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
                  <Briefcase className="h-6 w-6 text-teal-500" />
                  Kenyan Job, Internship & Attachment Platforms
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  Direct access to active corporate placements, PSC university attachments, and graduate recruiter networks.
                </p>
              </div>
              
              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Platforms" },
                  { id: "portal", label: "Job Portals" },
                  { id: "attachment", label: "Attachments" },
                  { id: "fellowship", label: "Fellowships" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      selectedCategory === cat.id
                        ? "bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-400 shadow-xs"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredPortals.length > 0 ? (
              <div className={isMobileView ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
                {filteredPortals.map((portal) => {
                  const isMarked = bookmarked.includes(portal.id);
                  return (
                    <div
                      key={portal.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300"
                    >
                      <div>
                        {/* Top banner / icons */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${portal.iconBg} text-white shadow-md shadow-black/10`}>
                              {portal.category === "attachment" ? <GraduationCap className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                  {portal.name}
                                </h3>
                                {portal.badge && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-black text-[10px] border border-amber-500/20">
                                    {portal.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{portal.tagline}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); toggleBookmark(portal.id); }}
                            className={cn("p-2 rounded-xl transition-colors shrink-0", isMarked ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:bg-muted")}
                            title={isMarked ? "Saved to your bookmarks" : "Save opportunity"}
                          >
                            <Bookmark className={cn("h-4 w-4", isMarked && "fill-current")} />
                          </button>
                        </div>

                        <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                          {portal.description}
                        </p>

                        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                            <MapPin className="h-3.5 w-3.5" /> {portal.location}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{portal.category}</span>
                        </div>

                        {/* Tags */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {portal.tags.map((tag) => (
                            <span key={tag} className="px-2.5 py-1 rounded-lg bg-muted/70 text-muted-foreground text-[11px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" /> Verified Partner Platform
                        </span>
                        <a
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition-all hover:translate-x-0.5 active:scale-[0.98]"
                        >
                          <span>Explore Openings</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h4 className="font-extrabold text-base text-foreground">No matching portals found</h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Try resetting your search query or switching filters above.</p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: TECH HACKATHONS, MEETUPS & INDUSTRY NEWS */}
        {(activeTab === "all" || activeTab === "events") && (
          <div className="space-y-5 pt-6 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Tech Community Hackathons & Industry News
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  Compete in live coding challenges, build high-value portfolio projects, and stay updated with Silicon Savannah tech forecasts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Events" },
                  { id: "hackathon", label: "Hackathons" },
                  { id: "meetup", label: "Meetups & Talks" },
                  { id: "news", label: "Tech News Pulse" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      selectedCategory === cat.id
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-xs"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredEvents.length > 0 ? (
              <div className={isMobileView ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-5"}>
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300",
                      evt.featured 
                        ? "bg-gradient-to-br from-amber-500/5 via-card to-orange-500/5 border-amber-500/30 hover:border-amber-500/50" 
                        : "bg-card border-border/70 hover:border-border"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full font-extrabold text-xs inline-flex items-center gap-1.5 border uppercase tracking-wider",
                          evt.type === "hackathon" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                          evt.type === "meetup" ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" :
                          "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30"
                        )}>
                          {evt.type === "hackathon" && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                          {evt.type === "meetup" && <Zap className="h-3.5 w-3.5 text-indigo-500" />}
                          {evt.type === "news" && <TrendingUp className="h-3.5 w-3.5 text-teal-500" />}
                          {evt.type}
                        </span>

                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-teal-500" /> {evt.date}
                        </span>
                      </div>

                      <h3 className="font-black text-lg sm:text-xl text-foreground mt-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <span>Organized by: <span className="text-foreground">{evt.organizer}</span></span>
                      </p>

                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.prize && (
                        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center gap-3">
                          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
                            <Trophy className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">Winner Reward & Perk</p>
                            <p className="text-xs font-black text-foreground">{evt.prize}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-teal-500" /> {evt.location}
                      </span>

                      {evt.registrationUrl ? (
                        <a
                          href={evt.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all"
                        >
                          <span>Register Team</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground font-extrabold text-xs">
                          {evt.type === "news" ? "Daily Trend Insight" : "Free Attendance"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h4 className="font-extrabold text-base text-foreground">No events found</h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Try refining your filter selection above.</p>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM CAREER ACCELERATION TIP */}
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-teal-500/10 via-slate-100 dark:via-slate-800 to-indigo-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-foreground">
                Pro Tip: Combine Your Roadmap Progress with Hackathon Projects
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                Recruiters on MyJobMag & BrighterMonday look for verified GitHub builds. Take an AI assessment on your roadmaps, export your PDF portfolio report, and attach it to your internship applications!
              </p>
            </div>
          </div>
          
          <a
            href="/dashboard/reports"
            className="shrink-0 px-5 py-3 rounded-2xl bg-foreground text-background font-black text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            Export Portfolio PDF ↗
          </a>
        </div>
      </div>
    </div>
  );
}
