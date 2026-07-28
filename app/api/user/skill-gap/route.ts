import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-prisma";
import { analyzeSkillGap } from "@/lib/skill-gap";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const analysis = await analyzeSkillGap(userId);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze skill gap",
      },
      { status: 500 }
    );
  }
}
