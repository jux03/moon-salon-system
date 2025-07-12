import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const appointmentId = params.id

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    await executeQuery("UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      status,
      appointmentId,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
