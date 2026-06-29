"use client";

import React from "react";
import { CareerProgress, ProgressStage } from "@/lib/types";
import { Check, Circle } from "lucide-react";

interface CareerProgressProps {
  progress: CareerProgress;
}

export function CareerProgressComponent({ progress }: CareerProgressProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Your Career Progress
      </h2>

      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="8"
              strokeDasharray={`${(progress.overallProgress / 100) * 282.6} 282.6`}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-teal-600">
              {progress.overallProgress}%
            </span>
            <span className="text-xs text-gray-600">Overall Progress</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
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
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            stage.status === "completed"
              ? "bg-teal-600"
              : stage.status === "in_progress"
                ? "bg-yellow-500"
                : "bg-gray-300"
          }`}
        >
          {stage.status === "completed" ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Circle className="h-5 w-5 text-white" />
          )}
        </div>
        {index < 3 && <div className="h-8 w-0.5 bg-gray-300" />}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{stage.title}</h3>
          <span
            className={`text-xs font-medium ${getStatusTextColor(stage.status)} ${getStatusColor(stage.status)} rounded-full px-2 py-1`}
          >
            {stage.status === "in_progress"
              ? "In Progress"
              : stage.status === "completed"
                ? "Completed"
                : "Pending"}
          </span>
        </div>
        <p className="text-xs text-gray-600">{stage.description}</p>
      </div>
    </div>
  );
}
