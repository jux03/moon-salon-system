import { NextResponse } from "next/server"
import { executeQuery, testConnection } from "@/lib/db"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const connectionTest = await testConnection()
    if (!connectionTest) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          success: false,
        },
        { status: 500 },
      )
    }

    // Test users table
    const users = await executeQuery("SELECT id, username, role, full_name FROM users LIMIT 5")

    // Test services table
    const services = await executeQuery("SELECT COUNT(*) as count FROM services")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        users: users,
        serviceCount: services,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
