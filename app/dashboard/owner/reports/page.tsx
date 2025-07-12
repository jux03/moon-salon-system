"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react"

interface SalesReport {
  summary: {
    total_sales: number
    total_bills: number
  }
  salesByEmployee: Array<{
    employee_name: string
    total_sales: number
    total_bills: number
  }>
  salesByCategory: Array<{
    category_name: string
    total_sales: number
    total_quantity: number
  }>
  dailySales: Array<{
    sale_date: string
    daily_sales: number
    daily_bills: number
  }>
}

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch(`/api/reports/sales?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Sales Reports">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Sales Reports">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
            <CardDescription>Select date range for sales analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={fetchReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${Number.parseFloat(report.summary.total_sales.toString()).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">From {report.summary.total_bills} completed bills</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {report.summary.total_bills > 0
                      ? (Number.parseFloat(report.summary.total_sales.toString()) / report.summary.total_bills).toFixed(
                          2,
                        )
                      : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">Per customer transaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales by Employee */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Employee</CardTitle>
                <CardDescription>Performance breakdown by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.salesByEmployee.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {employee.employee_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.employee_name}</h3>
                          <p className="text-sm text-gray-600">{employee.total_bills} bills completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          ${Number.parseFloat(employee.total_sales.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          avg $
                          {employee.total_bills > 0
                            ? (Number.parseFloat(employee.total_sales.toString()) / employee.total_bills).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {report.salesByEmployee.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No employee sales data for selected period</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Service Category</CardTitle>
                <CardDescription>Revenue breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.salesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{category.category_name}</h3>
                        <p className="text-sm text-gray-600">{category.total_quantity} services provided</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">
                          ${Number.parseFloat(category.total_sales.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          avg $
                          {category.total_quantity > 0
                            ? (Number.parseFloat(category.total_sales.toString()) / category.total_quantity).toFixed(2)
                            : "0.00"}{" "}
                          per service
                        </p>
                      </div>
                    </div>
                  ))}
                  {report.salesByCategory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No category sales data for selected period</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Trend</CardTitle>
                <CardDescription>Sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.dailySales.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{new Date(day.sale_date).toLocaleDateString()}</span>
                        <span className="text-sm text-gray-500">({day.daily_bills} bills)</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ${Number.parseFloat(day.daily_sales.toString()).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {report.dailySales.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No daily sales data for selected period</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
