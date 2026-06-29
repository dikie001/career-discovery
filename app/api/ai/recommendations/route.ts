import { groqService } from "@/lib/groq-service";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const user = await db.getUserById(userId);
    const profile = await db.getProfile(userId);

    if (!user || !profile) {
      return NextResponse.json(
        { success: false, error: "User not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get all careers and courses
    const careers = await db.getCareers();
    const courses = await db.getCourses();

    // Generate recommendations using Groq
    const careerRecommendations = await groqService.generateCareerRecommendations(
      {
        interests: profile.interests,
        skills: profile.skills,
        experienceLevel: profile.experienceLevel,
        targetRole: profile.targetRole,
      },
      careers
    );

    const courseRecommendations = await groqService.generateCourseRecommendations(
      {
        interests: profile.interests,
        skills: profile.skills,
        experienceLevel: profile.experienceLevel,
        targetRole: profile.targetRole,
      },
      courses
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          careerRecommendations,
          courseRecommendations,
          careers: careers.slice(0, 3), // Top 3 careers
          courses: courses.slice(0, 4), // Top 4 courses
        },
      } as ApiResponse<{
        careerRecommendations: string;
        courseRecommendations: string;
        careers: typeof careers;
        courses: typeof courses;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Recommendations failed",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
