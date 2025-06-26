"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  GraduationCap,
  FileText,
  Clock,
  Award,
  Shield,
  Database,
} from "lucide-react"

interface SidebarProps {
  userType: "student" | "teacher" | "faculty" | "admin"
}

const menuItems = {
  student: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    { icon: FileText, label: "Assignments", href: "/dashboard/assignments" },
    { icon: Award, label: "Grades", href: "/dashboard/grades" },
    { icon: Clock, label: "Attendance", href: "/dashboard/attendance" },
    { icon: DollarSign, label: "Fees", href: "/dashboard/fees" },
    { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  teacher: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: BookOpen, label: "My Classes", href: "/dashboard/classes" },
    { icon: Users, label: "Students", href: "/dashboard/students" },
    { icon: FileText, label: "Assignments", href: "/dashboard/assignments" },
    { icon: Award, label: "Grading", href: "/dashboard/grading" },
    { icon: Clock, label: "Attendance", href: "/dashboard/attendance" },
    { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  faculty: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: GraduationCap, label: "Departments", href: "/dashboard/departments" },
    { icon: Users, label: "Faculty", href: "/dashboard/faculty" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    { icon: Calendar, label: "Academic Calendar", href: "/dashboard/calendar" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: FileText, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Users, label: "User Management", href: "/dashboard/users" },
    { icon: GraduationCap, label: "Departments", href: "/dashboard/departments" },
    { icon: BookOpen, label: "Course Management", href: "/dashboard/courses" },
    { icon: DollarSign, label: "Financial", href: "/dashboard/financial" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Database, label: "System", href: "/dashboard/system" },
    { icon: Shield, label: "Security", href: "/dashboard/security" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
}

export default function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const items = menuItems[userType]

  return (
    <aside className="w-64 bg-base-100 shadow-lg fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-base-content capitalize">{userType} Menu</h2>
          <p className="text-sm text-base-content/70">Navigate your portal</p>
        </div>

        <ul className="menu p-0 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
