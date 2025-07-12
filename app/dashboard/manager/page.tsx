"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Receipt, DollarSign, Baby } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalEmployees: number
  todayAppointments: number
  pendingBills: number
  todayRevenue: number
}

interface RecentAppointment {
  id: number
  appointment_number: string
  customer_name: string
  customer_age: number
  parent_name: string
  parent_phone: string
  employee_name: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
}

interface RecentBill {
  id: number
  bill_number: string
  customer_name: string
  employee_name: string
  total_amount: number
  payment_status: string
  created_at: string
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    todayAppointments: 0,
    pendingBills: 0,
    todayRevenue: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [recentBills, setRecentBills] = useState<RecentBill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")

      // Fetch employees
      const employeesResponse = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const employees = await employeesResponse.json()

      // Fetch appointments
      const appointmentsResponse = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appointments = await appointmentsResponse.json()

      // Fetch bills
      const billsResponse = await fetch("/api/bills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const bills = await billsResponse.json()

      const today = new Date().toISOString().split("T")[0]
      const todayAppointments = appointments.filter(
        (apt: any) => apt.appointment_date === today && apt.status === "scheduled",
      )
      const pendingBills = bills.filter((bill: any) => bill.payment_status === "pending")
      const todayRevenue = bills
        .filter((bill: any) => bill.created_at.startsWith(today) && bill.payment_status === "paid")
        .reduce((sum: number, bill: any) => sum + Number.parseFloat(bill.total_amount), 0)

      setStats({
        totalEmployees: employees.filter((emp: any) => emp.role === "employee").length,
        todayAppointments: todayAppointments.length,
        pendingBills: pendingBills.length,
        todayRevenue,
      })

      // Set recent data
      setRecentAppointments(appointments.filter((apt: any) => apt.status === "scheduled").slice(0, 5))
      setRecentBills(bills.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Manager Dashboard">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Manager Dashboard 🎪">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-pink-200 hover:border-purple-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Team Members</CardTitle>
              <Users className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.totalEmployees}</div>
              <p className="text-xs text-pink-600">Active stylists</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.todayAppointments}</div>
              <p className="text-xs text-blue-600">Scheduled today</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Bills</CardTitle>
              <Receipt className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.pendingBills}</div>
              <p className="text-xs text-yellow-600">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">${stats.todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-green-600">Revenue today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-purple-700">🚀 Quick Actions</CardTitle>
            <CardDescription className="text-pink-600">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => (window.location.href = "/dashboard/manager/appointments")}
                className="h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold flex flex-col items-center justify-center space-y-1"
              >
                <Calendar className="h-6 w-6" />
                <span>Schedule Appointment</span>
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard/manager/billing")}
                className="h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold flex flex-col items-center justify-center space-y-1"
              >
                <Receipt className="h-6 w-6" />
                <span>Create Bill</span>
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard/manager/bills")}
                className="h-16 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold flex flex-col items-center justify-center space-y-1"
              >
                <DollarSign className="h-6 w-6" />
                <span>View Bills</span>
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard/manager/employees")}
                className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold flex flex-col items-center justify-center space-y-1"
              >
                <Users className="h-6 w-6" />
                <span>View Team</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription className="text-blue-600">Next scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Baby className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-semibold text-blue-800">{appointment.customer_name}</p>
                        <p className="text-sm text-blue-600">{appointment.service_name}</p>
                        <p className="text-xs text-blue-500">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                          {appointment.appointment_time}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
                  </div>
                ))}
                {recentAppointments.length === 0 && (
                  <p className="text-center text-blue-500 py-4">No upcoming appointments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bills */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Recent Bills
              </CardTitle>
              <CardDescription className="text-green-600">Latest billing activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">#{bill.bill_number}</p>
                      <p className="text-sm text-green-600">{bill.customer_name}</p>
                      <p className="text-xs text-green-500">{new Date(bill.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">
                        ${Number.parseFloat(bill.total_amount.toString()).toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(bill.payment_status)}>{bill.payment_status.toUpperCase()}</Badge>
                    </div>
                  </div>
                ))}
                {recentBills.length === 0 && <p className="text-center text-green-500 py-4">No recent bills</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
