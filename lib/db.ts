import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "moon_salon",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

let pool: mysql.Pool

export function getPool() {
  if (!pool) {
    console.log("Creating new database pool with config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
    })
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []) {
  console.log("Executing query:", query.substring(0, 100) + "...")
  console.log("With params:", params)

  const connection = getPool()
  try {
    const [results] = await connection.execute(query, params)
    console.log("Query executed successfully")
    return results
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query was:", query)
    console.error("Params were:", params)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await executeQuery("SELECT 1 as test")
    console.log("Database connection test successful:", result)
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
