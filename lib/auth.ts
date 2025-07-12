import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "moon-salon-secret"

export interface User {
  id: number
  username: string
  email: string
  role: "owner" | "manager" | "employee"
  full_name: string
  phone?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    console.log("Attempting to authenticate user:", username)

    const users = (await executeQuery("SELECT * FROM users WHERE username = ? OR email = ?", [
      username,
      username,
    ])) as any[]

    console.log("Found users:", users.length)

    if (users.length === 0) {
      console.log("No user found with username/email:", username)
      return null
    }

    const user = users[0]
    console.log("User found:", user.username, "Role:", user.role)

    // For development, allow simple password comparison
    let isValid = false

    try {
      if (user.password.startsWith("$2b$")) {
        // Hashed password
        console.log("Verifying hashed password")
        isValid = await verifyPassword(password, user.password)
      } else {
        // Plain text password (for development only)
        console.log("Comparing plain text password")
        isValid = password === user.password
      }
    } catch (error) {
      console.error("Password verification error:", error)
      // Fallback to plain text comparison
      isValid = password === user.password
    }

    console.log("Password valid:", isValid)

    if (!isValid) return null

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
