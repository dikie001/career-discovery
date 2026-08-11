import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-prisma"
import { NextRequest, NextResponse } from "next/server"

// GET — fetch latest 5 AI recommendations for this user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = verifyToken(authHeader.substring(7))
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const invalidPattern = /^(show|click|view|open|see|try|return|back|next|previous|select|choose)\b/i
    const optionPattern = /\b(option|options|button|buttons)\b/i

    const rawRecommendations = await prisma.aIRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const recommendations = rawRecommendations
      .filter((rec) => !invalidPattern.test(rec.title) && !optionPattern.test(rec.title))
      .slice(0, 5)

    // Clean up any invalid recommendations from database asynchronously
    const invalidIds = rawRecommendations
      .filter((rec) => invalidPattern.test(rec.title) || optionPattern.test(rec.title))
      .map((rec) => rec.id)

    if (invalidIds.length > 0) {
      prisma.aIRecommendation.deleteMany({
        where: { id: { in: invalidIds } },
      }).catch((err: unknown) => console.error("Failed to clean up invalid recommendations:", err))
    }

    return NextResponse.json({ success: true, data: recommendations }, { status: 200 })
  } catch (error) {
    console.error("Get recommendations error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}

// POST — save a new AI recommendation
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = verifyToken(authHeader.substring(7))
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, matchPercentage, salaryRange, reason } = body

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const invalidPattern = /^(show|click|view|open|see|try|return|back|next|previous|select|choose)\b/i
    const optionPattern = /\b(option|options|button|buttons)\b/i

    if (invalidPattern.test(title) || optionPattern.test(title)) {
      return NextResponse.json({ success: false, error: "Invalid career title" }, { status: 400 })
    }

    // Avoid duplicates — upsert based on userId + title within the last 24 hours
    const existing = await prisma.aIRecommendation.findFirst({
      where: {
        userId,
        title: { equals: title, mode: "insensitive" },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    if (existing) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 })
    }

    const recommendation = await prisma.aIRecommendation.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || "",
        category: category?.trim() || "General",
        matchPercentage: Math.min(100, Math.max(0, matchPercentage ?? 0)),
        salaryRange: salaryRange?.trim() || "",
        reason: reason?.trim() || "",
      },
    })

    return NextResponse.json({ success: true, data: recommendation }, { status: 201 })
  } catch (error) {
    console.error("Save recommendation error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save recommendation" },
      { status: 500 }
    )
  }
}

// DELETE — remove an AI recommendation by id
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = verifyToken(authHeader.substring(7))
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    // Ensure the recommendation belongs to this user before deleting
    const existing = await prisma.aIRecommendation.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: "Recommendation not found or unauthorized" }, { status: 404 })
    }

    await prisma.aIRecommendation.delete({ where: { id } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Delete recommendation error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete recommendation" },
      { status: 500 }
    )
  }
}
