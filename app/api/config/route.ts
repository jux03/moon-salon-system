import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_NAME: process.env.DB_NAME || "moon_salon",
    DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
  }

  return NextResponse.json({
    message: "Configuration check",
    config,
    timestamp: new Date().toISOString(),
  })
}
