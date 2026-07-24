import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce Authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Fetch the Roadmaps
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        career: true,
      },
    });
    
    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}