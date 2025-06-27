import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import pool from "@/lib/mysql"
import { verifyToken, generateSecurePassword } from "@/lib/auth"
import { generateRollNumber, getCourseOptions, getDepartmentOptions } from "@/lib/roll-number"
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

    // Check if requesting options
    if (searchParams.get("options") === "true") {
      const courses = await getCourseOptions()
      const departments = await getDepartmentOptions()
      return NextResponse.json({ courses, departments })
    }

    let query = `
      SELECT u.id, u.roll_number, u.name, u.email, u.user_type, u.is_active, u.created_at,
             cc.course_name, cc.course_code,
             dc.department_name, dc.department_code
      FROM users u
      LEFT JOIN course_codes cc ON u.course_id = cc.id
      LEFT JOIN department_codes dc ON u.department_id = dc.id
    `
    const params: any[] = []

    if (userType && userType !== "all") {
      query += " WHERE u.user_type = ?"
      params.push(userType)
    }

    query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await pool.execute(query, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM users u"
    const countParams: any[] = []

    if (userType && userType !== "all") {
      countQuery += " WHERE u.user_type = ?"
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

    const { name, email, userType, phone, address, dateOfBirth, courseId, departmentId } = await request.json()

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

    // Validate course/department requirements
    if (userType === "student" && !courseId) {
      return NextResponse.json({ message: "Course is required for students" }, { status: 400 })
    }

    if (["teacher", "faculty", "admin"].includes(userType) && !departmentId) {
      return NextResponse.json({ message: "Department is required for staff members" }, { status: 400 })
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Generate roll number
    const rollNumber = await generateRollNumber(
      userType,
      userType === "student" ? courseId : undefined,
      userType !== "student" ? departmentId : undefined,
    )

    // Generate secure password
    const password = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with UUID
    const [result] = await pool.execute(
      `INSERT INTO users (id, roll_number, name, email, password, user_type, course_id, department_id, phone, address, date_of_birth, is_active) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rollNumber,
        name,
        email,
        hashedPassword,
        userType,
        userType === "student" ? courseId : null,
        userType !== "student" ? departmentId : null,
        phone || null,
        address || null,
        dateOfBirth || null,
        true,
      ],
    )

    // Get the created user
    const [createdUser] = await pool.execute(
      `SELECT u.id, u.roll_number, u.name, u.email, u.user_type,
              cc.course_name, dc.department_name
       FROM users u
       LEFT JOIN course_codes cc ON u.course_id = cc.id
       LEFT JOIN department_codes dc ON u.department_id = dc.id
       WHERE u.roll_number = ?`,
      [rollNumber],
    )

    const user = (createdUser as any[])[0]

    return NextResponse.json({
      message: "User created successfully",
      user: {
        ...user,
        temporaryPassword: password,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
