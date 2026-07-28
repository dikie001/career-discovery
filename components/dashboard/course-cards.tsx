"use client";

import React from "react";
import { Course } from "@/lib/types";
import { Heart, Star, Clock } from "lucide-react";

interface CourseCardsProps {
  courses: Course[];
  onFavorite?: (courseId: string) => void;
}

export function CourseCards({ courses, onFavorite }: CourseCardsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-blue-100 text-blue-700";
      case "advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="rounded-lg bg-white border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Recommended for you
        </h2>
        <button className="text-xs text-teal-600 hover:text-teal-700">
          See all
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-3 hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex items-start justify-between">
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${getLevelColor(course.level)}`}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              <button
                onClick={() => onFavorite?.(course.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className="h-3 w-3" />
              </button>
            </div>

            <h3 className="mb-1 font-medium text-gray-900 line-clamp-2 text-xs">
              {course.title}
            </h3>

            <p className="mb-2 text-xs text-gray-600 line-clamp-1">
              {course.description}
            </p>

            <div className="mb-2 flex gap-3 text-xs">
              {course.matchScore && (
                <div className="flex items-center gap-1 text-gray-700">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{course.matchScore}% match</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-700">
                <Clock className="h-3 w-3 text-gray-500" />
                <span>{course.duration}h</span>
              </div>
            </div>

            {course.provider && (
              <p className="mb-2 text-xs font-medium text-teal-600">
                {course.provider}
              </p>
            )}

            <button className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white py-1.5 text-xs font-medium">
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
