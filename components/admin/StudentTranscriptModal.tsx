"use client";

import React, { useRef, useState } from "react";
import { X, Download, Award, CheckCircle2, ShieldCheck, FileText, Loader2, Calendar, User, BookOpen, GraduationCap } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export interface StudentTranscriptNode {
  id: string;
  title: string;
  category: string;
  score: number;
  completedAt: string;
  status: string;
}

export interface StudentTranscript {
  id: string;
  name: string;
  email: string;
  level: string;
  careerTrack: string;
  enrollmentDate: string;
  completionStatus: string;
  overallScore: number;
  gradeLabel: string;
  nodes: StudentTranscriptNode[];
}

interface StudentTranscriptModalProps {
  student: StudentTranscript | null;
  onClose: () => void;
}

export function StudentTranscriptModal({ student, onClose }: StudentTranscriptModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      // Force high pixel ratio and crisp white background for institutional document quality
      const imgData = await toPng(printRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          transform: "scale(1)",
        }
      });

      const tempPdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = tempPdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const dynamicPageHeight = Math.max(297, pdfHeight + 10);
      const outputPdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, dynamicPageHeight]
      });

      outputPdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const safeName = student.name.replace(/[^a-zA-Z0-9]/g, "_");
      outputPdf.save(`${safeName}_Academic_Transcript_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Failed to generate transcript PDF:", error);
      alert("An error occurred while exporting the transcript to PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Modal Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Academic & Competency Transcript
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Student Assessment Report • {student.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all focus:outline-hidden"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              title="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Transcript Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/50">
          {/* Institutional Document Container (Used for exact PDF capture) */}
          <div 
            ref={printRef}
            className="mx-auto w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 font-sans relative overflow-hidden"
          >
            {/* Subtle Watermark Decoration */}
            <div className="pointer-events-none absolute -right-20 -bottom-20 opacity-[0.03] select-none">
              <Award className="w-[500px] h-[500px] text-slate-900" />
            </div>

            {/* Institution Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl border-2 border-slate-900 p-2 flex items-center justify-center shrink-0 shadow-xs bg-white">
                  <img src="/logo.png" alt="Pathfinder Seal" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                    Pathfinder Institute
                  </h1>
                  <p className="text-xs font-bold tracking-widest text-indigo-700 uppercase mt-0.5">
                    Of Technology & Career Acceleration
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Nairobi Innovation Hub • Official Transcript Registry
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 border border-slate-200 rounded-lg p-3 shrink-0">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Document Code</div>
                <div className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                  TRN-{student.id.slice(-6).toUpperCase()}-{new Date().getFullYear()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Issued: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Transcript Title */}
            <div className="text-center mb-8">
              <h2 className="text-lg font-black tracking-wider text-slate-900 uppercase underline underline-offset-4 decoration-2 decoration-indigo-600">
                Official Academic & Competency Transcript
              </h2>
              <p className="text-xs text-slate-500 mt-1 italic">
                Issued under the authority of the Pathfinder Academic Review Board
              </p>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-300 rounded-xl p-6 mb-8">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Student Full Name</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">{student.name}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Student Email Account</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{student.email}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Career Specialization Track</span>
                <span className="text-sm font-bold text-indigo-900 block mt-0.5">{student.careerTrack}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Academic Level & Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-slate-900">{student.level}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                    {student.completionStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Performance Summary Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-950">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300 shrink-0">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase block">
                    Cumulative Assessment Rating
                  </span>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                    {student.overallScore}%
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Classification Grade</span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-400 uppercase tracking-wide mt-0.5">
                  {student.gradeLabel}
                </span>
                <span className="text-xs text-slate-300 mt-1">
                  {student.nodes.length} Specialized Learning Nodes Completed & Verified
                </span>
              </div>
            </div>

            {/* Curriculum Milestones Table */}
            <div className="mb-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-700" />
                <span>Completed Learning Nodes & Assessment Scores</span>
              </h3>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      <th className="py-3 px-4 w-5/12">Module / Learning Node</th>
                      <th className="py-3 px-4 w-2/12">Category</th>
                      <th className="py-3 px-4 w-2/12 text-center">Date Validated</th>
                      <th className="py-3 px-4 w-1/12 text-center">Score</th>
                      <th className="py-3 px-4 w-2/12 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-medium">
                    {student.nodes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-normal italic">
                          No assessment records available for this student yet.
                        </td>
                      </tr>
                    ) : (
                      student.nodes.map((node, i) => (
                        <tr key={node.id || i} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {node.title}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                            <span className="bg-slate-200/80 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                              {node.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-xs">
                            {node.completedAt || "Recent"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-sm">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-black ${
                              node.score >= 90
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : node.score >= 80
                                ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                                : "bg-slate-100 text-slate-900 border border-slate-300"
                            }`}>
                              {node.score}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Verified</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* Table Footer with Average */}
                  {student.nodes.length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 uppercase tracking-wider text-right">
                          Weighted Curriculum Competency Average:
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-black text-indigo-900">
                          {student.overallScore}%
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700">
                          PASSED & VALIDATED
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Official Signature Block & Verification Notice */}
            <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 mt-12">
              <div className="space-y-4 max-w-sm">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <ShieldCheck className="h-5 w-5 text-indigo-700 shrink-0" />
                  <span>Verified Electronic Academic Document</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This transcript has been securely generated via the Pathfinder Admin Assessment Engine. Any alteration or forgery of this document invalidates its certification credentials.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 shrink-0 w-full sm:w-auto">
                <div className="border-b border-slate-400 pb-2 text-center w-36">
                  <div className="font-serif italic text-base font-bold text-slate-800 pb-1">
                    J. K. Njoroge
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mt-1 border-t border-slate-300 pt-1">
                    Academic Registrar
                  </div>
                </div>

                <div className="border-b border-slate-400 pb-2 text-center w-36">
                  <div className="font-serif italic text-base font-bold text-slate-800 pb-1">
                    Dr. S. O. Achieng
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mt-1 border-t border-slate-300 pt-1">
                    Director of AI Evaluation
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              • Pathfinder Tech & Career Acceleration Engine • Official Transcript Registry •
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Clicking <strong className="text-slate-700 dark:text-slate-300">Download PDF</strong> produces an exact A4 academic transcript file ready for official evaluation or placement records.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
