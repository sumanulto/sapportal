import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userType = searchParams.get("userType")

    if (!userId || !userType) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    let assignments = []

    switch (userType) {
      case "student":
        assignments = await getStudentAssignments(Number.parseInt(userId))
        break
      case "teacher":
        assignments = await getTeacherAssignments(Number.parseInt(userId))
        break
      case "faculty":
      case "admin":
        assignments = await getAllAssignments()
        break
      default:
        return NextResponse.json({ message: "Invalid user type" }, { status: 400 })
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Assignments API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function getStudentAssignments(studentId: number) {
  const [rows] = await pool.execute(
    `SELECT 
       a.id, a.title, a.description, a.due_date, a.max_points, a.assignment_type,
       c.name as course_name, c.code as course_code,
       s.points_earned, s.submitted_at, s.status as submission_status,
       s.feedback
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     JOIN enrollments e ON c.id = e.course_id
     LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
     WHERE e.student_id = ? AND a.is_published = 1
     ORDER BY a.due_date ASC`,
    [studentId, studentId],
  )
  return rows
}

async function getTeacherAssignments(teacherId: number) {
  const [rows] = await pool.execute(
    `SELECT 
       a.id, a.title, a.description, a.due_date, a.max_points, a.assignment_type,
       c.name as course_name, c.code as course_code,
       COUNT(s.id) as submission_count,
       COUNT(CASE WHEN s.points_earned IS NOT NULL THEN 1 END) as graded_count
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     LEFT JOIN submissions s ON a.id = s.assignment_id
     WHERE a.teacher_id = ?
     GROUP BY a.id
     ORDER BY a.due_date DESC`,
    [teacherId],
  )
  return rows
}

async function getAllAssignments() {
  const [rows] = await pool.execute(
    `SELECT 
       a.id, a.title, a.description, a.due_date, a.max_points, a.assignment_type,
       c.name as course_name, c.code as course_code,
       u.name as teacher_name,
       COUNT(s.id) as submission_count
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     JOIN users u ON a.teacher_id = u.id
     LEFT JOIN submissions s ON a.id = s.assignment_id
     WHERE a.is_published = 1
     GROUP BY a.id
     ORDER BY a.due_date DESC`,
  )
  return rows
}
