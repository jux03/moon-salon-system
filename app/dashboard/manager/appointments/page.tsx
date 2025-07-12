"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Baby, Star, Phone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Appointment {
  id: number
  appointment_number: string
  customer_name: string
  customer_age: number
  parent_name: string
  parent_phone: string
  parent_email: string
  employee_name: string
  service_name: string
  service_price: number
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  special_notes: string
  created_at: string
}

interface Employee {
  id: number
  full_name: string
  specialties: string
}

interface Service {
  id: number
  name: string
  category_name: string
  price: number
  duration_minutes: number
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    customer_name: "",
    customer_age: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    employee_id: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    special_notes: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchAppointments()
    fetchEmployees()
    fetchServices()
  }, [])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setEmployees(data.filter((user: any) => user.role === "employee"))
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAppointment,
          customer_age: Number.parseInt(newAppointment.customer_age) || null,
          employee_id: Number.parseInt(newAppointment.employee_id),
          service_id: Number.parseInt(newAppointment.service_id),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Appointment scheduled successfully! 🎉")
        setShowAddDialog(false)
        setNewAppointment({
          customer_name: "",
          customer_age: "",
          parent_name: "",
          parent_phone: "",
          parent_email: "",
          employee_id: "",
          service_id: "",
          appointment_date: "",
          appointment_time: "",
          special_notes: "",
        })
        fetchAppointments()
      } else {
        setError(data.error || "Failed to schedule appointment")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "scheduled":
        return "📅"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      case "no_show":
        return "😞"
      default:
        return "📅"
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Kids Appointments">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Kids Appointments 🎈">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-purple-700">Appointment Schedule</h2>
            <p className="text-pink-600">Manage bookings for our little customers</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg">
                <Plus className="h-4 w-4 mr-2" />✨ New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-purple-700 text-xl">🎉 Schedule New Appointment</DialogTitle>
                <DialogDescription className="text-pink-600">
                  Book a magical salon experience for a little one
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-purple-700 font-semibold">
                      Child's Name 👶
                    </Label>
                    <Input
                      id="customer_name"
                      value={newAppointment.customer_name}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, customer_name: e.target.value }))}
                      required
                      placeholder="Enter child's name"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_age" className="text-purple-700 font-semibold">
                      Age 🎂
                    </Label>
                    <Input
                      id="customer_age"
                      type="number"
                      min="1"
                      max="18"
                      value={newAppointment.customer_age}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, customer_age: e.target.value }))}
                      placeholder="Child's age"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_name" className="text-purple-700 font-semibold">
                      Parent/Guardian Name 👨‍👩‍👧‍👦
                    </Label>
                    <Input
                      id="parent_name"
                      value={newAppointment.parent_name}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, parent_name: e.target.value }))}
                      required
                      placeholder="Parent or guardian name"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_phone" className="text-purple-700 font-semibold">
                      Phone Number 📱
                    </Label>
                    <Input
                      id="parent_phone"
                      value={newAppointment.parent_phone}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, parent_phone: e.target.value }))}
                      required
                      placeholder="Contact phone number"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_email" className="text-purple-700 font-semibold">
                    Email (Optional) 📧
                  </Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={newAppointment.parent_email}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, parent_email: e.target.value }))}
                    placeholder="Email address"
                    className="border-2 border-pink-200 focus:border-purple-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id" className="text-purple-700 font-semibold">
                      Stylist 💇‍♀️
                    </Label>
                    <Select
                      value={newAppointment.employee_id}
                      onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, employee_id: value }))}
                    >
                      <SelectTrigger className="border-2 border-pink-200 focus:border-purple-400">
                        <SelectValue placeholder="Choose stylist" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            <div>
                              <div className="font-medium">{employee.full_name}</div>
                              {employee.specialties && (
                                <div className="text-sm text-gray-500">Specialties: {employee.specialties}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_id" className="text-purple-700 font-semibold">
                      Service ✂️
                    </Label>
                    <Select
                      value={newAppointment.service_id}
                      onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, service_id: value }))}
                    >
                      <SelectTrigger className="border-2 border-pink-200 focus:border-purple-400">
                        <SelectValue placeholder="Choose service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            <div className="flex justify-between items-center w-full">
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-gray-500">
                                  {service.category_name} • {service.duration_minutes} min
                                </div>
                              </div>
                              <div className="font-semibold text-green-600">
  ${Number(service.price).toFixed(2)}
</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_date" className="text-purple-700 font-semibold">
                      Date 📅
                    </Label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={newAppointment.appointment_date}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, appointment_date: e.target.value }))}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment_time" className="text-purple-700 font-semibold">
                      Time ⏰
                    </Label>
                    <Input
                      id="appointment_time"
                      type="time"
                      value={newAppointment.appointment_time}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, appointment_time: e.target.value }))}
                      required
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special_notes" className="text-purple-700 font-semibold">
                    Special Notes 📝
                  </Label>
                  <Textarea
                    id="special_notes"
                    value={newAppointment.special_notes}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, special_notes: e.target.value }))}
                    placeholder="Any special requests or notes about the child..."
                    className="border-2 border-pink-200 focus:border-purple-400"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-300 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    🎉 Schedule Appointment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-purple-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Baby className="h-6 w-6 text-pink-500" />
                        <h3 className="font-bold text-lg text-purple-700">{appointment.customer_name}</h3>
                        {appointment.customer_age && (
                          <Badge className="bg-yellow-100 text-yellow-800">{appointment.customer_age} years old</Badge>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} font-semibold`}>
                        {getStatusEmoji(appointment.status)} {appointment.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 text-pink-500 mr-1" />
                          <p className="text-pink-700 font-semibold">Parent/Guardian</p>
                        </div>
                        <p className="font-medium text-purple-700">{appointment.parent_name}</p>
                        <p className="text-pink-600">{appointment.parent_phone}</p>
                        {appointment.parent_email && (
                          <p className="text-pink-600 text-xs">{appointment.parent_email}</p>
                        )}
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-purple-500 mr-1" />
                          <p className="text-purple-700 font-semibold">Stylist & Service</p>
                        </div>
                        <p className="font-medium text-purple-700">{appointment.employee_name}</p>
                        <p className="text-purple-600">{appointment.service_name}</p>
                        <p className="text-green-600 font-bold">
  ${Number(appointment.service_price).toFixed(2)}
</p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                          <p className="text-blue-700 font-semibold">Date & Time</p>
                        </div>
                        <p className="font-medium text-blue-700">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-blue-500 mr-1" />
                          <p className="text-blue-600">
                            {appointment.appointment_time} ({appointment.duration_minutes} min)
                          </p>
                        </div>
                      </div>

                      {appointment.special_notes && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-yellow-700 font-semibold mb-1">📝 Special Notes</p>
                          <p className="text-yellow-600 text-xs">{appointment.special_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          ✅ Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          ❌ Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, "no_show")}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          😞 No Show
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && (
          <Card className="border-2 border-dashed border-pink-300">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-700 mb-2">No appointments scheduled! 🎈</h3>
              <p className="text-pink-600 mb-4">
                Start by booking the first magical appointment for our little customers.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />✨ Schedule First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
