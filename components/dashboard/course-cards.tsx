"use client";

import React from "react";
import { Course } from "@/lib/types";
import { Heart, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recommended for you
        </h2>
        <button className="text-sm text-teal-600 hover:text-teal-700">
          See all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={`text-xs font-medium rounded-full px-2 py-1 ${getLevelColor(course.level)}`}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              <button
                onClick={() => onFavorite?.(course.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mb-2 font-medium text-gray-900 line-clamp-2">
              {course.title}
            </h3>

            <p className="mb-3 text-xs text-gray-600 line-clamp-2">
              {course.description}
            </p>

            <div className="mb-4 space-y-2">
              {course.matchScore && (
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-700">
                    {course.matchScore}% match
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-700">
                  {course.duration}h course
                </span>
              </div>
            </div>

            {course.provider && (
              <p className="mb-3 text-xs font-medium text-teal-600">
                {course.provider}
              </p>
            )}

            {course.skills && course.skills.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {course.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700"
                  >
                    {skill}
                  </span>
                ))}
                {course.skills.length > 2 && (
                  <span className="text-xs text-gray-600">
                    +{course.skills.length - 2} more
                  </span>
                )}
              </div>
            )}

            <Button
              className="mt-auto w-full bg-teal-600 hover:bg-teal-700 text-white"
              size="sm"
            >
              View Course
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
