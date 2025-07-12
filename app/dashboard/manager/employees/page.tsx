"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, Phone, Calendar, Award } from "lucide-react"

interface Employee {
  id: number
  username: string
  email: string
  role: string
  full_name: string
  phone: string
  specialties: string
  created_at: string
}

interface EmployeeStats {
  totalAppointments: number
  completedAppointments: number
  totalRevenue: number
  avgRating: number
}

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeStats, setEmployeeStats] = useState<Record<number, EmployeeStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      const employeeData = data.filter((user: any) => user.role === "employee")
      setEmployees(employeeData)

      // Fetch stats for each employee
      const statsPromises = employeeData.map(async (employee: Employee) => {
        const statsData = await fetchEmployeeStats(employee.id)
        return { id: employee.id, stats: statsData }
      })

      const allStats = await Promise.all(statsPromises)
      const statsMap = allStats.reduce(
        (acc, { id, stats }) => {
          acc[id] = stats
          return acc
        },
        {} as Record<number, EmployeeStats>,
      )

      setEmployeeStats(statsMap)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeStats = async (employeeId: number): Promise<EmployeeStats> => {
    try {
      const token = localStorage.getItem("moon_salon_token")

      // Fetch appointments for this employee
      const appointmentsResponse = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appointments = await appointmentsResponse.json()
      const employeeAppointments = appointments.filter((apt: any) => apt.employee_id === employeeId)

      // Fetch bills for this employee
      const billsResponse = await fetch("/api/bills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const bills = await billsResponse.json()
      const employeeBills = bills.filter((bill: any) => bill.employee_id === employeeId)

      const totalAppointments = employeeAppointments.length
      const completedAppointments = employeeAppointments.filter((apt: any) => apt.status === "completed").length
      const totalRevenue = employeeBills
        .filter((bill: any) => bill.payment_status === "paid")
        .reduce((sum: number, bill: any) => sum + Number.parseFloat(bill.total_amount), 0)

      return {
        totalAppointments,
        completedAppointments,
        totalRevenue,
        avgRating: 4.5 + Math.random() * 0.5, // Mock rating for now
      }
    } catch (error) {
      console.error("Error fetching employee stats:", error)
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        avgRating: 0,
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Team Management">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Team Management 👥">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-purple-700">Our Amazing Team</h2>
            <p className="text-pink-600">Monitor and manage your talented stylists</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/dashboard/manager/appointments")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-pink-700 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Total Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-700">{employees.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700">
                {employees.length > 0 ? employees[0].full_name : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Avg Team Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">4.8</div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.map((employee) => {
            const stats = employeeStats[employee.id] || {
              totalAppointments: 0,
              completedAppointments: 0,
              totalRevenue: 0,
              avgRating: 0,
            }

            return (
              <Card key={employee.id} className="border-2 border-pink-200 hover:border-purple-300 transition-colors">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {employee.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-purple-700">{employee.full_name}</h3>
                      <p className="text-pink-600">{employee.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-purple-100 text-purple-800">Stylist</Badge>
                        {employee.phone && (
                          <div className="flex items-center text-pink-600">
                            <Phone className="h-3 w-3 mr-1" />
                            <span className="text-sm">{employee.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Specialties */}
                  {employee.specialties && (
                    <div>
                      <p className="text-sm font-semibold text-purple-700 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.specialties.split(",").map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700">
                            {specialty.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 text-sm font-medium">Appointments</p>
                      <p className="text-blue-800 text-xl font-bold">
                        {stats.completedAppointments}/{stats.totalAppointments}
                      </p>
                      <p className="text-blue-600 text-xs">Completed/Total</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 text-sm font-medium">Revenue</p>
                      <p className="text-green-800 text-xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                      <p className="text-green-600 text-xs">Total earned</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-700 font-medium">Rating</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-800 font-bold text-lg">{stats.avgRating.toFixed(1)}</span>
                        <span className="text-yellow-600 text-sm ml-1">/5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = `/dashboard/manager/appointments?employee=${employee.id}`)}
                      className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Viewing detailed performance for ${employee.full_name}`)}
                      className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {employees.length === 0 && (
          <Card className="border-2 border-dashed border-pink-300">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-700 mb-2">No employees found! 👥</h3>
              <p className="text-pink-600 mb-4">Contact the owner to add team members to the system.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
