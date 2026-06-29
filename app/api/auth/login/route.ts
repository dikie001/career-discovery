import { login } from "@/lib/auth";
import { LoginRequest, ApiResponse, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginRequest = await request.json();

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const result = await login(body);

    if (!result.success) {
      return NextResponse.json(result as ApiResponse<null>, { status: 401 });
    }

    return NextResponse.json(result as ApiResponse<User>, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
