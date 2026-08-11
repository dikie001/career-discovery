import React, { useState, useEffect } from "react";
// Fixed: Removed the unused AlertCircle import
import { X, CheckCircle2, Loader2, ArrowRight, PlayCircle, Clock, Sparkles, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface AssessmentModalProps {
  nodeId: string;
  nodeTitle: string;
  onClose: () => void;
  onSuccess: (nodeId: string, validated: boolean, score: number) => void;
}

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

interface Assessment {
  title: string;
  timeLimitMinutes: number;
  passMarkPercentage: number;
  questions: Question[];
}

export function AssessmentModal({ nodeId, nodeTitle, onClose, onSuccess }: AssessmentModalProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("pathfinder:token");
        const res = await apiFetch(`/api/roadmaps/nodes/${nodeId}/assessment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: nodeTitle })
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setAssessment(data.data);
          setTimeLeft(data.data.timeLimitMinutes * 60);
        } else {
          setError(data.error || "AI Free Tier Quota Reached: You have consumed your daily live AI generation limit for this session. Please try again later or upgrade to Pathfinder Pro!");
        }
      } catch (err) {
        console.error("Assessment error", err);
        setError("AI Free Tier Quota Reached: You have consumed your daily live AI generation limit for this session. Please try again later or upgrade to Pathfinder Pro!");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [nodeId, nodeTitle]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && !finished && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (started && !finished && timeLeft === 0) {
      // Fixed: Wrapped in a setTimeout to prevent synchronous cascading renders in the effect
      timer = setTimeout(() => setFinished(true), 0);
    }
    return () => clearTimeout(timer);
  }, [started, finished, timeLeft]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">Generating Assessment...</h3>
          <p className="text-sm text-slate-500 mt-2 text-center">Pathfinder AI is creating a Kenyan industry-standard exam for {nodeTitle}.</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    const isQuota = error?.toLowerCase().includes("quota") || error?.toLowerCase().includes("limit") || error?.toLowerCase().includes("free tier") || error?.toLowerCase().includes("rate");
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeInUp">
        <div className="bg-card dark:bg-slate-900 border border-border/60 rounded-3xl p-7 sm:p-8 max-w-md w-full shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center text-center pt-2">
            {isQuota ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20 mb-4 text-white">
                <Zap className="w-7 h-7" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20 mb-4 text-white">
                <Sparkles className="w-7 h-7" />
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              {isQuota ? "AI Free Tier Limit Reached" : "Assessment Notice"}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
              {error || "We couldn't load this real-time AI assessment right now. Please try again later!"}
            </p>
            {isQuota ? (
              <div className="mt-6 w-full space-y-2.5">
                <button
                  onClick={() => {
                    alert("Upgrade to Pathfinder Pro: Unlimited instant AI assessments, real-time career pivots, & personalized industry mentors coming out of beta soon!");
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4 fill-white" />
                  Upgrade to Pathfinder Pro
                </button>
                <button onClick={onClose} className="w-full py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/60 rounded-xl transition-all cursor-pointer">
                  Try again later when daily quota resets
                </button>
              </div>
            ) : (
              <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-sm cursor-pointer">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
              Skill Assessment
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {assessment.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm leading-relaxed">
              To mark this node as completed, you must pass this assessment to prove your knowledge against Kenyan industry expectations.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Limit</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{assessment.timeLimitMinutes} mins</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Questions</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{assessment.questions.length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pass Mark</p>
                <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">{assessment.passMarkPercentage}%</p>
              </div>
            </div>

            <button 
              onClick={() => setStarted(true)}
              className="mt-8 w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-6 h-6" />
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (finished) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  // Results calculation
  const score = assessment.questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctOptionId ? 1 : 0);
  }, 0);
  const percentage = Math.round((score / assessment.questions.length) * 100);
  const passed = percentage >= assessment.passMarkPercentage;

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl relative my-8 flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-3xl flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Results: {assessment.title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className={cn(
              "p-6 rounded-2xl border-2 text-center mb-8",
              passed ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50" : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
            )}>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Your Score</p>
              <h1 className={cn("text-5xl font-black mb-2", passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                {percentage}%
              </h1>
              <p className={cn("text-lg font-semibold", passed ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500")}>
                {passed ? "Congratulations! You passed." : "You did not pass. Keep learning and try again."}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800">Review Answers</h3>
              {assessment.questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOptionId;
                const isUnanswered = !userAnswer;

                return (
                  <div key={q.id} className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white mb-4">
                      {idx + 1}. {q.text}
                    </p>
                    <div className="space-y-2">
                      {q.options.map(opt => {
                        const isSelected = userAnswer === opt.id;
                        const isActualCorrect = q.correctOptionId === opt.id;
                        
                        let optStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700";
                        if (isActualCorrect) optStyle = "bg-emerald-100 border-emerald-400 dark:bg-emerald-900/40 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-100";
                        else if (isSelected && !isCorrect) optStyle = "bg-red-100 border-red-400 dark:bg-red-900/40 dark:border-red-500/50 text-red-900 dark:text-red-100";

                        return (
                          <div key={opt.id} className={cn("p-3 rounded-xl border flex items-center gap-3", optStyle)}>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                              isActualCorrect ? "border-emerald-500" : (isSelected && !isCorrect ? "border-red-500" : "border-slate-300 dark:border-slate-600")
                            )}>
                              {isActualCorrect && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                              {(isSelected && !isCorrect) && <X className="w-3.5 h-3.5 text-red-500" />}
                            </div>
                            <span className="text-sm font-medium">{opt.text}</span>
                            {isSelected && <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-70">Your Answer</span>}
                            {isActualCorrect && !isSelected && <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-70">Correct Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                    {(!isCorrect || isUnanswered) && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">Explanation</p>
                        <p className="text-sm text-blue-900 dark:text-blue-200">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 rounded-b-3xl">
            {passed ? (
              <button 
                onClick={() => onSuccess(nodeId, true, percentage)}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Complete Node & Continue
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-lg rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Close & Review Material
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col h-[80vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
            <h3 className="font-bold text-slate-900 dark:text-white">{assessment.title}</h3>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2",
            timeLeft < 300 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                    isSelected 
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100" 
                      : "border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "border-teal-500" : "border-slate-300 dark:border-slate-600 group-hover:border-teal-300"
                  )}>
                    {isSelected && <div className="w-3 h-3 bg-teal-500 rounded-full" />}
                  </div>
                  <span className="font-medium text-[15px]">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:hover:text-slate-500"
          >
            Previous
          </button>
          
          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <button
              onClick={() => setFinished(true)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(assessment.questions.length - 1, currentQuestionIndex + 1))}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}