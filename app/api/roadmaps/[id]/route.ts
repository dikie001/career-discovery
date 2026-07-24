import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;
    const roadmapId = resolvedParams.id;

    // 1. Fetch the roadmap along with its nodes and edges
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        career: true,
        nodes: true,
        edges: true,
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // 2. Fetch user's completion progress for this roadmap
    const progress = await prisma.careerProgress.findMany({
      where: { userId },
    });

    return NextResponse.json({ roadmap, progress });
  } catch (error) {
    console.error("Error fetching individual roadmap:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}