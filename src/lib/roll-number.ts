import pool from "./mysql"

export async function generateRollNumber(
  userType: "student" | "teacher" | "faculty" | "admin",
  courseId?: number,
  departmentId?: number,
): Promise<string> {
  const currentYear = new Date().getFullYear()

  if (userType === "student") {
    if (!courseId) {
      throw new Error("Course ID is required for student roll number generation")
    }

    // Get course number
    const [courseRows] = await pool.execute("SELECT course_number FROM course_codes WHERE id = ?", [courseId])
    const courses = courseRows as any[]

    if (courses.length === 0) {
      throw new Error("Invalid course ID")
    }

    const courseNumber = courses[0].course_number

    // Get or create counter
    const [counterRows] = await pool.execute(
      `SELECT counter FROM roll_number_counters 
       WHERE year = ? AND course_number = ? AND user_type = 'student'`,
      [currentYear, courseNumber],
    )

    let counter = 1
    if ((counterRows as any[]).length > 0) {
      counter = (counterRows as any[])[0].counter + 1
    }

    // Update counter
    await pool.execute(
      `INSERT INTO roll_number_counters (year, course_number, user_type, counter) 
       VALUES (?, ?, 'student', ?) 
       ON DUPLICATE KEY UPDATE counter = ?, updated_at = NOW()`,
      [currentYear, courseNumber, counter, counter],
    )

    // Format: YYYY + course_number + serial_number (3 digits)
    return `${currentYear}${courseNumber}${counter.toString().padStart(3, "0")}`
  } else {
    // For faculty, teacher, admin
    if (!departmentId) {
      throw new Error("Department ID is required for staff roll number generation")
    }

    // Get department number
    const [deptRows] = await pool.execute("SELECT department_number FROM department_codes WHERE id = ?", [departmentId])
    const departments = deptRows as any[]

    if (departments.length === 0) {
      throw new Error("Invalid department ID")
    }

    const departmentNumber = departments[0].department_number

    // Get or create counter
    const [counterRows] = await pool.execute(
      `SELECT counter FROM roll_number_counters 
       WHERE year = ? AND department_number = ? AND user_type = ?`,
      [currentYear, departmentNumber, userType],
    )

    let counter = 1
    if ((counterRows as any[]).length > 0) {
      counter = (counterRows as any[])[0].counter + 1
    }

    // Update counter
    await pool.execute(
      `INSERT INTO roll_number_counters (year, department_number, user_type, counter) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE counter = ?, updated_at = NOW()`,
      [currentYear, departmentNumber, userType, counter, counter],
    )

    // Get user type letter
    const userTypeLetter: { [key: string]: string } = {
      admin: "A",
      faculty: "F",
      teacher: "T",
    }

    // Format: YYYY + department_number + user_type_letter + serial_number (3 digits)
    return `${currentYear}${departmentNumber}${userTypeLetter[userType]}${counter.toString().padStart(3, "0")}`
  }
}

export async function getCourseOptions() {
  const [rows] = await pool.execute("SELECT id, course_name, course_code FROM course_codes ORDER BY course_name")
  return rows
}

export async function getDepartmentOptions() {
  const [rows] = await pool.execute(
    "SELECT id, department_name, department_code FROM department_codes ORDER BY department_name",
  )
  return rows
}
