import { User, AuthResponse, LoginRequest, SignupRequest } from "./types";
import { db } from "./db";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  // For demo purposes, we'll use a simple hash
  // In production, use bcrypt or argon2
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(userId: string): string {
  // Simple token generation (in production, use JWT)
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

export async function signup(
  request: SignupRequest
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(request.email);
    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    // Create new user
    const userId = `user_${Date.now()}`;
    const user: User = {
      id: userId,
      email: request.email,
      password: hashPassword(request.password),
      name: request.name,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = await db.createUser(user);

    // Create user profile
    await db.createOrUpdateProfile({
      id: `profile_${userId}`,
      userId,
      interests: [],
      skills: [],
      experienceLevel: "beginner",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate token
    const token = generateToken(userId);

    return {
      success: true,
      user: {
        ...createdUser,
        password: "", // Don't return password
      },
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed",
    };
  }
}

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  try {
    const user = await db.getUserByEmail(request.email);

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
        password: "", // Don't return password
      },
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId;
  } catch {
    return null;
  }
}
