import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/mysql"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await verifyToken(request)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const semester = searchParams.get("semester")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    let query = `
      SELECT 
        s.id,
        c.name as course_name,
        c.code as course_code,
        a.title as assignment_title,
        s.points_earned,
        a.max_points,
        ROUND((s.points_earned / a.max_points) * 100, 2) as percentage,
        e.grade,
        s.submitted_at,
        s.graded_at
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id AND e.student_id = s.student_id
      WHERE s.student_id = ? AND s.points_earned IS NOT NULL
    `

    const params = [userId]

    if (semester && semester !== "all") {
      if (semester === "current") {
        query += ` AND c.semester = 'Fall' AND c.academic_year = '2024'`
      } else {
        // Parse semester like "fall2024"
        const year = semester.slice(-4)
        const sem = semester.slice(0, -4)
        query += ` AND c.semester = ? AND c.academic_year = ?`
        params.push(sem.charAt(0).toUpperCase() + sem.slice(1), year)
      }
    }

    query += ` ORDER BY s.graded_at DESC`

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({ grades: rows })
  } catch (error) {
    console.error("Student grades API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
