"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Moon } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("Attempting login with:", username)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        console.log("Login successful, storing token and user data")
        localStorage.setItem("moon_salon_token", data.token)
        localStorage.setItem("moon_salon_user", JSON.stringify(data.user))

        // Redirect based on role
        if (data.user.role === "owner") {
          router.push("/dashboard/owner")
        } else if (data.user.role === "manager") {
          router.push("/dashboard/manager")
        } else {
          router.push("/dashboard/employee")
        }
      } else {
        console.error("Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <Moon className="h-10 w-10 text-yellow-300 mr-2" />
            <h1 className="text-3xl font-bold">Moon Kids Salon</h1>
          </div>
          <CardTitle className="text-xl">Welcome Back!</CardTitle>
          <CardDescription className="text-pink-100">Sign in to manage our magical salon</CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-purple-700 font-semibold">
                Username or Email
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username or email"
                className="border-2 border-pink-200 focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-700 font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border-2 border-pink-200 focus:border-purple-400"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-105"
              disabled={loading}
            >
              {loading ? "Signing in..." : "✨ Sign In ✨"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
            <p className="text-purple-700 font-semibold">🎈 Demo Credentials 🎈</p>
            <p className="text-pink-600">
              <strong>Owner:</strong> owner / password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
