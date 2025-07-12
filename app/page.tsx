"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Scissors, Users, BarChart3, CreditCard, Calendar } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("moon_salon_token")
    const user = localStorage.getItem("moon_salon_user")

    if (token && user) {
      const userData = JSON.parse(user)
      if (userData.role === "owner") {
        router.push("/dashboard/owner")
      } else if (userData.role === "manager") {
        router.push("/dashboard/manager")
      } else {
        router.push("/dashboard/employee")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Update the hero section and features for kids salon */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Moon className="h-16 w-16 text-yellow-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Moon Kids Salon
            </h1>
          </div>
          <p className="text-xl text-purple-600 mb-8 max-w-2xl mx-auto font-semibold">
            🎈 Where every haircut is a magical adventure! 🌟
            <br />
            Professional salon management system designed specifically for children's hair salons, making every visit
            fun and memorable while streamlining your business operations.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transform transition hover:scale-105"
            >
              ✨ Get Started ✨
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-bold text-lg px-8 py-4 rounded-full bg-transparent"
            >
              🎪 Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Update the features for kids salon */}
          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-purple-300 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardHeader>
              <Users className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <CardTitle className="text-purple-700">👨‍👩‍👧‍👦 Staff Management</CardTitle>
              <CardDescription className="text-pink-600">
                Manage your team of kid-friendly stylists with specialized training and experience working with
                children.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-purple-700">📅 Appointment Booking</CardTitle>
              <CardDescription className="text-purple-600">
                Easy appointment scheduling with parent contact information, child preferences, and special notes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-purple-300 bg-gradient-to-br from-blue-50 to-green-50">
            <CardHeader>
              <Scissors className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-purple-700">✂️ Kids Services</CardTitle>
              <CardDescription className="text-blue-600">
                Specialized services for children including first haircuts, fun styling, temporary colors, and special
                occasion looks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Sales Reports</CardTitle>
              <CardDescription>
                Comprehensive reporting dashboard with sales analytics, employee performance, and business insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Moon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>User-Friendly Interface</CardTitle>
              <CardDescription>
                Intuitive design that makes it easy for staff at all levels to navigate and use efficiently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor your business performance with real-time data and actionable insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-based Access Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Role-Based Access Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Owner Dashboard</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View comprehensive sales reports</li>
                <li>• Manage managers and employees</li>
                <li>• Control service categories and pricing</li>
                <li>• Monitor business performance</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manager Dashboard</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create and manage customer bills</li>
                <li>• Process payments and confirmations</li>
                <li>• Assign services to employees</li>
                <li>• Track daily operations</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Employee Dashboard</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View assigned services</li>
                <li>• Track personal performance</li>
                <li>• Access service history</li>
                <li>• Monitor specialties</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Salon?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Moon Salon management system and experience the difference of streamlined operations, better customer
            service, and increased profitability.
          </p>
          <Button size="lg" onClick={() => router.push("/login")}>
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  )
}
