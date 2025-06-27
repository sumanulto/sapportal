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

    let courses = []

    switch (userType) {
      case "student":
        courses = await getStudentCourses(Number.parseInt(userId))
        break
      case "teacher":
        courses = await getTeacherCourses(Number.parseInt(userId))
        break
      case "faculty":
      case "admin":
        courses = await getAllCourses()
        break
      default:
        return NextResponse.json({ message: "Invalid user type" }, { status: 400 })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function getStudentCourses(studentId: number) {
  const [rows] = await pool.execute(
    `SELECT 
       c.id, c.name, c.code, c.description, c.credits, c.semester, c.academic_year,
       u.name as teacher_name,
       d.name as department_name,
       e.grade, e.gpa_points, e.status as enrollment_status
     FROM courses c
     JOIN enrollments e ON c.id = e.course_id
     LEFT JOIN users u ON c.teacher_id = u.id
     LEFT JOIN departments d ON c.department_id = d.id
     WHERE e.student_id = ? AND c.is_active = 1
     ORDER BY c.semester DESC, c.name`,
    [studentId],
  )
  return rows
}

async function getTeacherCourses(teacherId: number) {
  const [rows] = await pool.execute(
    `SELECT 
       c.id, c.name, c.code, c.description, c.credits, c.semester, c.academic_year,
       d.name as department_name,
       COUNT(e.student_id) as student_count
     FROM courses c
     LEFT JOIN departments d ON c.department_id = d.id
     LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
     WHERE c.teacher_id = ? AND c.is_active = 1
     GROUP BY c.id
     ORDER BY c.semester DESC, c.name`,
    [teacherId],
  )
  return rows
}

async function getAllCourses() {
  const [rows] = await pool.execute(
    `SELECT 
       c.id, c.name, c.code, c.description, c.credits, c.semester, c.academic_year,
       u.name as teacher_name,
       d.name as department_name,
       COUNT(e.student_id) as student_count
     FROM courses c
     LEFT JOIN users u ON c.teacher_id = u.id
     LEFT JOIN departments d ON c.department_id = d.id
     LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
     WHERE c.is_active = 1
     GROUP BY c.id
     ORDER BY c.semester DESC, c.name`,
  )
  return rows
}
