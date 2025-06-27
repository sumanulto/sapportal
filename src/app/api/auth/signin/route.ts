import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import pool from "@/lib/mysql"
import { encrypt } from "@/lib/auth"
import { applyRateLimit } from "@/lib/rate-limit"
import validator from "validator"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitPassed = await applyRateLimit(request, true)
    if (!rateLimitPassed) {
      return NextResponse.json({ message: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const { email, password, userType } = await request.json()

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Get user from MySQL database with UUID
    const [rows] = await pool.execute(
      `SELECT u.id, u.roll_number, u.name, u.email, u.password, u.user_type, u.is_active,
              cc.course_name, dc.department_name
       FROM users u
       LEFT JOIN course_codes cc ON u.course_id = cc.id
       LEFT JOIN department_codes dc ON u.department_id = dc.id
       WHERE u.email = ? AND u.user_type = ?`,
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

    // Create JWT token
    const token = await encrypt({
      userId: user.id,
      rollNumber: user.roll_number,
      email: user.email,
      userType: user.user_type,
      name: user.name,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: "Sign in successful",
      user: {
        ...userWithoutPassword,
        userType: user.user_type,
      },
    })

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
