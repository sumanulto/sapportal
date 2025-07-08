# 🎓 SAP Portal - Student Academic Portal (Under Development)

A comprehensive academic management system built with **Next.js 15**, **MySQL**, **JWT Authentication**, and **DaisyUI**. This portal serves students, teachers, faculty, and administrators with role-based access and features.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat-square&logo=next.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=flat-square&logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4.6.0-5A0EF8?style=flat-square&logo=daisyui)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [User Roles & Permissions](#-user-roles--permissions)
- [Roll Number System](#-roll-number-system)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with HTTP-only cookies
- Rate limiting for API endpoints
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Admin-only user creation

### 👥 **User Management**
- Four user types: Student, Teacher, Faculty, Admin
- UUID-based primary keys
- Unique roll number system
- Profile management with personal information

### 📚 **Academic Features**
- Course management and enrollment
- Assignment creation and submission
- Grade tracking and GPA calculation
- Attendance monitoring
- Fee payment tracking

### 🎨 **UI/UX**
- Responsive design with Tailwind CSS v4
- Multiple theme support (Default, Night, Forest, Lemonade, Nord)
- Modern component library with DaisyUI
- Intuitive dashboard for each user type

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, DaisyUI |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MySQL 8.0+ |
| **Authentication** | JWT (jose), bcryptjs |
| **Security** | Rate limiting, Input validation |
| **Icons** | Lucide React |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sap-portal.git
cd sap-portal
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### 🌐 Example `.env` File

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sap_portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🗄️ Database Setup

### Option 1: Automated Setup (Under Progress)

```bash
# Setup database and seed data in one command
npm run setup
```

### Option 2: Manual Setup (Under Progress)

```bash
# 1. Create database and tables
npm run db:setup

# 2. Seed with sample data
npm run db:seed

# 3. Reset everything (drop and recreate)
npm run db:reset
```

### Manual MySQL Setup

If you prefer manual setup:

```sql
-- 1. Create database
CREATE DATABASE sap_portal;

-- 2. Run the schema
mysql -u root -p sap_portal < scripts/database-schema.sql
or
go to database and paste the code directly

-- 3. Run the seed script
node scripts/seed-admin-uuid.js
```

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🔗 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/auth/signin` | User login | Public |
| `POST` | `/api/auth/logout` | User logout | Authenticated |

**Sign In Request:**
```json
{
  "email": "admin@sap.edu",
  "password": "admin123",
  "userType": "admin"
}
```

### 👥 User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/admin/users` | Get all users | Admin |
| `POST` | `/api/admin/users` | Create new user | Admin |
| `PUT` | `/api/profile/update` | Update profile | Authenticated |

**Create User Request:**
```json
{
  "name": "John Doe",
  "email": "john@sap.edu",
  "userType": "student",
  "courseId": 1,
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "dateOfBirth": "2000-01-01"
}
```

### 📊 Dashboard & Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/dashboard/stats` | Get dashboard statistics | Authenticated |
| `GET` | `/api/courses` | Get courses by user type | Authenticated |
| `GET` | `/api/assignments` | Get assignments | Authenticated |

### 🎓 Student-Specific

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/student/grades` | Get student grades | Student |
| `GET` | `/api/student/gpa-stats` | Get GPA statistics | Student |
| `GET` | `/api/student/attendance` | Get attendance records | Student |
| `GET` | `/api/student/attendance-stats` | Get attendance statistics | Student |

### Query Parameters

**Dashboard Stats:**
```
GET /api/dashboard/stats?userId=123&userType=student
```

**Courses:**
```
GET /api/courses?userId=123&userType=teacher
```

**Grades with Filters:**
```
GET /api/student/grades?userId=123&semester=current
```

## 👤 User Roles & Permissions

### 🎓 Student
- View personal dashboard with GPA, attendance, assignments
- Access enrolled courses and grades
- Submit assignments
- View attendance records
- Update personal profile

### 👨‍🏫 Teacher
- Manage assigned courses and students
- Create and grade assignments
- Mark attendance
- View class analytics
- Generate reports

### 👨‍💼 Faculty
- Oversee department operations
- Manage courses and faculty
- Access department analytics
- Academic calendar management

### 🔧 Admin
- **Full system access**
- Create and manage all users
- System configuration
- Financial management
- Security settings
- Database administration

## 🎯 Roll Number System

The system uses a unique roll number format for user identification:

### Format Structure

| User Type | Format | Example | Length |
|-----------|--------|---------|---------|
| **Student** | `YYYY + Course Code + Serial` | `2025070001` | 10 chars |
| **Admin** | `YYYY + Dept Code + A + Serial` | `2025248A001` | 11 chars |
| **Faculty** | `YYYY + Dept Code + F + Serial` | `2025248F001` | 11 chars |
| **Teacher** | `YYYY + Dept Code + T + Serial` | `2025248T001` | 11 chars |

### Examples

```
Student (CS): 2025070001
├── 2025: Year
├── 070: Computer Science course code
└── 001: Serial number

Admin (CSD): 2025248A001
├── 2025: Year
├── 248: Computer Science Department code
├── A: Admin type letter
└── 001: Serial number
```

## 🧪 Testing

### Default Login Credentials

| Role | Email | Password | Roll Number |
|------|-------|----------|-------------|
| **Admin** | admin@sap.edu | admin123 | 2025001A001 |
| **Faculty** | faculty@sap.edu | faculty123 | 2025248F001 |
| **Teacher** | teacher@sap.edu | teacher123 | 2025248T001 |
| **Student** | student@sap.edu | student123 | 2025070001 |

### Testing Workflow

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Test Authentication:**
   - Visit `http://localhost:3000/signin`
   - Try different user types
   - Verify role-based redirects

3. **Test API Endpoints:**
   ```bash
   # Test sign in
   curl -X POST http://localhost:3000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sap.edu","password":"admin123","userType":"admin"}'

   # Test protected endpoint (with session cookie)
   curl -X GET http://localhost:3000/api/dashboard/stats?userId=123&userType=admin \
     -H "Cookie: session=your-jwt-token"
   ```

4. **Test User Creation (Admin only):**
   - Login as admin
   - Go to User Management
   - Create users of different types
   - Verify roll number generation

### Database Testing

```bash
# Check database connection
mysql -u root -p -e "USE sap_portal; SHOW TABLES;"

# Verify sample data
mysql -u root -p -e "USE sap_portal; SELECT roll_number, name, user_type FROM users;"

# Check roll number counters
mysql -u root -p -e "USE sap_portal; SELECT * FROM roll_number_counters;"
```

## 📁 Project Structure

```
sap-portal/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   ├── 📁 admin/                # Admin-only endpoints
│   │   ├── 📁 student/              # Student-specific endpoints
│   │   └── 📁 dashboard/            # Dashboard data endpoints
│   ├── 📁 dashboard/                # Dashboard pages
│   │   ├── 📄 layout.tsx            # Dashboard layout
│   │   ├── 📄 page.tsx              # Main dashboard
│   │   ├── 📁 profile/              # Profile management
│   │   ├── 📁 courses/              # Course pages
│   │   ├── 📁 assignments/          # Assignment pages
│   │   ├── 📁 grades/               # Grade pages (students)
│   │   ├── 📁 attendance/           # Attendance pages
│   │   └── 📁 users/                # User management (admin)
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Landing page
│   ├── 📄 signin/page.tsx           # Sign in page
│   └── 📄 globals.css               # Global styles (Tailwind + DaisyUI)
├── 📁 components/                   # Reusable components
│   ├── 📄 header.tsx                # Navigation header
│   ├── 📄 sidebar.tsx               # Dashboard sidebar
│   ├── 📄 theme-provider.tsx        # Theme management
│   └── 📄 theme-toggle.tsx          # Theme switcher
├── 📁 lib/                          # Utility libraries
│   ├── 📄 mysql.ts                  # Database connection
│   ├── 📄 auth.ts                   # JWT utilities
│   ├── 📄 rate-limit.ts             # Rate limiting
│   └── 📄 roll-number.ts            # Roll number generation
├── 📁 scripts/                      # Database scripts
│   ├── 📄 schema.sql                # Database schema
│   └── 📄 seed.js                   # Sample data seeding
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tailwind.config.ts            # Tailwind configuration
├── 📄 postcss.config.js             # PostCSS configuration
├── 📄 next.config.mjs               # Next.js configuration
├── 📄 .env.example                  # Environment template
└── 📄 README.md                     # This file
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Ensure MySQL is running: `sudo systemctl start mysql`
- Check credentials in `.env.local`
- Verify database exists: `SHOW DATABASES;`

#### 2. JWT Secret Error
```bash
Error: JWT secret is required
```
**Solution:**
- Add `JWT_SECRET` to `.env.local`
- Use a strong, random secret key
- Restart the development server

#### 3. Roll Number Generation Error
```bash
Error: Course ID is required for student roll number generation
```
**Solution:**
- Ensure course codes are seeded: `npm run db:seed`
- Check course_codes table has data
- Verify courseId is provided for students

#### 4. Permission Denied Error
```bash
Error: Unauthorized
```
**Solution:**
- Check user role permissions
- Verify JWT token is valid
- Ensure session cookie is set

#### 5. Styling Issues
```bash
Styles not loading correctly
```
**Solution:**
- Clear Next.js cache: `rm -rf .next`
- Restart development server
- Check Tailwind CSS configuration

### Debug Mode

Enable debug logging:

```env
# Add to .env.local
DEBUG=true
NODE_ENV=development
```

### Database Reset

If you encounter database issues:

```bash
# Complete reset
npm run db:reset

# Or manual reset
mysql -u root -p -e "DROP DATABASE IF EXISTS sap_portal;"
npm run setup
```

## 📞 Support

If you encounter any issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/sumanulto/sap-portal/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots (if applicable)


## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **DaisyUI** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **MySQL** for the reliable database system

---

**Built with ❤️ by Kraftamine**

*Happy Coding! 🚀*
