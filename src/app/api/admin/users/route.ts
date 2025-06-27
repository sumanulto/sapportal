import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import pool from "@/lib/mysql"
import { verifyToken, generateSecurePassword } from "@/lib/auth"
import validator from "validator"

export async function GET(request: NextRequest) {
  try {
    const session = await verifyToken(request)
    if (!session || session.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("userType")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = "SELECT id, name, email, user_type, is_active, created_at FROM users"
    const params: any[] = []

    if (userType && userType !== "all") {
      query += " WHERE user_type = ?"
      params.push(userType)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await pool.execute(query, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM users"
    const countParams: any[] = []

    if (userType && userType !== "all") {
      countQuery += " WHERE user_type = ?"
      countParams.push(userType)
    }

    const [countRows] = await pool.execute(countQuery, countParams)
    const total = (countRows as any[])[0].total

    return NextResponse.json({
      users: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyToken(request)
    if (!session || session.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, userType, phone, address, dateOfBirth } = await request.json()

    // Validate input
    if (!name || !email || !userType) {
      return NextResponse.json({ message: "Name, email, and user type are required" }, { status: 400 })
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (!["student", "teacher", "faculty", "admin"].includes(userType)) {
      return NextResponse.json({ message: "Invalid user type" }, { status: 400 })
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Generate secure password
    const password = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, user_type, phone, address, date_of_birth, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, userType, phone || null, address || null, dateOfBirth || null, true],
    )

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: (result as any).insertId,
        name,
        email,
        userType,
        temporaryPassword: password,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
