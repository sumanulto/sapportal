import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/mysql"
import { verifyToken } from "@/lib/auth"
import validator from "validator"
import bcrypt from "bcryptjs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyToken(request)
    if (!session || session.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    const data = await request.json()

    const fields: string[] = []
    const values: any[] = []

    if (data.name) {
      fields.push("name = ?")
      values.push(data.name)
    }

    if (data.email) {
      if (!validator.isEmail(data.email)) {
        return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
      }
      fields.push("email = ?")
      values.push(data.email)
    }

    if (data.userType) {
      if (!["student", "teacher", "faculty", "admin"].includes(data.userType)) {
        return NextResponse.json({ message: "Invalid user type" }, { status: 400 })
      }
      fields.push("user_type = ?")
      values.push(data.userType)
    }

    if (data.phone !== undefined) {
      fields.push("phone = ?")
      values.push(data.phone)
    }

    if (data.address !== undefined) {
      fields.push("address = ?")
      values.push(data.address)
    }

    if (data.dateOfBirth !== undefined) {
      fields.push("date_of_birth = ?")
      values.push(data.dateOfBirth)
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 })
    }

    values.push(userId)
    await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyToken(request)
    if (!session || session.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    await pool.execute(`DELETE FROM users WHERE id = ?`, [userId])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
