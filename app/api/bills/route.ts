import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let whereClause = ""
    const params: any[] = []

    if (decoded.role === "manager") {
      whereClause = "WHERE b.manager_id = ?"
      params.push(decoded.id)
    } else if (decoded.role === "employee") {
      whereClause = "WHERE b.employee_id = ?"
      params.push(decoded.id)
    }

    const bills = await executeQuery(
      `
      SELECT b.*, 
             u_emp.full_name as employee_name,
             u_mgr.full_name as manager_name
      FROM bills b
      JOIN users u_emp ON b.employee_id = u_emp.id
      JOIN users u_mgr ON b.manager_id = u_mgr.id
      ${whereClause}
      ORDER BY b.created_at DESC
    `,
      params,
    )

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Get bills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customer_name, customer_phone, employee_id, services } = await request.json()

    if (!customer_name || !employee_id || !services || services.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate total amount
    let total_amount = 0
    for (const service of services) {
      const serviceData = (await executeQuery("SELECT price FROM services WHERE id = ?", [service.service_id])) as any[]

      if (serviceData.length > 0) {
        total_amount += serviceData[0].price * (service.quantity || 1)
      }
    }

    // Generate bill number
    const billNumber = `MS${Date.now()}`

    // Create bill
    const billResult = (await executeQuery(
      "INSERT INTO bills (bill_number, customer_name, customer_phone, employee_id, manager_id, total_amount) VALUES (?, ?, ?, ?, ?, ?)",
      [billNumber, customer_name, customer_phone, employee_id, decoded.id, total_amount],
    )) as any

    const billId = billResult.insertId

    // Add bill items
    for (const service of services) {
      const serviceData = (await executeQuery("SELECT price FROM services WHERE id = ?", [service.service_id])) as any[]

      if (serviceData.length > 0) {
        await executeQuery("INSERT INTO bill_items (bill_id, service_id, quantity, price) VALUES (?, ?, ?, ?)", [
          billId,
          service.service_id,
          service.quantity || 1,
          serviceData[0].price,
        ])
      }
    }

    return NextResponse.json({ success: true, billId, billNumber, total_amount })
  } catch (error) {
    console.error("Create bill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
