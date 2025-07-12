import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, category_id, price, duration_minutes, description } = await request.json()
    const serviceId = params.id

    if (!name || !category_id || !price || !duration_minutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await executeQuery(
      "UPDATE services SET name = ?, category_id = ?, price = ?, duration_minutes = ?, description = ? WHERE id = ?",
      [name, category_id, price, duration_minutes, description, serviceId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id

    await executeQuery("DELETE FROM services WHERE id = ?", [serviceId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
