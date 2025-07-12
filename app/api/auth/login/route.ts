import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")

    const body = await request.json()
    console.log("Request body received")

    const { username, password } = body

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    console.log("Attempting authentication for:", username)

    const user = await authenticateUser(username, password)

    if (!user) {
      console.log("Authentication failed for:", username)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Authentication successful for:", user.username)

    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
