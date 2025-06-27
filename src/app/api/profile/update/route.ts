import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/mysql"

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, phone, address, dateOfBirth } = await request.json()

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Update user profile
    await pool.execute(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, email, phone, address, dateOfBirth, userId],
    )

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
