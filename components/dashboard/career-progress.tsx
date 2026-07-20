"use client";

import React from "react";
import { CareerProgress, ProgressStage } from "@/lib/types";
import { Check, Circle } from "lucide-react";

interface CareerProgressProps {
  progress: CareerProgress;
}

export function CareerProgressComponent({ progress }: CareerProgressProps) {
  return (
    <div className="rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm p-6 shadow-lg shadow-black/5 dark:shadow-black/20">
      <h2 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">
        Career Progress
      </h2>

      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(30, 41, 59)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(20, 184, 166)"
              strokeWidth="6"
              strokeDasharray={`${(progress.overallProgress / 100) * 282.6} 282.6`}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-teal-400">
              {progress.overallProgress}%
            </span>
            <span className="text-xs text-muted-foreground font-medium">Progress</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {progress.stages.map((stage, index) => (
          <ProgressStageItem key={stage.id} stage={stage} index={index} />
        ))}
      </div>
    </div>
  );
}

function ProgressStageItem({
  stage,
  index,
}: {
  stage: ProgressStage;
  index: number;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-teal-500/20 border-teal-500/40";
      case "in_progress":
        return "bg-amber-500/20 border-amber-500/40";
      case "pending":
        return "bg-slate-800/20 border-slate-700/40";
      default:
        return "bg-slate-800/20 border-slate-700/40";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-teal-400";
      case "in_progress":
        return "text-amber-400";
      case "pending":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getCircleStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-teal-500";
      case "in_progress":
        return "bg-amber-500 ring-2 ring-amber-500/50";
      case "pending":
        return "bg-accent";
      default:
        return "bg-accent";
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg border border-slate-800/30 bg-slate-800/20 hover:bg-muted/30 transition-all">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-bold shadow-lg ${getCircleStyle(stage.status)}`}
        >
          {stage.status === "completed" ? (
            <Check className="h-5 w-5" />
          ) : (
            <span className="text-xs">{index + 1}</span>
          )}
        </div>
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">{stage.title}</h3>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(stage.status)} ${getStatusTextColor(stage.status)} uppercase tracking-wider`}
          >
            {stage.status === "in_progress"
              ? "In Progress"
              : stage.status === "completed"
                ? "Done"
                : "Pending"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{stage.description}</p>
      </div>
    </div>
  );
}
