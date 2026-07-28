import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

const entityModelMap: Record<string, string> = {
  users: "user",
  careers: "career",
  roadmaps: "roadmap",
  skills: "skill",
  resources: "learningResource",
  projects: "project",
  certifications: "certification",
  opportunities: "opportunity",
  settings: "systemSetting",
};

// Strongly type the Prisma methods we are going to use dynamically
type PrismaDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.substring(7);
  const userId = verifyToken(token);
  if (!userId) {
    return { error: "Invalid token", status: 401 };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { user };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const { entity, id } = resolvedParams;
  const modelName = entityModelMap[entity];

  if (!modelName) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  try {
    const db = prisma as unknown as Record<string, PrismaDelegate>;
    const data = await db[modelName].findUnique({
      where: { id },
    });

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Error fetching ${entity} by id:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const { entity, id } = resolvedParams;
  const modelName = entityModelMap[entity];

  if (!modelName) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const db = prisma as unknown as Record<string, PrismaDelegate>;

    const data = await db[modelName].update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Error updating ${entity}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const { entity, id } = resolvedParams;
  const modelName = entityModelMap[entity];

  if (!modelName) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  try {
    const db = prisma as unknown as Record<string, PrismaDelegate>;
    await db[modelName].delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${entity}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}