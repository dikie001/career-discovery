import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ApiResponse, CareerProgress } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const progress = await db.getOrCreateProgress(userId);

    return NextResponse.json(
      { success: true, data: progress } as ApiResponse<CareerProgress>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get progress",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const progress = await db.updateProgress(userId, body);

    return NextResponse.json(
      { success: true, data: progress } as ApiResponse<CareerProgress>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
