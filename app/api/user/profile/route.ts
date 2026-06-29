import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ApiResponse, UserProfile } from "@/lib/types";
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

    const profile = await db.getProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: profile } as ApiResponse<UserProfile>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get profile",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json();
    const {
      interests,
      skills,
      experienceLevel,
      targetRole,
    }: Partial<UserProfile> = body;

    const profile = await db.getProfile(userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const updatedProfile: UserProfile = {
      ...profile,
      interests: interests || profile.interests,
      skills: skills || profile.skills,
      experienceLevel: experienceLevel || profile.experienceLevel,
      targetRole: targetRole || profile.targetRole,
      updatedAt: new Date(),
    };

    const saved = await db.createOrUpdateProfile(updatedProfile);

    return NextResponse.json(
      { success: true, data: saved } as ApiResponse<UserProfile>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
