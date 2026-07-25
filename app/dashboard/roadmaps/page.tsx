"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, BookOpen, Compass, Briefcase, Code, Palette, Calculator, Stethoscope } from "lucide-react";

// Educational Content based on the Career Wheel Pathways
const CAREER_PATHWAYS = [
  {
    category: "STEM: Technical & Engineering",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    careers: [
      {
        title: "Software Engineer",
        description: "Designs and builds complex software systems, web applications, and backend architectures.",
        requirements: ["Algorithms & Data Structures", "Full-stack web development (React, Node.js)", "System Design"],
      },
      {
        title: "Civil Engineer",
        description: "Plans, designs, and oversees construction and maintenance of building structures and infrastructure.",
        requirements: ["Mathematics & Physics", "AutoCAD / 3D Modeling", "Project Management"],
      },
      {
        title: "IT Technician",
        description: "Maintains computer systems, troubleshoots network issues, and ensures enterprise security.",
        requirements: ["Hardware diagnostics", "Network administration", "Cybersecurity basics"],
      }
    ]
  },
  {
    category: "Business Studies & Humanities",
    icon: <Calculator className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    careers: [
      {
        title: "Accountant & Auditor",
        description: "Prepares financial records, ensures tax compliance, and analyzes business financial health.",
        requirements: ["Financial Reporting", "Tax Law", "Analytical Mathematics"],
      },
      {
        title: "Entrepreneur",
        description: "Organizes and operates businesses, taking on greater than normal financial risks to build innovation.",
        requirements: ["Market Research", "Risk Management", "Leadership & Sales"],
      },
      {
        title: "Urban Planner",
        description: "Develops plans and programs for the use of land and physical facilities of towns and cities.",
        requirements: ["Geography & Sociology", "Public Policy", "Data Analysis"],
      }
    ]
  },
  {
    category: "Arts & Sports Science",
    icon: <Palette className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400",
    careers: [
      {
        title: "Graphic Designer",
        description: "Creates visual concepts by hand or using software to communicate ideas that inspire and inform.",
        requirements: ["Color Theory", "Typography", "Adobe Creative Suite"],
      },
      {
        title: "Animator / 3D Modeler",
        description: "Creates multiple images that give an illusion of movement for movies, games, and 3D environments.",
        requirements: ["Blender / Maya", "Anatomy & Physics", "Storyboarding"],
      },
      {
        title: "Sports Therapist",
        description: "Helps athletes prevent and recover from injuries, utilizing sports science to optimize performance.",
        requirements: ["Kinesiology", "First Aid & Rehabilitation", "Anatomy"],
      }
    ]
  },
  {
    category: "Applied & Pure Sciences",
    icon: <Stethoscope className="h-6 w-6 text-rose-500" />,
    color: "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400",
    careers: [
      {
        title: "Biomedical Scientist",
        description: "Carries out laboratory tests on human samples to help clinicians diagnose illnesses and evaluate treatments.",
        requirements: ["Microbiology", "Data Analysis", "Laboratory Procedures"],
      },
      {
        title: "Pharmacist",
        description: "Dispenses prescription medications and provides expertise in the safe use of prescriptions.",
        requirements: ["Chemistry", "Human Physiology", "Attention to Detail"],
      }
    ]
  }
];

export default function CareerExplorerPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);

  // Added category parameter
  const handleGenerateRoadmap = async (careerTitle: string, category: string) => {
    if (!token) return;
    setGeneratingTitle(careerTitle);
    
    try {
      const res = await fetch("/api/roadmaps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Sending category along with the title
        body: JSON.stringify({ careerTitle, category }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("API Success Response:", data); // Helpful for debugging
        
        // Safely capture ID
        const correctId = data.roadmapId || data.id;

        if (!correctId) {
          console.error("Critical Error: The API did not return an ID.", data);
          return;
        }

    

        // Route to the correct category folder and ID
        router.push(`/dashboard/roadmaps/${correctId}`);
      } else {
        console.error("Failed to generate roadmap via API. Status:", res.status);
      }
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setGeneratingTitle(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Header Section */}
     <div className="mb-10 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-teal-500/20 p-4 backdrop-blur-md">
            <Compass className="h-10 w-10 text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Career Knowledge Hub
            </h1>
            <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
              Explore different educational pathways. Understand the core requirements of various industries, discover what roles entail, and let AI generate a customized learning roadmap when you find your calling.
            </p>
          </div>
        </div>
      </div>

      {/* Pathways Grid */}
      <div className="space-y-12">
        {CAREER_PATHWAYS.map((pathway) => (
          <section key={pathway.category} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className={`p-2 rounded-xl border ${pathway.color}`}>
                {pathway.icon}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {pathway.category}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pathway.careers.map((career) => (
                <div 
                  key={career.title}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {career.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                      {career.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Key Requirements
                      </h4>
                      <ul className="space-y-1.5">
                        {career.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <BookOpen className="h-3.5 w-3.5 text-teal-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Generation Button */}
                  <button
                    // Updated to pass both title and category
                    onClick={() => handleGenerateRoadmap(career.title, pathway.category)}
                    disabled={generatingTitle === career.title}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500 flex items-center justify-center gap-2"
                  >
                    {generatingTitle === career.title ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Engineering Roadmap...
                      </>
                    ) : (
                      <>Generate AI Roadmap</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}