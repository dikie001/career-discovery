import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      educationLevel,
      experienceLevel,
      onboardingIntent,
      onboardingCompleted,
      interests,
      skills,
      targetRole,
    } = body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(educationLevel !== undefined && { educationLevel }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(onboardingIntent !== undefined && { onboardingIntent }),
        ...(onboardingCompleted !== undefined && { onboardingCompleted }),
        ...(interests !== undefined && { interests }),
        ...(skills !== undefined && { skills }),
        ...(targetRole !== undefined && { targetRole: targetRole || "" }),
      },
      create: {
        userId,
        interests: interests || [],
        skills: skills || [],
        educationLevel: educationLevel || "university",
        experienceLevel: experienceLevel || "beginner",
        onboardingIntent: onboardingIntent || "mentorship_requested",
        onboardingCompleted: onboardingCompleted ?? false,
        targetRole: targetRole || "",
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error updating onboarding profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile setup" },
      { status: 500 }
    );
  }
}
