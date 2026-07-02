import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-prisma"
import { groqService } from "@/lib/groq-service"
import { ApiResponse } from "@/lib/types"
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

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(
      {
        success: true,
        data: messages,
      } as ApiResponse<typeof messages>,
      { status: 200 }
    )
  } catch (error) {
    console.error("Fetch chat history error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch chat history",
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
    const { message, personality } = body

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

    // Get conversation history (last 20 messages for context)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    const conversationHistory = history
      .reverse()
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

    // Get AI response with full conversation context and chosen personality
    const aiResponse = await groqService.answerCareerQuestion(
      {
        interests: profile.interests,
        skills: profile.skills,
        experienceLevel: profile.experienceLevel,
        targetRole: profile.targetRole || undefined,
      },
      message,
      conversationHistory,
      personality || "mentor"
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
