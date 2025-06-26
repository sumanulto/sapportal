import 'dotenv/config';
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

// Validate that all required environment variables are set
if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    console.error("Error: Missing database configuration.");
    console.error("Please ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set in your .env file or environment.");
    process.exit(1); // Exit with an error code
}

async function seedAdmin() {
  let connection

  try {
    connection = await mysql.createConnection(dbConfig)
    console.log("Connected to MySQL database")

    const [existingAdmin] = await connection.execute("SELECT id FROM users WHERE email = ? AND user_type = ?", [
      "admin@sap.edu",
      "admin",
    ])

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    await connection.execute(
      `INSERT INTO users (name, email, password, user_type, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      ["System Administrator", "admin@sap.edu", hashedPassword, "admin", true],
    )

    console.log("Admin user created successfully")
    console.log("Email: admin@sap.edu")
    console.log("Password: admin123")

    // Create sample users for testing
    const sampleUsers = [
      {
        name: "John Student",
        email: "student@sap.edu",
        password: await bcrypt.hash("student123", 12),
        user_type: "student",
      },
      {
        name: "Jane Teacher",
        email: "teacher@sap.edu",
        password: await bcrypt.hash("teacher123", 12),
        user_type: "teacher",
      },
      {
        name: "Dr. Faculty",
        email: "faculty@sap.edu",
        password: await bcrypt.hash("faculty123", 12),
        user_type: "faculty",
      },
    ]

    for (const user of sampleUsers) {
      const [existingUser] = await connection.execute("SELECT id FROM users WHERE email = ?", [user.email]);
      if (existingUser.length === 0) {
          await connection.execute(
            `INSERT INTO users (name, email, password, user_type, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.name, user.email, user.password, user.user_type, true],
          )
      }
    }

    console.log("Sample users created or verified successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Database connection closed.")
    }
  }
}

seedAdmin()