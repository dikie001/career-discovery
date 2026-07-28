import { NextRequest, NextResponse } from "next/server";
import { startUserRoadmap } from "@/lib/roadmap-engine";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Securely extract user from token, NOT the URL
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Fetch the user's personalized progress
    const userRoadmaps = await prisma.userRoadmap.findMany({
      where: { userId },
      include: {
        roadmap: true,
        progress: true,
      }
    });
    
    return NextResponse.json(userRoadmaps);
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Securely extract user from token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. We only need the roadmapId from the frontend now
    const { roadmapId } = await request.json();

    if (!roadmapId) {
      return NextResponse.json({ error: "Missing roadmapId" }, { status: 400 });
    }

    // 3. Start the roadmap for this specific user
    const userRoadmap = await startUserRoadmap(userId, roadmapId);
    return NextResponse.json(userRoadmap);
  } catch (error) {
    console.error("Error starting user roadmap:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}