import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token || "")

    if (!decoded || decoded.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get("start_date") || "2024-01-01"
    const endDate = url.searchParams.get("end_date") || "2024-12-31"

    // Total sales
    const totalSales = (await executeQuery(
      `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales,
             COUNT(*) as total_bills
      FROM bills 
      WHERE payment_status = 'paid' 
      AND DATE(created_at) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    )) as any[]

    // Sales by employee
    const salesByEmployee = await executeQuery(
      `
      SELECT u.full_name as employee_name,
             COALESCE(SUM(b.total_amount), 0) as total_sales,
             COUNT(b.id) as total_bills
      FROM users u
      LEFT JOIN bills b ON u.id = b.employee_id AND b.payment_status = 'paid'
      AND DATE(b.created_at) BETWEEN ? AND ?
      WHERE u.role = 'employee'
      GROUP BY u.id, u.full_name
      ORDER BY total_sales DESC
    `,
      [startDate, endDate],
    )

    // Sales by service category
    const salesByCategory = await executeQuery(
      `
      SELECT sc.name as category_name,
             COALESCE(SUM(bi.price * bi.quantity), 0) as total_sales,
             SUM(bi.quantity) as total_quantity
      FROM service_categories sc
      LEFT JOIN services s ON sc.id = s.category_id
      LEFT JOIN bill_items bi ON s.id = bi.service_id
      LEFT JOIN bills b ON bi.bill_id = b.id AND b.payment_status = 'paid'
      AND DATE(b.created_at) BETWEEN ? AND ?
      GROUP BY sc.id, sc.name
      ORDER BY total_sales DESC
    `,
      [startDate, endDate],
    )

    // Daily sales trend
    const dailySales = await executeQuery(
      `
      SELECT DATE(created_at) as sale_date,
             COALESCE(SUM(total_amount), 0) as daily_sales,
             COUNT(*) as daily_bills
      FROM bills 
      WHERE payment_status = 'paid'
      AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY sale_date ASC
    `,
      [startDate, endDate],
    )

    return NextResponse.json({
      summary: totalSales[0],
      salesByEmployee,
      salesByCategory,
      dailySales,
    })
  } catch (error) {
    console.error("Sales report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
