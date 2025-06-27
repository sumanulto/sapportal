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

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Get GPA and credits
    const [gpaRows] = await pool.execute(
      `SELECT 
         AVG(gpa_points) as current_gpa,
         SUM(c.credits) as total_credits,
         COUNT(DISTINCT e.course_id) as completed_courses
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ? AND e.gpa_points IS NOT NULL`,
      [userId],
    )

    const stats = (gpaRows as any[])[0]

    return NextResponse.json({
      stats: {
        currentGPA: stats.current_gpa || 0,
        totalCredits: stats.total_credits || 0,
        completedCourses: stats.completed_courses || 0,
      },
    })
  } catch (error) {
    console.error("GPA stats API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
