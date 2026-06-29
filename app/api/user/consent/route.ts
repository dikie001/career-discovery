import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface ConsentRequestBody {
  useProfileDataForAI: boolean;
}

interface ConsentData {
  id: string;
  userId: string;
  useProfileDataForAI: boolean;
  consentedAt: string | null;
  updatedAt: string;
}

// GET user consent status
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

    let consent = await prisma.userConsent.findUnique({
      where: { userId },
    });

    // If consent record doesn't exist, create one with default values
    if (!consent) {
      consent = await prisma.userConsent.create({
        data: {
          userId,
          useProfileDataForAI: false,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: consent.id,
          userId: consent.userId,
          useProfileDataForAI: consent.useProfileDataForAI,
          consentedAt: consent.consentedAt?.toISOString() || null,
          updatedAt: consent.updatedAt.toISOString(),
        } as ConsentData,
      } as ApiResponse<ConsentData>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching consent:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch consent",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT/UPDATE user consent
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

    const body = await request.json() as ConsentRequestBody;

    if (typeof body.useProfileDataForAI !== "boolean") {
      return NextResponse.json(
        { success: false, error: "useProfileDataForAI must be a boolean" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Find or create consent record
    let consent = await prisma.userConsent.findUnique({
      where: { userId },
    });

    if (!consent) {
      consent = await prisma.userConsent.create({
        data: {
          userId,
          useProfileDataForAI: body.useProfileDataForAI,
          consentedAt: body.useProfileDataForAI ? new Date() : null,
        },
      });
    } else {
      consent = await prisma.userConsent.update({
        where: { userId },
        data: {
          useProfileDataForAI: body.useProfileDataForAI,
          consentedAt: body.useProfileDataForAI ? new Date() : null,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: consent.id,
          userId: consent.userId,
          useProfileDataForAI: consent.useProfileDataForAI,
          consentedAt: consent.consentedAt?.toISOString() || null,
          updatedAt: consent.updatedAt.toISOString(),
        } as ConsentData,
      } as ApiResponse<ConsentData>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating consent:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update consent",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
