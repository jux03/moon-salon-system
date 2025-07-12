"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Receipt, Eye, CreditCard, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Bill {
  id: number
  bill_number: string
  customer_name: string
  customer_phone: string
  employee_name: string
  manager_name: string
  total_amount: number
  payment_status: "pending" | "paid" | "cancelled"
  payment_method: string
  created_at: string
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch("/api/bills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setBills(data)
    } catch (error) {
      console.error("Error fetching bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedBill || !paymentMethod) return

    setProcessing(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("moon_salon_token")
      const response = await fetch(`/api/bills/${selectedBill.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_method: paymentMethod }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Payment processed successfully!")
        setShowPaymentDialog(false)
        setPaymentMethod("")
        setSelectedBill(null)
        fetchBills()
      } else {
        setError(data.error || "Payment processing failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Bills Management">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Bills Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Service Bills</h2>
            <p className="text-sm text-gray-600">Manage customer bills and payments</p>
          </div>
          <Button onClick={() => (window.location.href = "/dashboard/manager/billing")}>
            <Receipt className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold">{bills.length}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paid Bills</p>
                  <p className="text-2xl font-bold">{bills.filter((b) => b.payment_status === "paid").length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    $
                    {bills
                      .filter((b) => b.payment_status === "paid")
                      .reduce((sum, b) => sum + Number.parseFloat(b.total_amount.toString()), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-lg">Bill #{bill.bill_number}</h3>
                      <Badge className={getStatusColor(bill.payment_status)}>{bill.payment_status.toUpperCase()}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-medium">{bill.customer_name}</p>
                        {bill.customer_phone && <p className="text-gray-500">{bill.customer_phone}</p>}
                      </div>
                      <div>
                        <p className="text-gray-600">Employee</p>
                        <p className="font-medium">{bill.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium">{new Date(bill.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(bill.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-bold text-lg text-green-600">
                          ${Number.parseFloat(bill.total_amount.toString()).toFixed(2)}
                        </p>
                        {bill.payment_method && <p className="text-gray-500 text-xs">via {bill.payment_method}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bill.payment_status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill)
                          setShowPaymentDialog(true)
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bills.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No bills found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first customer bill.</p>
              <Button onClick={() => (window.location.href = "/dashboard/manager/billing")}>
                <Receipt className="h-4 w-4 mr-2" />
                Create First Bill
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>Process payment for Bill #{selectedBill?.bill_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedBill && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-medium">{selectedBill.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-bold text-lg text-green-600">
                        ${Number.parseFloat(selectedBill.total_amount.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={!paymentMethod || processing}>
                  {processing ? "Processing..." : "Confirm Payment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
