import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { hashPassword, verifyToken } from "@/lib/auth"

// Get all users (employees/managers)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || (decoded.role !== "owner" && decoded.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await executeQuery(`
      SELECT u.id, u.username, u.email, u.role, u.full_name, u.phone, u.created_at,
             GROUP_CONCAT(sc.name) as specialties
      FROM users u
      LEFT JOIN employee_specialties es ON u.id = es.employee_id
      LEFT JOIN service_categories sc ON es.service_category_id = sc.id
      WHERE u.role IN ('manager', 'employee')
      GROUP BY u.id
      ORDER BY u.role, u.full_name
    `)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, password, role, full_name, phone, specialties } = await request.json()

    if (!username || !email || !password || !role || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const result = (await executeQuery(
      "INSERT INTO users (username, email, password, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role, full_name, phone],
    )) as any

    const userId = result.insertId

    // Add specialties for employees
    if (role === "employee" && specialties && specialties.length > 0) {
      for (const categoryId of specialties) {
        await executeQuery("INSERT INTO employee_specialties (employee_id, service_category_id) VALUES (?, ?)", [
          userId,
          categoryId,
        ])
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
