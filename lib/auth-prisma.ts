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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message

    // Handle database connection errors
    if (message.includes("Can't reach database server") ||
      message.includes("connect ECONNREFUSED") ||
      message.includes("ENOTFOUND") ||
      message.includes("timeout")) {
      return "Service temporarily unavailable. Please check your connection and try again."
    }

    // Handle Prisma-specific errors without exposing internal details
    if (message.includes("Prisma") || message.includes("prisma")) {
      return "A database error occurred. Please try again later."
    }

    // Return message for expected application errors
    if (message.includes("Email already registered") ||
      message.includes("User not found") ||
      message.includes("Invalid password")) {
      return message
    }

    // Generic fallback for unexpected errors
    return "An error occurred. Please try again."
  }

  return "An unexpected error occurred. Please try again."
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (error instanceof Error) {
        const message = error.message;
        // Automatically retry on connection timeouts or cold-start issues
        if (
          message.includes("Can't reach database server") ||
          message.includes("connect ECONNREFUSED") ||
          message.includes("ENOTFOUND") ||
          message.includes("timeout") ||
          message.includes("P1001") ||
          message.includes("P1008")
        ) {
          if (attempt < retries) {
            console.warn(`Database connection attempt ${attempt + 1} failed (cold start / timeout). Retrying in ${Math.round(delayMs)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            delayMs *= 1.5; // exponential backoff
            continue;
          }
        }
      }
      throw error;
    }
  }
  throw lastError;
}

export async function signupPrisma(request: SignupRequest): Promise<AuthResponse> {
  try {
    return await withRetry(async () => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: request.email },
        include: { profile: true },
      });

      if (existingUser) {
        // If an existing user has no profile, it is an orphaned record from a previously failed registration attempt.
        // Automatically clean it up so the signup can proceed cleanly.
        if (!existingUser.profile) {
          await prisma.user.delete({
            where: { id: existingUser.id },
          });
        } else {
          return {
            success: false,
            error: "Email already registered",
          };
        }
      }

      // Create new user, profile, and career progress atomically as a single database transaction
      const user = await prisma.user.create({
        data: {
          email: request.email,
          password: hashPassword(request.password),
          name: request.name,
          profile: {
            create: {
              interests: [],
              skills: [],
              certificates: [],
              projects: [],
              achievements: [],
              experienceLevel: "beginner",
            },
          },
          progress: {
            create: {
              overallProgress: 15,
              stages: {
                create: [
                  { title: "Self Discovery", description: "Completed profile setup", status: "completed", order: 1 },
                  { title: "Interests & Strengths", description: "Discover & select your career", status: "in_progress", order: 2 },
                  { title: "Skill Gap Analysis", description: "Analyze your skills", status: "pending", order: 3 },
                  { title: "Career Roadmap", description: "Build skills & get validated", status: "pending", order: 4 },
                ],
              },
            },
          },
        },
      });

      const token = generateToken(user.id);

      return {
        success: true,
        user: {
          ...user,
          password: "",
          location: user.location ?? undefined,
          avatar: user.avatar ?? undefined,
        },
        token,
      };
    });
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function loginPrisma(request: LoginRequest): Promise<AuthResponse> {
  try {
    return await withRetry(async () => {
      const user = await prisma.user.findUnique({
        where: { email: request.email },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      if (!verifyPassword(request.password, user.password)) {
        return {
          success: false,
          error: "Invalid password",
        };
      }

      const token = generateToken(user.id);

      return {
        success: true,
        user: {
          ...user,
          password: "",
          location: user.location ?? undefined,
          avatar: user.avatar ?? undefined,
        },
        token,
      };
    });
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
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
