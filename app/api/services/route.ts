import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const services = await executeQuery(`
      SELECT s.*, sc.name as category_name
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      ORDER BY sc.name, s.name
    `)

    return NextResponse.json(services)
  } catch (error) {
    console.error("Get services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, category_id, price, duration_minutes, description } = await request.json()

    if (!name || !category_id || !price || !duration_minutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = (await executeQuery(
      "INSERT INTO services (name, category_id, price, duration_minutes, description) VALUES (?, ?, ?, ?, ?)",
      [name, category_id, price, duration_minutes, description],
    )) as any

    return NextResponse.json({ success: true, serviceId: result.insertId })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
