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

    // 1. Fetch the roadmap and nodes
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        career: true,
        nodes: true,
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // 2. Safely fetch edges using the exact Node IDs to satisfy strict TypeScript
    const nodeIds = roadmap.nodes.map(node => node.id);
    const edges = await prisma.roadmapEdge.findMany({
      where: {
        sourceId: { in: nodeIds }
      }
    });

    // 3. Fetch user progress
    const progress = await prisma.careerProgress.findMany({
      where: { userId },
    });

    // 4. Combine
    const roadmapWithEdges = {
      ...roadmap,
      edges: edges
    };

    return NextResponse.json({ roadmap: roadmapWithEdges, progress });
    
  } catch (error) {
    console.error("Error fetching individual roadmap:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}