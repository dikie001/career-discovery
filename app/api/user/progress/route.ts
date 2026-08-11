import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-prisma"
import { ApiResponse, CareerProgress } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
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

    const url = new URL(request.url)
    const roadmapId = url.searchParams.get("roadmapId")

    if (roadmapId) {
      const userRoadmap = await prisma.userRoadmap.findUnique({
        where: { userId_roadmapId: { userId, roadmapId } },
        include: { progress: true }
      })
      
      const nodeProgress = userRoadmap?.progress || []
      
      return NextResponse.json(
        { success: true, data: nodeProgress },
        { status: 200 }
      ) as NextResponse;
    }

    const progress = await prisma.careerProgress.findUnique({
      where: { userId },
      include: { stages: { orderBy: { order: "asc" } } },
    })

    const userRoadmaps = await prisma.userRoadmap.findMany({
      where: { userId },
      include: {
        progress: {
          include: { node: true }
        },
        roadmap: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const completedNodes = userRoadmaps.flatMap(ur => 
      ur.progress
        .filter(p => p.status === "completed" || p.validated)
        .map(p => ({
          nodeId: p.nodeId,
          title: p.node.title,
          category: p.node.type || "Core Module",
          validated: p.validated,
          score: p.assessmentScore || null,
          roadmapTitle: ur.roadmap.title,
          completedAt: p.completedAt || new Date(),
        }))
    );

    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Progress not found" } as ApiResponse<null>,
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: { ...progress, activeRoadmapId: userRoadmaps[0]?.roadmapId, completedNodes } as any },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get progress error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get progress",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
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

    const body = await request.json()
    const { roadmapId, nodeId, status, validated, assessmentScore } = body
    
    if (!roadmapId) {
       return NextResponse.json(
        { success: false, error: "roadmapId required" } as ApiResponse<null>,
        { status: 400 }
      )
    }

    if (nodeId && status) {
      // 1. Ensure UserRoadmap exists
      let userRoadmap = await prisma.userRoadmap.findUnique({
        where: { userId_roadmapId: { userId, roadmapId } }
      })

      if (!userRoadmap) {
        userRoadmap = await prisma.userRoadmap.create({
          data: { userId, roadmapId, status: "in_progress" }
        })
      }

      // 2. Upsert UserRoadmapNode
      await prisma.userRoadmapNode.upsert({
        where: { userRoadmapId_nodeId: { userRoadmapId: userRoadmap.id, nodeId } },
        update: { 
          status, 
          completedAt: status === "completed" ? new Date() : null,
          ...(validated !== undefined && { validated }),
          ...(assessmentScore !== undefined && { assessmentScore })
        },
        create: { 
          userRoadmapId: userRoadmap.id, 
          nodeId, 
          status, 
          completedAt: status === "completed" ? new Date() : null,
          ...(validated !== undefined && { validated }),
          ...(assessmentScore !== undefined && { assessmentScore })
        }
      })
      
      // 3. Recalculate progress for this roadmap
      const totalNodes = await prisma.roadmapNode.count({ where: { roadmapId } });
      const completedNodes = await prisma.userRoadmapNode.count({
        where: { userRoadmapId: userRoadmap.id, status: "completed" }
      });
      
      const percentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
      
      // Update UserRoadmap status if 100%
      if (percentage === 100) {
        await prisma.userRoadmap.update({
          where: { id: userRoadmap.id },
          data: { status: "completed" }
        });
      }
      
      // 4. Update overall CareerProgress if this roadmap's progress is higher
      const careerProgress = await prisma.careerProgress.findUnique({ where: { userId } });
      if (careerProgress) {
         // Also mark "Career Roadmap" stage as in progress or completed
         const roadmapStage = await prisma.progressStage.findFirst({
           where: { progressId: careerProgress.id, title: "Career Roadmap" }
         });
         
         if (roadmapStage && roadmapStage.status !== "completed") {
           await prisma.progressStage.update({
             where: { id: roadmapStage.id },
             data: { status: percentage === 100 ? "completed" : "in_progress" }
           });
         }
         
         // Update overall progress (for simplicity we just use the roadmap percentage, but in a real app this might be a weighted average)
         await prisma.careerProgress.update({
           where: { id: careerProgress.id },
           data: { overallProgress: Math.max(careerProgress.overallProgress, percentage) }
         });
      }
    }

    return NextResponse.json(
      { success: true, data: { updated: true } },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update progress error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update progress",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
