import { prisma } from "./prisma"
import { User, AuthResponse, LoginRequest, SignupRequest } from "./types"

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function generateToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64")
}

export async function signupPrisma(request: SignupRequest): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: request.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      }
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: request.email,
        password: hashPassword(request.password),
        name: request.name,
      },
    })

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        interests: [],
        skills: [],
        experienceLevel: "beginner",
      },
    })

    // Create career progress
    await prisma.careerProgress.create({
      data: {
        userId: user.id,
        overallProgress: 0,
        stages: {
          create: [
            { title: "Self Discovery", description: "Explore yourself", status: "completed", order: 1 },
            { title: "Interests & Strengths", description: "Discover strengths", status: "completed", order: 2 },
            { title: "Skill Gap Analysis", description: "In Progress", status: "in_progress", order: 3 },
            { title: "Career Roadmap", description: "Plan ahead", status: "pending", order: 4 },
          ],
        },
      },
    })

    const token = generateToken(user.id)

    return {
      success: true,
      user: {
        ...user,
        password: "",
      },
      token,
    }
  } catch (error) {
    console.error("Signup error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed",
    }
  }
}

export async function loginPrisma(request: LoginRequest): Promise<AuthResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: request.email },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    if (!verifyPassword(request.password, user.password)) {
      return {
        success: false,
        error: "Invalid password",
      }
    }

    const token = generateToken(user.id)

    return {
      success: true,
      user: {
        ...user,
        password: "",
      },
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    }
  }
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [userId] = decoded.split(":")
    return userId
  } catch {
    return null
  }
}
