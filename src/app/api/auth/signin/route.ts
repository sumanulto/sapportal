import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import pool from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // Get user from MySQL database
    const [rows] = await pool.execute(
      "SELECT id, name, email, password, user_type, is_active FROM users WHERE email = ? AND user_type = ?",
      [email, userType],
    )

    const users = rows as any[]

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid credentials or user type" }, { status: 401 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ message: "Account is deactivated" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Sign in successful",
      user: {
        ...userWithoutPassword,
        userType: user.user_type,
      },
    })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
