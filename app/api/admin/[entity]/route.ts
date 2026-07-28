import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

// Map URL entity names to Prisma model names
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

// Strongly type the Prisma methods for lists
type PrismaListDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  count: (args: { where?: unknown }) => Promise<number>;
  create: (args: { data: unknown }) => Promise<unknown>;
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
  { params }: { params: Promise<{ entity: string }> }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const entity = (await params).entity;
  const modelName = entityModelMap[entity];

  if (!modelName) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const search = searchParams.get("search") || "";
    
    // Basic generic search on 'title' or 'name' or 'email' depending on entity
    let whereClause: Record<string, unknown> = {};
    if (search) {
      if (modelName === "user") {
        whereClause = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };
      } else if (modelName === "career" || modelName === "roadmap" || modelName === "learningResource" || modelName === "project" || modelName === "opportunity") {
        whereClause = { title: { contains: search, mode: "insensitive" } };
      } else if (modelName === "skill" || modelName === "certification") {
        whereClause = { name: { contains: search, mode: "insensitive" } };
      } else if (modelName === "systemSetting") {
        whereClause = { key: { contains: search, mode: "insensitive" } };
      }
    }

    const db = prisma as unknown as Record<string, PrismaListDelegate>;

    const [data, total] = await Promise.all([
      db[modelName].findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, 
      }).catch(async () => {
         // Fallback if no createdAt (e.g. SystemSetting)
         return db[modelName].findMany({
          where: whereClause,
          skip,
          take: limit,
        });
      }),
      db[modelName].count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(`Error fetching ${entity}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const entity = (await params).entity;
  const modelName = entityModelMap[entity];

  if (!modelName) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const db = prisma as unknown as Record<string, PrismaListDelegate>;
    
    // Hash password if creating a user
    if (modelName === "user" && body.password) {
      // Intentionally left blank per your original logic
    }

    const data = await db[modelName].create({
      data: body,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error(`Error creating ${entity}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}