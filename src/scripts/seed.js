// SAP Portal Database Seeding Script
// Creates initial admin user and sample data
// Usage: node scripts/seed.js

import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sap_portal",
}

// Roll number generation function
async function generateRollNumber(connection, userType, courseId = null, departmentId = null) {
  const currentYear = new Date().getFullYear()

  if (userType === "student") {
    if (!courseId) throw new Error("Course ID required for student")

    // Get course number
    const [courseRows] = await connection.execute("SELECT course_number FROM course_codes WHERE id = ?", [courseId])
    if (courseRows.length === 0) throw new Error("Invalid course ID")

    const courseNumber = courseRows[0].course_number

    // Get next counter
    const [counterRows] = await connection.execute(
      "SELECT counter FROM roll_number_counters WHERE year = ? AND course_number = ? AND user_type = 'student'",
      [currentYear, courseNumber],
    )

    let counter = 1
    if (counterRows.length > 0) {
      counter = counterRows[0].counter + 1
    }

    // Update counter
    await connection.execute(
      `INSERT INTO roll_number_counters (year, course_number, user_type, counter) 
       VALUES (?, ?, 'student', ?) 
       ON DUPLICATE KEY UPDATE counter = ?, updated_at = NOW()`,
      [currentYear, courseNumber, counter, counter],
    )

    return `${currentYear}${courseNumber}${counter.toString().padStart(3, "0")}`
  } else {
    // For staff (teacher, faculty, admin)
    if (!departmentId) throw new Error("Department ID required for staff")

    // Get department number
    const [deptRows] = await connection.execute("SELECT department_number FROM department_codes WHERE id = ?", [
      departmentId,
    ])
    if (deptRows.length === 0) throw new Error("Invalid department ID")

    const departmentNumber = deptRows[0].department_number

    // Get next counter
    const [counterRows] = await connection.execute(
      "SELECT counter FROM roll_number_counters WHERE year = ? AND department_number = ? AND user_type = ?",
      [currentYear, departmentNumber, userType],
    )

    let counter = 1
    if (counterRows.length > 0) {
      counter = counterRows[0].counter + 1
    }

    // Update counter
    await connection.execute(
      `INSERT INTO roll_number_counters (year, department_number, user_type, counter) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE counter = ?, updated_at = NOW()`,
      [currentYear, departmentNumber, userType, counter, counter],
    )

    // Get user type letter
    const userTypeLetter = {
      admin: "A",
      faculty: "F",
      teacher: "T",
    }[userType]

    return `${currentYear}${departmentNumber}${userTypeLetter}${counter.toString().padStart(3, "0")}`
  }
}

async function seedDatabase() {
  let connection

  try {
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ Connected to MySQL database")

    // Check if users already exist
    const [existingUsers] = await connection.execute("SELECT COUNT(*) as count FROM users")
    if (existingUsers[0].count > 0) {
      console.log("⚠️  Database already contains users. Skipping seed.")
      return
    }

    console.log("🌱 Starting database seeding...")

    // Get department IDs for staff
    const [adminDept] = await connection.execute("SELECT id FROM department_codes WHERE department_code = 'ADM'")
    const [csDept] = await connection.execute("SELECT id FROM department_codes WHERE department_code = 'CSD'")
    const [engDept] = await connection.execute("SELECT id FROM department_codes WHERE department_code = 'ENG'")

    // Get course ID for student
    const [csCourse] = await connection.execute("SELECT id FROM course_codes WHERE course_code = 'CS'")

    if (adminDept.length === 0 || csDept.length === 0 || csCourse.length === 0) {
      throw new Error("Required departments or courses not found")
    }

    const adminDeptId = adminDept[0].id
    const csDeptId = csDept[0].id
    const engDeptId = engDept[0].id
    const csCourseId = csCourse[0].id

    // Create users with proper roll numbers
    const users = [
      {
        name: "System Administrator",
        email: "admin@sap.edu",
        password: "admin123",
        userType: "admin",
        departmentId: adminDeptId,
        phone: "+1-555-0001",
        address: "123 University Ave, Academic City, AC 12345",
        dateOfBirth: "1985-01-15",
      },
      {
        name: "Dr. John Faculty",
        email: "faculty@sap.edu",
        password: "faculty123",
        userType: "faculty",
        departmentId: csDeptId,
        phone: "+1-555-0002",
        address: "456 Faculty St, Campus Town, CT 67890",
        dateOfBirth: "1980-03-20",
      },
      {
        name: "Prof. Jane Teacher",
        email: "teacher@sap.edu",
        password: "teacher123",
        userType: "teacher",
        departmentId: csDeptId,
        phone: "+1-555-0003",
        address: "789 Teacher Rd, Education City, EC 11111",
        dateOfBirth: "1985-07-10",
      },
      {
        name: "Alice Student",
        email: "student@sap.edu",
        password: "student123",
        userType: "student",
        courseId: csCourseId,
        phone: "+1-555-0004",
        address: "321 Student Blvd, Learning Town, LT 22222",
        dateOfBirth: "2002-09-15",
      },
      {
        name: "Bob Johnson",
        email: "student2@sap.edu",
        password: "student123",
        userType: "student",
        courseId: csCourseId,
        phone: "+1-555-0005",
        address: "654 Campus Ave, Study City, SC 33333",
        dateOfBirth: "2001-11-25",
      },
    ]

    console.log("👥 Creating users...")

    for (const userData of users) {
      // Generate roll number
      const rollNumber = await generateRollNumber(
        connection,
        userData.userType,
        userData.courseId,
        userData.departmentId,
      )

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Insert user
      await connection.execute(
        `INSERT INTO users (
          id, roll_number, name, email, password, user_type, 
          course_id, department_id, phone, address, date_of_birth, is_active
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rollNumber,
          userData.name,
          userData.email,
          hashedPassword,
          userData.userType,
          userData.courseId || null,
          userData.departmentId || null,
          userData.phone,
          userData.address,
          userData.dateOfBirth,
          true,
        ],
      )

      console.log(`   ✅ Created ${userData.userType}: ${userData.name} (${rollNumber})`)
    }

    // Create sample departments
    console.log("🏢 Creating departments...")

    const departments = [
      {
        name: "Computer Science Department",
        code: "CS-DEPT",
        description: "Department of Computer Science and Information Technology",
        departmentCodeId: csDeptId,
      },
      {
        name: "Engineering Department",
        code: "ENG-DEPT",
        description: "Department of Engineering Sciences",
        departmentCodeId: engDeptId,
      },
    ]

    for (const dept of departments) {
      await connection.execute(
        "INSERT INTO departments (id, name, code, description, department_code_id) VALUES (UUID(), ?, ?, ?, ?)",
        [dept.name, dept.code, dept.description, dept.departmentCodeId],
      )
      console.log(`   ✅ Created department: ${dept.name}`)
    }

    // Create sample courses
    console.log("📚 Creating courses...")

    // Get department UUIDs
    const [csDeptUUID] = await connection.execute("SELECT id FROM departments WHERE code = 'CS-DEPT'")
    const [engDeptUUID] = await connection.execute("SELECT id FROM departments WHERE code = 'ENG-DEPT'")

    // Get teacher UUID
    const [teacherUUID] = await connection.execute("SELECT id FROM users WHERE email = 'teacher@sap.edu'")

    const courses = [
      {
        name: "Data Structures and Algorithms",
        code: "CS101",
        description: "Introduction to fundamental data structures and algorithms",
        credits: 4,
        departmentId: csDeptUUID[0].id,
        teacherId: teacherUUID[0].id,
        courseCodeId: csCourseId,
        semester: "Fall",
        academicYear: "2024",
      },
      {
        name: "Database Management Systems",
        code: "CS201",
        description: "Design and implementation of database systems",
        credits: 3,
        departmentId: csDeptUUID[0].id,
        teacherId: teacherUUID[0].id,
        courseCodeId: csCourseId,
        semester: "Fall",
        academicYear: "2024",
      },
      {
        name: "Web Development",
        code: "CS301",
        description: "Modern web development technologies and frameworks",
        credits: 3,
        departmentId: csDeptUUID[0].id,
        teacherId: teacherUUID[0].id,
        courseCodeId: csCourseId,
        semester: "Fall",
        academicYear: "2024",
      },
    ]

    for (const course of courses) {
      await connection.execute(
        `INSERT INTO courses (
          id, name, code, description, credits, department_id, teacher_id, 
          course_code_id, semester, academic_year, is_active
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.name,
          course.code,
          course.description,
          course.credits,
          course.departmentId,
          course.teacherId,
          course.courseCodeId,
          course.semester,
          course.academicYear,
          true,
        ],
      )
      console.log(`   ✅ Created course: ${course.name} (${course.code})`)
    }

    // Enroll students in courses
    console.log("📝 Creating enrollments...")

    const [students] = await connection.execute("SELECT id FROM users WHERE user_type = 'student'")
    const [courseList] = await connection.execute("SELECT id FROM courses")

    for (const student of students) {
      for (const course of courseList) {
        await connection.execute(
          "INSERT INTO enrollments (id, student_id, course_id, status) VALUES (UUID(), ?, ?, 'enrolled')",
          [student.id, course.id],
        )
      }
    }
    console.log(`   ✅ Enrolled ${students.length} students in ${courseList.length} courses`)

    // Create sample assignments
    console.log("📋 Creating assignments...")

    const assignments = [
      {
        title: "Array Implementation",
        description: "Implement basic array operations in your preferred programming language",
        courseCode: "CS101",
        maxPoints: 100,
        assignmentType: "homework",
        daysFromNow: 7,
      },
      {
        title: "Database Design Project",
        description: "Design a database schema for a library management system",
        courseCode: "CS201",
        maxPoints: 150,
        assignmentType: "project",
        daysFromNow: 14,
      },
      {
        title: "Responsive Website",
        description: "Create a responsive website using HTML, CSS, and JavaScript",
        courseCode: "CS301",
        maxPoints: 200,
        assignmentType: "project",
        daysFromNow: 21,
      },
    ]

    for (const assignment of assignments) {
      const [course] = await connection.execute("SELECT id FROM courses WHERE code = ?", [assignment.courseCode])
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + assignment.daysFromNow)

      await connection.execute(
        `INSERT INTO assignments (
          id, title, description, course_id, teacher_id, due_date, 
          max_points, assignment_type, is_published
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assignment.title,
          assignment.description,
          course[0].id,
          teacherUUID[0].id,
          dueDate,
          assignment.maxPoints,
          assignment.assignmentType,
          true,
        ],
      )
      console.log(`   ✅ Created assignment: ${assignment.title}`)
    }

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Login Credentials:")
    console.log("┌─────────────────────────────────────────────────────────┐")
    console.log("│ Role    │ Email              │ Password    │ Roll Number │")
    console.log("├─────────────────────────────────────────────────────────┤")

    // Get created users with roll numbers
    const [createdUsers] = await connection.execute(
      "SELECT user_type, email, roll_number FROM users ORDER BY user_type, roll_number",
    )

    const passwords = {
      admin: "admin123",
      faculty: "faculty123",
      teacher: "teacher123",
      student: "student123",
    }

    for (const user of createdUsers) {
      const password = passwords[user.user_type]
      console.log(
        `│ ${user.user_type.padEnd(7)} │ ${user.email.padEnd(18)} │ ${password.padEnd(11)} │ ${user.roll_number.padEnd(11)} │`,
      )
    }
    console.log("└─────────────────────────────────────────────────────────┘")

    console.log("\n📝 Roll Number Format:")
    console.log("• Students: YYYY + Course Code (3 digits) + Serial (3 digits)")
    console.log("  Example: 2025070001 (2025 + CS=070 + 001)")
    console.log("• Staff: YYYY + Department Code (3 digits) + Type Letter + Serial (3 digits)")
    console.log("  Examples: 2025248A001 (Admin), 2025248F001 (Faculty), 2025248T001 (Teacher)")

    console.log("\n🚀 You can now start the application with: npm run dev")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run the seeding
seedDatabase()
