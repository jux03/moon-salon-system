import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { payment_method } = await request.json()
    const billId = params.id

    if (!payment_method) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 })
    }

    await executeQuery(
      "UPDATE bills SET payment_status = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["paid", payment_method, billId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
