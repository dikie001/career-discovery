import { groqService } from "@/lib/groq-service";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ApiResponse, ChatMessage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get user profile for context
    const user = await db.getUserById(userId);
    const profile = await db.getProfile(userId);

    if (!user || !profile) {
      return NextResponse.json(
        { success: false, error: "User not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get conversation history
    const history = await db.getMessages(userId);
    const conversationHistory = history
      .slice(-10) // Last 10 messages for context
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

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
    );

    // Save messages to database
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      userId,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    await db.addMessage(userMessage);
    await db.addMessage(assistantMessage);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: aiResponse,
          id: assistantMessage.id,
        },
      } as ApiResponse<{ message: string; id: string }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
