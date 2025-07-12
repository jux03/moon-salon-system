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

    if (decoded.role === "employee") {
      whereClause = "WHERE a.employee_id = ?"
      params.push(decoded.id)
    }

    const appointments = await executeQuery(
      `
      SELECT a.*, 
             u.full_name as employee_name,
             s.name as service_name,
             s.price as service_price
      FROM appointments a
      JOIN users u ON a.employee_id = u.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `,
      params,
    )

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Get appointments error:", error)
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

    const {
      customer_name,
      customer_age,
      parent_name,
      parent_phone,
      parent_email,
      employee_id,
      service_id,
      appointment_date,
      appointment_time,
      special_notes,
    } = await request.json()

    if (
      !customer_name ||
      !parent_name ||
      !parent_phone ||
      !employee_id ||
      !service_id ||
      !appointment_date ||
      !appointment_time
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get service duration
    const serviceData = (await executeQuery("SELECT duration_minutes FROM services WHERE id = ?", [
      service_id,
    ])) as any[]

    if (serviceData.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const duration_minutes = serviceData[0].duration_minutes

    // Generate appointment number
    const appointmentNumber = `APT${Date.now()}`

    const result = (await executeQuery(
      `INSERT INTO appointments 
       (appointment_number, customer_name, customer_age, parent_name, parent_phone, parent_email, 
        employee_id, service_id, appointment_date, appointment_time, duration_minutes, special_notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentNumber,
        customer_name,
        customer_age,
        parent_name,
        parent_phone,
        parent_email,
        employee_id,
        service_id,
        appointment_date,
        appointment_time,
        duration_minutes,
        special_notes,
      ],
    )) as any

    return NextResponse.json({ success: true, appointmentId: result.insertId, appointmentNumber })
  } catch (error) {
    console.error("Create appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
