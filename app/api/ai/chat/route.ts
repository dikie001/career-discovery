import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-prisma"
import { groqService } from "@/lib/groq-service"
import { ApiResponse } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

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
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" } as ApiResponse<null>,
        { status: 400 }
      )
    }

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" } as ApiResponse<null>,
        { status: 404 }
      )
    }

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    const conversationHistory = history
      .reverse()
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

    // Get AI response
    const aiResponse = await groqService.answerCareerQuestion(
      {
        interests: profile.interests,
        skills: profile.skills,
        experienceLevel: profile.experienceLevel,
        targetRole: profile.targetRole,
      },
      message,
      conversationHistory
    )

    // Save messages
    await prisma.chatMessage.create({
      data: {
        userId,
        role: "user",
        content: message,
      },
    })

    await prisma.chatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: aiResponse,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          message: aiResponse,
        },
      } as ApiResponse<{ message: string }>,
      { status: 200 }
    )
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
