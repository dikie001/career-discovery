import { signupPrisma } from "@/lib/auth-prisma"
import { SignupRequest, ApiResponse, User } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SignupRequest = await request.json()

    // Validate input
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and name are required",
        } as ApiResponse<null>,
        { status: 400 }
      )
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters",
        } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const result = await signupPrisma(body)

    if (!result.success) {
      return NextResponse.json(result as ApiResponse<null>, { status: 400 })
    }

    return NextResponse.json(result as ApiResponse<User>, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
