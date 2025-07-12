"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Users, Scissors, Receipt, BarChart3, LogOut, Menu, X, Calendar } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  role: "owner" | "manager" | "employee"
  full_name: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("moon_salon_user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("moon_salon_token")
    localStorage.removeItem("moon_salon_user")
    router.push("/login")
  }

  const navigation = [
    ...(user?.role === "owner"
      ? [
          { name: "Dashboard", href: "/dashboard/owner", icon: BarChart3 },
          { name: "Users", href: "/dashboard/owner/users", icon: Users },
          { name: "Services", href: "/dashboard/owner/services", icon: Scissors },
          { name: "Reports", href: "/dashboard/owner/reports", icon: BarChart3 },
        ]
      : []),
    ...(user?.role === "manager"
      ? [
          { name: "Dashboard", href: "/dashboard/manager", icon: BarChart3 },
          { name: "Appointments", href: "/dashboard/manager/appointments", icon: Calendar },
          { name: "New Bill", href: "/dashboard/manager/billing", icon: Receipt },
          { name: "Bills", href: "/dashboard/manager/bills", icon: Receipt },
          { name: "Employees", href: "/dashboard/manager/employees", icon: Users },
        ]
      : []),
    ...(user?.role === "employee"
      ? [
          { name: "Dashboard", href: "/dashboard/employee", icon: BarChart3 },
          { name: "My Schedule", href: "/dashboard/employee/schedule", icon: Calendar },
          { name: "My Bills", href: "/dashboard/employee/bills", icon: Receipt },
        ]
      : []),
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Moon className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-xl font-bold">Moon Salon</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-pink-50 to-purple-50 border-r-4 border-pink-300">
          <div className="flex items-center h-16 px-4 border-b-4 border-pink-300 bg-gradient-to-r from-pink-400 to-purple-400">
            <Moon className="h-8 w-8 text-yellow-300 mr-2" />
            <span className="text-xl font-bold text-white">Moon Kids Salon</span>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-3 text-sm font-medium text-purple-700 rounded-xl hover:bg-pink-100 hover:text-purple-800 transition-all duration-200 hover:scale-105"
              >
                <item.icon className="h-5 w-5 mr-3 text-pink-500" />
                {item.name}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t-4 border-pink-300 bg-gradient-to-r from-pink-100 to-purple-100">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-purple-700">{user.full_name}</p>
                <p className="text-xs text-pink-600 capitalize font-semibold">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-2 border-pink-300 text-purple-700 hover:bg-pink-100 font-semibold bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="w-10"></div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
