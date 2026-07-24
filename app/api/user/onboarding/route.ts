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
        ...(onboardingIntent !== undefined && { onboardingIntent }),
        ...(onboardingCompleted !== undefined && { onboardingCompleted }),
        ...(interests !== undefined && { interests }),
        ...(skills !== undefined && { skills }),
        ...(targetRole !== undefined && { targetRole }),
      },
      create: {
        userId,
        interests: interests || [],
        skills: skills || [],
        educationLevel: educationLevel || "other",
        onboardingIntent: onboardingIntent || "discover_new",
        onboardingCompleted: onboardingCompleted ?? false,
        targetRole: targetRole || null,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }
}
