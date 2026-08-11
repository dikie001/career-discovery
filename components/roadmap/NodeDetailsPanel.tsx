import React, { useState } from 'react';
import { X, CheckCircle2, PlayCircle, Lock, ExternalLink, BookOpen, Clock, Target, PlaySquare, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoadmapNodeData } from './RoadmapSidebar';
import { apiFetch } from '@/lib/api-client';
import { AssessmentModal } from './AssessmentModal';

// 1. Strictly type the extra properties your API generates
interface ExtendedNodeData extends RoadmapNodeData {
  content?: string;
  resources?: Array<{
    resource: {
      id: string;
      url: string;
      type: string;
      title: string;
    };
  }>;
  projects?: Array<{
    project: {
      id: string;
      title: string;
      description: string;
    };
  }>;
}

interface NodeDetailsPanelProps {
  node: ExtendedNodeData | null;
  status: string;
  isValidated?: boolean;
  onClose: () => void;
  onComplete: (nodeId: string, validated?: boolean, score?: number) => void;
}

export function NodeDetailsPanel({ node, status, isValidated, onClose, onComplete }: NodeDetailsPanelProps) {
  const [generating, setGenerating] = useState(false);
  
  // 2. Fix the ESLint Effect loop by deriving state safely
  const [generatedData, setGeneratedData] = useState<ExtendedNodeData | null>(null);
  const [prevNodeId, setPrevNodeId] = useState<string | undefined>(node?.id);
  const [showAssessment, setShowAssessment] = useState(false);

  if (node?.id !== prevNodeId) {
    setPrevNodeId(node?.id);
    setGeneratedData(null); // Reset API generated data when clicking a new node
  }

  const dynamicNode = generatedData || node;

  if (!dynamicNode) return null;

  const isCompleted = status === 'completed';
  const isAvailable = !isCompleted;
  const isLocked = false; // Nodes are no longer locked

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("pathfinder:token");
      const res = await apiFetch(`/api/roadmaps/nodes/${dynamicNode.id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Safely parse dynamic content for the estimated time
  let estimatedTime = "2 weeks (approx. 20 hours)";
  if (dynamicNode.content) {
    try {
      const parsed = JSON.parse(dynamicNode.content);
      if (parsed.estimatedTime) estimatedTime = parsed.estimatedTime;
    } catch (e) {
      // Keep default if parsing fails
    }
  }

  // Fallback smart URLs if AI resources aren't generated yet
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(dynamicNode.title + ' crash course tutorial')}`;
  const docsSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(dynamicNode.title + ' official documentation')}`;

  return (
    <div className="absolute inset-x-2 top-2 bottom-2 md:inset-auto md:top-4 md:right-4 md:bottom-4 md:w-96 max-w-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden animate-in slide-in-from-right-8 duration-300">
      
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {isCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          {isAvailable && <PlayCircle className="w-6 h-6 text-blue-500" />}
          {isLocked && <Lock className="w-6 h-6 text-slate-400" />}
          {/* Fixed the null error on node.type */}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            {dynamicNode.type?.replace('_', ' ') || 'LEARNING NODE'}
            {isValidated && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">VALIDATED</span>}
          </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {dynamicNode.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')}
          </h2>
          {isLocked && (
            <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md inline-block">
              Complete previous prerequisites to unlock.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <BookOpen className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">What is it?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {dynamicNode.description?.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') || `Learn the fundamental concepts of ${dynamicNode.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')}.`}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Target className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Why you need it</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Essential for advancing to higher-level frameworks and passing technical interviews.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Estimated time</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {estimatedTime}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <PlaySquare className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="w-full">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Free learning resources</h4>
              
              {dynamicNode.resources && dynamicNode.resources.length > 0 ? (
                <ul className="mt-2 space-y-2 w-full">
                  {dynamicNode.resources.map((nr) => (
                    <li key={nr.resource.id} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                      <a href={nr.resource.url} target="_blank" rel="noreferrer" className="flex-1 flex items-center gap-2 group">
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {nr.resource.title}
                        </span> 
                      </a>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-slate-500">
                  <ul className="space-y-2 w-full">
                    <li>
                      <a href={youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">Video Crash Course</span> <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </a>
                    </li>
                    <li>
                      <a href={docsSearchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">Official Documentation</span> <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </a>
                    </li>
                  </ul>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    {generating ? 'Generating specific resources...' : 'Ask AI for specific resources'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Code2 className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="w-full">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Practice project</h4>
              {dynamicNode.projects && dynamicNode.projects.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {dynamicNode.projects.map((np) => (
                    <div key={np.project.id} className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{np.project.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{np.project.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Build a prototype related to {dynamicNode.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Apply your new skills by building a responsive project from scratch.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
        {!isCompleted && (
          <button
            onClick={() => onComplete(dynamicNode.id, false)}
            className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white shadow-sm active:scale-95 cursor-pointer"
          >
            Mark as Complete
          </button>
        )}
        
        <button
          onClick={() => setShowAssessment(true)}
          disabled={isValidated}
          className={cn(
            "w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
            isValidated 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
          )}
        >
          {isValidated ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Validated by Assessment
            </>
          ) : (
            "Take Assessment to Validate"
          )}
        </button>
      </div>

      {showAssessment && dynamicNode && (
        <AssessmentModal
          nodeId={dynamicNode.id}
          nodeTitle={dynamicNode.title}
          onClose={() => setShowAssessment(false)}
          onSuccess={(nodeId, validated, score) => {
            setShowAssessment(false);
            onComplete(nodeId, validated, score);
          }}
        />
      )}
    </div>
  );
}