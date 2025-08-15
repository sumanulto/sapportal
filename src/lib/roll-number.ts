import pool from "./mysql"

// Generate roll number
export async function generateRollNumber(
  userType: "student" | "teacher" | "faculty" | "admin",
  courseId?: number,
  departmentId?: number,
): Promise<string> {
  const currentYear = new Date().getFullYear()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    if (userType === "student") {
      if (!courseId) throw new Error("Course ID is required for student roll number generation")

      // Get course number
      const [courseRows] = await conn.query(
        "SELECT course_number FROM course_codes WHERE id = ?",
        [courseId]
      )
      const courses = courseRows as any[]
      if (courses.length === 0) throw new Error("Invalid course ID")
      const courseNumber = courses[0].course_number

      // Lock the counter row
      const [counterRows] = await conn.query(
        `SELECT counter FROM roll_number_counters 
         WHERE year = ? AND course_number = ? AND user_type = 'student' 
         FOR UPDATE`,
        [currentYear, courseNumber]
      )

      let counter = 1
      if ((counterRows as any[]).length > 0) {
        counter = (counterRows as any[])[0].counter + 1
        await conn.query(
          `UPDATE roll_number_counters 
           SET counter = ?, updated_at = NOW() 
           WHERE year = ? AND course_number = ? AND user_type = 'student'`,
          [counter, currentYear, courseNumber]
        )
      } else {
        await conn.query(
          `INSERT INTO roll_number_counters (year, course_number, user_type, counter) 
           VALUES (?, ?, 'student', ?)`,
          [currentYear, courseNumber, counter]
        )
      }

      await conn.commit()
      return `${currentYear}${courseNumber}${counter.toString().padStart(4, "0")}`

    } else {
      // Staff: teacher, faculty, admin
      if (!departmentId) throw new Error("Department ID is required for staff roll number generation")

      // Get department number
      const [deptRows] = await conn.query(
        "SELECT department_number FROM department_codes WHERE id = ?",
        [departmentId]
      )
      const departments = deptRows as any[]
      if (departments.length === 0) throw new Error("Invalid department ID")
      const departmentNumber = departments[0].department_number

      // Lock the counter row
      const [counterRows] = await conn.query(
        `SELECT counter FROM roll_number_counters 
         WHERE year = ? AND department_number = ? AND user_type = ? 
         FOR UPDATE`,
        [currentYear, departmentNumber, userType]
      )

      let counter = 1
      if ((counterRows as any[]).length > 0) {
        counter = (counterRows as any[])[0].counter + 1
        await conn.query(
          `UPDATE roll_number_counters 
           SET counter = ?, updated_at = NOW() 
           WHERE year = ? AND department_number = ? AND user_type = ?`,
          [counter, currentYear, departmentNumber, userType]
        )
      } else {
        await conn.query(
          `INSERT INTO roll_number_counters (year, department_number, user_type, counter) 
           VALUES (?, ?, ?, ?)`,
          [currentYear, departmentNumber, userType, counter]
        )
      }

      await conn.commit()

      const userTypeLetter: { [key: string]: string } = {
        admin: "A",
        faculty: "F",
        teacher: "T",
      }
      return `${currentYear}${departmentNumber}${userTypeLetter[userType]}${counter.toString().padStart(3, "0")}`
    }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// Fetch all courses for dropdown
export async function getCourseOptions() {
  const [rows] = await pool.execute(
    "SELECT id, course_name, course_code FROM course_codes ORDER BY course_name"
  )
  return rows
}

// Fetch all departments for dropdown
export async function getDepartmentOptions() {
  const [rows] = await pool.execute(
    "SELECT id, department_name, department_code FROM department_codes ORDER BY department_name"
  )
  return rows
}
