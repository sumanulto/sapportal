/* eslint-disable @typescript-eslint/no-explicit-any */
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

    let stats = {}

    switch (userType) {
      case "student":
        stats = await getStudentStats(Number.parseInt(userId))
        break
      case "teacher":
        stats = await getTeacherStats(Number.parseInt(userId))
        break
      case "faculty":
        stats = await getFacultyStats(Number.parseInt(userId))
        break
      case "admin":
        stats = await getAdminStats()
        break
      default:
        return NextResponse.json({ message: "Invalid user type" }, { status: 400 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function getStudentStats(studentId: number) {
  // Get attendance percentage
  const [attendanceRows] = await pool.execute(
    `SELECT 
       COUNT(*) as total_classes,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_classes
     FROM attendance 
     WHERE student_id = ? AND attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [studentId],
  )
  const attendance = attendanceRows as any[]
  const attendancePercentage =
    attendance[0].total_classes > 0
      ? Math.round((attendance[0].present_classes / attendance[0].total_classes) * 100)
      : 0

  // Get GPA
  const [gradeRows] = await pool.execute(
    `SELECT AVG(gpa_points) as gpa 
     FROM enrollments 
     WHERE student_id = ? AND gpa_points IS NOT NULL`,
    [studentId],
  )
  const grades = gradeRows as any[]
  const gpa = grades[0].gpa ? Number.parseFloat(grades[0].gpa).toFixed(1) : "0.0"

  // Get pending assignments
  const [assignmentRows] = await pool.execute(
    `SELECT COUNT(*) as pending_assignments
     FROM assignments a
     JOIN enrollments e ON a.course_id = e.course_id
     LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
     WHERE e.student_id = ? AND s.id IS NULL AND a.due_date > NOW()`,
    [studentId, studentId],
  )
  const assignments = assignmentRows as any[]

  // Get fees due
  const [feeRows] = await pool.execute(
    `SELECT SUM(amount) as total_due
     FROM fee_payments 
     WHERE student_id = ? AND status = 'pending'`,
    [studentId],
  )
  const fees = feeRows as any[]

  return {
    attendance: attendancePercentage,
    gpa: Number.parseFloat(gpa),
    assignments: assignments[0].pending_assignments,
    fees: fees[0].total_due || 0,
  }
}

async function getTeacherStats(teacherId: number) {
  // Get number of classes
  const [classRows] = await pool.execute(
    `SELECT COUNT(*) as total_classes FROM courses WHERE teacher_id = ? AND is_active = 1`,
    [teacherId],
  )
  const classes = classRows as any[]

  // Get total students
  const [studentRows] = await pool.execute(
    `SELECT COUNT(DISTINCT e.student_id) as total_students
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE c.teacher_id = ? AND e.status = 'enrolled'`,
    [teacherId],
  )
  const students = studentRows as any[]

  // Get assignments to grade
  const [assignmentRows] = await pool.execute(
    `SELECT COUNT(*) as assignments_to_grade
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     WHERE a.teacher_id = ? AND s.points_earned IS NULL`,
    [teacherId],
  )
  const assignments = assignmentRows as any[]

  // Get average attendance
  const [attendanceRows] = await pool.execute(
    `SELECT AVG(
       CASE WHEN status = 'present' THEN 100 ELSE 0 END
     ) as avg_attendance
     FROM attendance att
     JOIN courses c ON att.course_id = c.id
     WHERE c.teacher_id = ? AND att.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [teacherId],
  )
  const attendance = attendanceRows as any[]

  return {
    classes: classes[0].total_classes,
    students: students[0].total_students,
    assignments: assignments[0].assignments_to_grade,
    attendance: Math.round(attendance[0].avg_attendance || 0),
  }
}

async function getFacultyStats(facultyId: number) {
  // Get departments count
  const [deptRows] = await pool.execute(`SELECT COUNT(*) as total_departments FROM departments WHERE head_id = ?`, [
    facultyId,
  ])
  const departments = deptRows as any[]

  // Get teachers count
  const [teacherRows] = await pool.execute(
    `SELECT COUNT(*) as total_teachers 
     FROM users u
     JOIN courses c ON u.id = c.teacher_id
     JOIN departments d ON c.department_id = d.id
     WHERE d.head_id = ? AND u.user_type = 'teacher'`,
    [facultyId],
  )
  const teachers = teacherRows as any[]

  // Get students count
  const [studentRows] = await pool.execute(
    `SELECT COUNT(DISTINCT e.student_id) as total_students
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN departments d ON c.department_id = d.id
     WHERE d.head_id = ?`,
    [facultyId],
  )
  const students = studentRows as any[]

  // Get courses count
  const [courseRows] = await pool.execute(
    `SELECT COUNT(*) as total_courses
     FROM courses c
     JOIN departments d ON c.department_id = d.id
     WHERE d.head_id = ? AND c.is_active = 1`,
    [facultyId],
  )
  const courses = courseRows as any[]

  return {
    departments: departments[0].total_departments,
    teachers: teachers[0].total_teachers,
    students: students[0].total_students,
    courses: courses[0].total_courses,
  }
}

async function getAdminStats() {
  // Get total users
  const [userRows] = await pool.execute(`SELECT COUNT(*) as total_users FROM users WHERE is_active = 1`)
  const users = userRows as any[]

  // Get active users (logged in last 30 days)
  const [activeRows] = await pool.execute(
    `SELECT COUNT(DISTINCT user_id) as active_users 
     FROM user_sessions 
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  )
  const active = activeRows as any[]

  // Get departments count
  const [deptRows] = await pool.execute(`SELECT COUNT(*) as total_departments FROM departments`)
  const departments = deptRows as any[]

  // Get revenue (total fees collected)
  const [revenueRows] = await pool.execute(
    `SELECT SUM(amount) as total_revenue 
     FROM fee_payments 
     WHERE status = 'paid' AND payment_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)`,
  )
  const revenue = revenueRows as any[]

  return {
    totalUsers: users[0].total_users,
    activeUsers: active[0].active_users || 0,
    departments: departments[0].total_departments,
    revenue: revenue[0].total_revenue || 0,
  }
}
