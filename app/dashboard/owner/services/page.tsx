"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Scissors, Clock, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Service {
  id: number
  name: string
  category_id: number
  category_name: string
  price: number
  duration_minutes: number
  description: string
  created_at: string
}

interface ServiceCategory {
  id: number
  name: string
  description: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState({
    name: "",
    category_id: "",
    price: "",
    duration_minutes: "",
    description: "",
  })
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newService,
          category_id: Number.parseInt(newService.category_id),
          price: Number.parseFloat(newService.price),
          duration_minutes: Number.parseInt(newService.duration_minutes),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Service added successfully! ✨")
        setShowAddServiceDialog(false)
        setNewService({
          name: "",
          category_id: "",
          price: "",
          duration_minutes: "",
          description: "",
        })
        fetchServices()
      } else {
        setError(data.error || "Failed to add service")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newService,
          category_id: Number.parseInt(newService.category_id),
          price: Number.parseFloat(newService.price),
          duration_minutes: Number.parseInt(newService.duration_minutes),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Service updated successfully! ✨")
        setEditingService(null)
        setNewService({
          name: "",
          category_id: "",
          price: "",
          duration_minutes: "",
          description: "",
        })
        fetchServices()
      } else {
        setError(data.error || "Failed to update service")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Service deleted successfully! ✨")
        fetchServices()
      } else {
        setError(data.error || "Failed to delete service")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Category added successfully! ✨")
        setShowAddCategoryDialog(false)
        setNewCategory({
          name: "",
          description: "",
        })
        fetchCategories()
      } else {
        setError(data.error || "Failed to add category")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const startEditService = (service: Service) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      category_id: service.category_id.toString(),
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      description: service.description,
    })
  }

  if (loading) {
    return (
      <DashboardLayout title="Services Management">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Services Management 🎨">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-700">Manage Services</h2>
            <p className="text-pink-600">Control all services, categories, and pricing</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-purple-700">🎪 Add New Category</DialogTitle>
                  <DialogDescription className="text-pink-600">
                    Create a new service category for better organization
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_name" className="text-purple-700 font-semibold">
                      Category Name
                    </Label>
                    <Input
                      id="category_name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Hair Styling"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_description" className="text-purple-700 font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="category_description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this category..."
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      Add Category
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showAddServiceDialog || !!editingService}
              onOpenChange={(open) => {
                if (!open) {
                  setShowAddServiceDialog(false)
                  setEditingService(null)
                  setNewService({
                    name: "",
                    category_id: "",
                    price: "",
                    duration_minutes: "",
                    description: "",
                  })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />✨ Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-purple-700">
                    {editingService ? "✏️ Edit Service" : "🎉 Add New Service"}
                  </DialogTitle>
                  <DialogDescription className="text-pink-600">
                    {editingService ? "Update the service details" : "Create a new service offering"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_name" className="text-purple-700 font-semibold">
                      Service Name
                    </Label>
                    <Input
                      id="service_name"
                      value={newService.name}
                      onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Princess Braids"
                      className="border-2 border-pink-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_category" className="text-purple-700 font-semibold">
                      Category
                    </Label>
                    <Select
                      value={newService.category_id}
                      onValueChange={(value) => setNewService((prev) => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger className="border-2 border-pink-200 focus:border-purple-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service_price" className="text-purple-700 font-semibold">
                        Price ($)
                      </Label>
                      <Input
                        id="service_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newService.price}
                        onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                        required
                        placeholder="25.00"
                        className="border-2 border-pink-200 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service_duration" className="text-purple-700 font-semibold">
                        Duration (min)
                      </Label>
                      <Input
                        id="service_duration"
                        type="number"
                        min="5"
                        max="300"
                        value={newService.duration_minutes}
                        onChange={(e) => setNewService((prev) => ({ ...prev, duration_minutes: e.target.value }))}
                        required
                        placeholder="30"
                        className="border-2 border-pink-200 focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_description" className="text-purple-700 font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="service_description"
                      value={newService.description}
                      onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the service..."
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddServiceDialog(false)
                        setEditingService(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      {editingService ? "Update Service" : "Add Service"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services by Category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryServices = services.filter((service) => service.category_id === category.id)
            return (
              <Card key={category.id} className="border-2 border-pink-200 hover:border-purple-300 transition-colors">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <CardTitle className="text-purple-700 flex items-center">
                    <Scissors className="h-5 w-5 mr-2 text-pink-500" />
                    {category.name}
                    <Badge className="ml-2 bg-pink-100 text-pink-700">{categoryServices.length} services</Badge>
                  </CardTitle>
                  {category.description && <p className="text-pink-600 text-sm">{category.description}</p>}
                </CardHeader>
                <CardContent className="p-0">
                  {categoryServices.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No services in this category yet. Add the first one!
                    </div>
                  ) : (
                    <div className="divide-y divide-pink-100">
                      {categoryServices.map((service) => (
                        <div key={service.id} className="p-4 hover:bg-pink-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <h3 className="font-semibold text-purple-700">{service.name}</h3>
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center text-green-600">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <span className="font-bold">
  {Number(service.price).toFixed(2)}
</span>

                                  </div>
                                  <div className="flex items-center text-blue-600">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{service.duration_minutes} min</span>
                                  </div>
                                </div>
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditService(service)}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {categories.length === 0 && (
          <Card className="border-2 border-dashed border-pink-300">
            <CardContent className="text-center py-12">
              <Scissors className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-700 mb-2">No service categories yet! 🎨</h3>
              <p className="text-pink-600 mb-4">
                Start by creating your first service category to organize your offerings.
              </p>
              <Button
                onClick={() => setShowAddCategoryDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />✨ Add First Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
