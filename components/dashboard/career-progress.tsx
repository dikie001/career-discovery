"use client";

import React from "react";
import { CareerProgress, ProgressStage } from "@/lib/types";
import { Check, Circle } from "lucide-react";

interface CareerProgressProps {
  progress: CareerProgress;
}

export function CareerProgressComponent({ progress }: CareerProgressProps) {
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Career Progress
      </h2>

      <div className="mb-4 flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="6"
              strokeDasharray={`${(progress.overallProgress / 100) * 282.6} 282.6`}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-teal-600">
              {progress.overallProgress}%
            </span>
            <span className="text-xs text-gray-600">Progress</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
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
        return "bg-teal-100";
      case "in_progress":
        return "bg-yellow-100";
      case "pending":
        return "bg-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-teal-700";
      case "in_progress":
        return "text-yellow-700";
      case "pending":
        return "text-gray-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${stage.status === "completed"
              ? "bg-teal-600"
              : stage.status === "in_progress"
                ? "bg-yellow-500"
                : "bg-gray-300"
            }`}
        >
          {stage.status === "completed" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {index < 3 && <div className="h-6 w-0.5 bg-gray-300" />}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 text-xs">{stage.title}</h3>
          <span
            className={`text-xs font-medium ${getStatusTextColor(stage.status)} ${getStatusColor(stage.status)} rounded-full px-1.5 py-0.5`}
          >
            {stage.status === "in_progress"
              ? "In Progress"
              : stage.status === "completed"
                ? "Done"
                : "Pending"}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{stage.description}</p>
      </div>
    </div>
  );
}
