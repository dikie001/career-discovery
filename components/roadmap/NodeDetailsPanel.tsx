import React from 'react';
import { X, CheckCircle2, PlayCircle, Lock, ExternalLink, BookOpen, Clock, Target, PlaySquare, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoadmapNodeData } from './RoadmapSidebar';

interface NodeDetailsPanelProps {
  node: RoadmapNodeData | null;
  status: string;
  onClose: () => void;
  onComplete: (nodeId: string) => void;
}

export function NodeDetailsPanel({ node, status, onClose, onComplete }: NodeDetailsPanelProps) {
  if (!node) return null;

  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked' || !status;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-100 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden animate-in slide-in-from-right-8 duration-300">
      
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {isCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          {isAvailable && <PlayCircle className="w-6 h-6 text-blue-500" />}
          {isLocked && <Lock className="w-6 h-6 text-slate-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {node.type?.replace('_', ' ') || 'LEARNING NODE'}
          </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {node.title}
          </h2>
          {isLocked && (
            <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md inline-block">
              🔒 Complete previous prerequisites to unlock.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <BookOpen className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">📖 What is it?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {node.description || `Learn the fundamental concepts of ${node.title}.`}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Target className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">🎯 Why you need it</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Essential for advancing to higher-level frameworks and passing technical interviews.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">⏱ Estimated time</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">2 weeks (approx. 20 hours)</p>
            </div>
          </div>

          <div className="flex gap-4">
            <PlaySquare className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="w-full">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">📚 Free learning resources</h4>
              <ul className="mt-2 space-y-2 w-full">
                <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                  <span>▶ Video Crash Course</span> <ExternalLink className="w-4 h-4 text-slate-400" />
                </li>
                <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                  <span>Official Documentation</span> <ExternalLink className="w-4 h-4 text-slate-400" />
                </li>
                <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                  <span>freeCodeCamp Module</span> <ExternalLink className="w-4 h-4 text-slate-400" />
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <Code2 className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="w-full">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">💻 Practice project</h4>
              <div className="mt-2 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Build a Personal Portfolio</p>
                <p className="text-xs text-slate-500 mt-1">Apply your new skills by building a responsive project from scratch.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={() => onComplete(node.id)}
          disabled={isLocked || isCompleted}
          className={cn(
            "w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
            isCompleted 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500 cursor-not-allowed"
              : isLocked 
                ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-95"
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Completed
            </>
          ) : (
            "✅ Mark as completed"
          )}
        </button>
      </div>
    </div>
  );
}