import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-prisma"
import { ApiResponse, User } from "@/lib/types"

interface ProfileRequest {
  name?: string
  location?: string
  avatar?: string
  interests?: string[]
  skills?: string[]
  experienceLevel?: "beginner" | "intermediate" | "advanced"
  targetRole?: string
  careerGoal?: string
}

interface ProfileResponse {
  name: string
  email: string
  location: string
  avatar: string
  interests: string[]
  skills: string[]
  experienceLevel: "beginner" | "intermediate" | "advanced"
  targetRole: string
  careerGoal: string
}

// GET /api/user/profile - Fetch user profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<null>,
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const userId = verifyToken(token)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" } as ApiResponse<null>,
        { status: 401 }
      )
    }

    // Fetch user and profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    const profileData: ProfileResponse = {
      name: user.name,
      email: user.email,
      location: user.location || "",
      avatar: user.avatar || "",
      interests: userProfile?.interests || [],
      skills: userProfile?.skills || [],
      experienceLevel: (userProfile?.experienceLevel || "beginner") as "beginner" | "intermediate" | "advanced",
      targetRole: userProfile?.targetRole || "",
      careerGoal: userProfile?.careerGoal || "",
    }

    return NextResponse.json(
      {
        success: true,
        data: profileData,
      } as ApiResponse<ProfileResponse>,
      { status: 200 }
    )
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<null>,
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const userId = verifyToken(token)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" } as ApiResponse<null>,
        { status: 401 }
      )
    }

    const body: ProfileRequest = await request.json()

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.avatar !== undefined && { avatar: body.avatar || null }),
      },
    })

    // Update or create user profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        interests: body.interests || [],
        skills: body.skills || [],
        experienceLevel: body.experienceLevel || "beginner",
        targetRole: body.targetRole || "",
        careerGoal: body.careerGoal || "",
      },
      update: {
        ...(body.interests && { interests: body.interests }),
        ...(body.skills && { skills: body.skills }),
        ...(body.experienceLevel && { experienceLevel: body.experienceLevel }),
        ...(body.targetRole !== undefined && { targetRole: body.targetRole }),
        ...(body.careerGoal !== undefined && { careerGoal: body.careerGoal }),
      },
    })

    const profileData: ProfileResponse = {
      name: updatedUser.name,
      email: updatedUser.email,
      location: updatedUser.location || "",
      avatar: updatedUser.avatar || "",
      interests: updatedProfile.interests,
      skills: updatedProfile.skills,
      experienceLevel: updatedProfile.experienceLevel as "beginner" | "intermediate" | "advanced",
      targetRole: updatedProfile.targetRole || "",
      careerGoal: updatedProfile.careerGoal || "",
    }

    return NextResponse.json(
      {
        success: true,
        data: profileData,
      } as ApiResponse<ProfileResponse>,
      { status: 200 }
    )
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
