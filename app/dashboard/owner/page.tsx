"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Receipt, DollarSign, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalEmployees: number
  totalBillsToday: number
  totalSalesToday: number
  totalSalesMonth: number
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalBillsToday: 0,
    totalSalesToday: 0,
    totalSalesMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")

      // Fetch users count
      const usersResponse = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const users = await usersResponse.json()

      // Fetch bills
      const billsResponse = await fetch("/api/bills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const bills = await billsResponse.json()

      const today = new Date().toISOString().split("T")[0]
      const thisMonth = new Date().toISOString().slice(0, 7)

      const billsToday = bills.filter(
        (bill: any) => bill.created_at.startsWith(today) && bill.payment_status === "paid",
      )

      const billsThisMonth = bills.filter(
        (bill: any) => bill.created_at.startsWith(thisMonth) && bill.payment_status === "paid",
      )

      setStats({
        totalEmployees: users.length,
        totalBillsToday: billsToday.length,
        totalSalesToday: billsToday.reduce((sum: number, bill: any) => sum + Number.parseFloat(bill.total_amount), 0),
        totalSalesMonth: billsThisMonth.reduce(
          (sum: number, bill: any) => sum + Number.parseFloat(bill.total_amount),
          0,
        ),
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Owner Dashboard">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Owner Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Employees & Managers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBillsToday}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSalesToday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSalesMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month's revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Moon Salon</CardTitle>
            <CardDescription>Your comprehensive salon management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Manage Your Team</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Add managers and employees, assign specialties, and track performance.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Track Sales</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Monitor daily, weekly, and monthly sales with detailed reports.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Service Management</h3>
                <p className="text-sm text-green-700 mt-1">Manage services, pricing, and categories efficiently.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/dashboard/owner/users"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium">Manage Users</span>
                </div>
              </a>
              <a
                href="/dashboard/owner/services"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium">Manage Services</span>
                </div>
              </a>
              <a
                href="/dashboard/owner/reports"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium">View Reports</span>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
