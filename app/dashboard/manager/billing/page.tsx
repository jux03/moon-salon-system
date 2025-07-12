"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Calculator } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Service {
  id: number
  name: string
  category_name: string
  price: number
  duration_minutes: number
}

interface Employee {
  id: number
  full_name: string
  specialties: string
}

interface BillItem {
  service_id: number
  service_name: string
  price: number
  quantity: number
}

export default function BillingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchServices()
    fetchEmployees()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
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
    } finally {
      setLoading(false)
    }
  }

  const addServiceToBill = () => {
    if (!selectedService) return

    const service = services.find((s) => s.id.toString() === selectedService)
    if (!service) return

    const existingItem = billItems.find((item) => item.service_id === service.id)
    if (existingItem) {
      setBillItems((prev) =>
        prev.map((item) => (item.service_id === service.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setBillItems((prev) => [
        ...prev,
        {
          service_id: service.id,
          service_name: service.name,
          price: service.price,
          quantity: 1,
        },
      ])
    }
    setSelectedService("")
  }

  const removeServiceFromBill = (serviceId: number) => {
    setBillItems((prev) => prev.filter((item) => item.service_id !== serviceId))
  }

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeServiceFromBill(serviceId)
      return
    }
    setBillItems((prev) => prev.map((item) => (item.service_id === serviceId ? { ...item, quantity } : item)))
  }

  const calculateTotal = () => {
    return billItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    if (!customerName || !selectedEmployee || billItems.length === 0) {
      setError("Please fill all required fields and add at least one service")
      setSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          employee_id: Number.parseInt(selectedEmployee),
          services: billItems.map((item) => ({
            service_id: item.service_id,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Bill created successfully! Bill #${data.billNumber}`)
        // Reset form
        setCustomerName("")
        setCustomerPhone("")
        setSelectedEmployee("")
        setBillItems([])
        // Redirect to bill details after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/manager/bills`)
        }, 2000)
      } else {
        setError(data.error || "Failed to create bill")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Create New Bill">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Create New Bill">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Service Bill</CardTitle>
            <CardDescription>Create a new bill for customer services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBill} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Customer Phone</Label>
                  <Input
                    id="customer_phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label htmlFor="employee">Assigned Employee *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
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

              {/* Service Selection */}
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="service">Add Service</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service to add" />
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
                              <div className="font-semibold text-green-600">${service.price.toFixed(2)}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" onClick={addServiceToBill} disabled={!selectedService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Bill Items */}
                {billItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold">Selected Services</h3>
                      </div>
                      <div className="divide-y">
                        {billItems.map((item) => (
                          <div key={item.service_id} className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.service_name}</h4>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.service_id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.service_id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <div className="font-semibold min-w-[80px] text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeServiceFromBill(item.service_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Calculator className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="font-semibold">Total Amount:</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || billItems.length === 0}>
                  {submitting ? "Creating Bill..." : "Create Bill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
