"use client"

import { useEffect, useState } from "react"
import { BookOpen, Users, Clock } from "lucide-react"

export default function CoursesPage() {
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchCourses(parsedUser.id, parsedUser.userType)
    }
  }, [])

  const fetchCourses = async (userId: number, userType: string) => {
    try {
      const response = await fetch(`/api/courses?userId=${userId}&userType=${userType}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-base-content">
          {user?.userType === "student" ? "My Courses" : "Courses"}
        </h1>
        {user?.userType === "teacher" && (
          <button className="btn btn-primary">
            <BookOpen className="w-4 h-4" />
            Add Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
              <h2 className="card-title">
                <BookOpen className="w-5 h-5 text-primary" />
                {course.name}
              </h2>

              <div className="space-y-2">
                <p className="text-sm text-base-content/70">
                  <strong>Code:</strong> {course.code}
                </p>
                <p className="text-sm text-base-content/70">
                  <strong>Credits:</strong> {course.credits}
                </p>
                <p className="text-sm text-base-content/70">
                  <strong>Semester:</strong> {course.semester} {course.academic_year}
                </p>
                {course.teacher_name && (
                  <p className="text-sm text-base-content/70">
                    <strong>Teacher:</strong> {course.teacher_name}
                  </p>
                )}
                {course.department_name && (
                  <p className="text-sm text-base-content/70">
                    <strong>Department:</strong> {course.department_name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                {course.student_count && (
                  <div className="flex items-center gap-1 text-sm text-base-content/70">
                    <Users className="w-4 h-4" />
                    <span>{course.student_count} students</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-base-content/70">
                  <Clock className="w-4 h-4" />
                  <span>{course.credits}h/week</span>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content/70 mb-2">No Courses Found</h3>
          <p className="text-base-content/50">
            {user?.userType === "student" ? "You are not enrolled in any courses yet." : "No courses available."}
          </p>
        </div>
      )}
    </div>
  )
}
