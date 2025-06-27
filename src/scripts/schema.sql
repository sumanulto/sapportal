-- SAP Portal Database Schema
-- Clean implementation with UUID primary keys and roll number system
-- Updated roll number format: Staff includes user type letter (A/F/T)
-- Run this script to create the complete database structure

CREATE DATABASE IF NOT EXISTS sap_portal;
USE sap_portal;

-- Course codes table for student roll number generation
CREATE TABLE course_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_number VARCHAR(3) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Department codes table for staff roll number generation
CREATE TABLE department_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(10) UNIQUE NOT NULL,
    department_number VARCHAR(3) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roll number counters for tracking serial numbers
-- Supports new format with user type letters for staff
CREATE TABLE roll_number_counters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    course_number VARCHAR(3) NULL,
    department_number VARCHAR(3) NULL,
    user_type ENUM('student', 'teacher', 'faculty', 'admin') NOT NULL,
    counter INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_counter (year, course_number, department_number, user_type)
);

-- Users table with UUID primary key and updated roll number system
-- Roll number format:
-- Students: YYYY + Course Code (3 digits) + Serial (3 digits) = 10 chars
-- Staff: YYYY + Department Code (3 digits) + Type Letter + Serial (3 digits) = 11 chars
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    roll_number VARCHAR(12) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'teacher', 'faculty', 'admin') NOT NULL,
    course_id INT NULL,
    department_id INT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_roll_number (roll_number),
    INDEX idx_active (is_active),
    
    FOREIGN KEY (course_id) REFERENCES course_codes(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES department_codes(id) ON DELETE SET NULL
);

-- Departments table
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    head_id VARCHAR(36),
    department_code_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    
    FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_code_id) REFERENCES department_codes(id) ON DELETE SET NULL
);

-- Courses table
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    department_id VARCHAR(36),
    teacher_id VARCHAR(36),
    course_code_id INT,
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_course_code (code),
    INDEX idx_semester (semester, academic_year),
    INDEX idx_active (is_active),
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (course_code_id) REFERENCES course_codes(id) ON DELETE SET NULL
);

-- Student enrollments
CREATE TABLE enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    grade VARCHAR(5),
    gpa_points DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    due_date DATETIME,
    max_points INT DEFAULT 100,
    assignment_type ENUM('homework', 'quiz', 'exam', 'project') DEFAULT 'homework',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_course_id (course_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_due_date (due_date),
    INDEX idx_published (is_published),
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment submissions
CREATE TABLE submissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assignment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    submission_text TEXT,
    file_path VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_earned INT,
    feedback TEXT,
    graded_at TIMESTAMP NULL,
    graded_by VARCHAR(36),
    status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance tracking
CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    notes TEXT,
    marked_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_attendance (student_id, course_id, attendance_date),
    INDEX idx_student_course (student_id, course_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_status (status),
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Fee payments
CREATE TABLE fee_payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee_type ENUM('tuition', 'library', 'lab', 'exam', 'other') DEFAULT 'tuition',
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online') DEFAULT 'online',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_student_id (student_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Academic calendar and events
CREATE TABLE academic_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('holiday', 'exam', 'registration', 'orientation', 'other') DEFAULT 'other',
    start_date DATE NOT NULL,
    end_date DATE,
    is_holiday BOOLEAN DEFAULT FALSE,
    target_audience ENUM('all', 'students', 'teachers', 'faculty', 'admin') DEFAULT 'all',
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_start_date (start_date),
    INDEX idx_event_type (event_type),
    INDEX idx_target_audience (target_audience),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications system
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert course codes
INSERT INTO course_codes (course_name, course_code, course_number, description) VALUES
('Computer Science', 'CS', '070', 'Bachelor of Computer Science program'),
('Information Technology', 'IT', '071', 'Bachelor of Information Technology program'),
('Electronics Engineering', 'EC', '072', 'Bachelor of Electronics Engineering program'),
('Mechanical Engineering', 'ME', '073', 'Bachelor of Mechanical Engineering program'),
('Civil Engineering', 'CE', '074', 'Bachelor of Civil Engineering program'),
('Electrical Engineering', 'EE', '075', 'Bachelor of Electrical Engineering program'),
('Business Administration', 'BA', '076', 'Bachelor of Business Administration program'),
('Mathematics', 'MA', '077', 'Bachelor of Mathematics program'),
('Physics', 'PH', '078', 'Bachelor of Physics program'),
('Chemistry', 'CH', '079', 'Bachelor of Chemistry program');

-- Insert department codes
INSERT INTO department_codes (department_name, department_code, department_number, description) VALUES
('Administration', 'ADM', '001', 'Administrative department'),
('Academic Affairs', 'ACA', '002', 'Academic affairs department'),
('Computer Science Department', 'CSD', '248', 'Computer Science and IT department'),
('Engineering Department', 'ENG', '249', 'All engineering disciplines'),
('Science Department', 'SCI', '250', 'Mathematics, Physics, Chemistry'),
('Business Department', 'BUS', '251', 'Business and Management studies'),
('Student Affairs', 'STU', '252', 'Student services and support'),
('Finance Department', 'FIN', '253', 'Financial operations'),
('Human Resources', 'HR', '254', 'Human resources management'),
('Library Services', 'LIB', '255', 'Library and information services');

-- ============================================================================
-- ROLL NUMBER FORMAT DOCUMENTATION
-- ============================================================================
-- 
-- Students: YYYY + Course Code (3 digits) + Serial Number (3 digits)
--   Format: YYYYCCCNNN (10 characters)
--   Example: 2025070001 (2025 + CS=070 + 001)
-- 
-- Staff: YYYY + Department Code (3 digits) + User Type Letter + Serial Number (3 digits)
--   Format: YYYYDDDTNNN (11 characters)
--   Examples:
--     Admin:   2025248A001 (2025 + CSD=248 + A + 001)
--     Faculty: 2025248F001 (2025 + CSD=248 + F + 001)
--     Teacher: 2025248T001 (2025 + CSD=248 + T + 001)
-- 
-- User Type Letters:
--   A = Admin
--   F = Faculty  
--   T = Teacher
-- 
-- ============================================================================
