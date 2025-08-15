"use client"

import { useEffect, useState } from "react"
import { Award, TrendingUp, BarChart3, Calendar } from "lucide-react"

interface Grade {
  id: number
  course_name: string
  course_code: string
  assignment_title: string
  points_earned: number
  max_points: number
  percentage: number
  grade: string
  submitted_at: string
  graded_at: string
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState("current")
  const [gpaStats, setGpaStats] = useState({
    currentGPA: 0,
    totalCredits: 0,
    completedCourses: 0,
  })

  useEffect(() => {
    fetchGrades()
    fetchGPAStats()
  }, [selectedSemester])

  const fetchGrades = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch(`/api/student/grades?userId=${user.id}&semester=${selectedSemester}`)
      if (response.ok) {
        const data = await response.json()
        setGrades(data.grades)
      }
    } catch (error) {
      console.error("Error fetching grades:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGPAStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch(`/api/student/gpa-stats?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setGpaStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching GPA stats:", error)
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-success"
    if (percentage >= 80) return "text-info"
    if (percentage >= 70) return "text-warning"
    return "text-error"
  }

  const getGradeBadge = (grade: string) => {
    const colors: { [key: string]: string } = {
      "A+": "badge-success",
      A: "badge-success",
      "A-": "badge-success",
      "B+": "badge-info",
      B: "badge-info",
      "B-": "badge-info",
      "C+": "badge-warning",
      C: "badge-warning",
      "C-": "badge-warning",
      D: "badge-error",
      F: "badge-error",
    }
    return colors[grade] || "badge-neutral"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-base-content">My Grades</h1>
        <div className="form-control">
          <select
            className="select select-bordered"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="current">Current Semester</option>
            <option value="fall2024">Fall 2024</option>
            <option value="spring2024">Spring 2024</option>
            <option value="all">All Semesters</option>
          </select>
        </div>
      </div>

      {/* GPA Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <Award className="w-8 h-8" />
          </div>
          <div className="stat-title">Current GPA</div>
          <div className="stat-value text-primary">{gpaStats.currentGPA.toFixed(2)}</div>
          <div className="stat-desc">Out of 4.0</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Credits</div>
          <div className="stat-value text-secondary">{gpaStats.totalCredits}</div>
          <div className="stat-desc">Credits earned</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Completed</div>
          <div className="stat-value text-accent">{gpaStats.completedCourses}</div>
          <div className="stat-desc">Courses finished</div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Grade Details</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Assignment</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>
                      <div>
                        <div className="font-bold">{grade.course_name}</div>
                        <div className="text-sm text-base-content/70">{grade.course_code}</div>
                      </div>
                    </td>
                    <td>{grade.assignment_title}</td>
                    <td>
                      <span className="font-mono">
                        {grade.points_earned}/{grade.max_points}
                      </span>
                    </td>
                    <td>
                      <span className={`font-bold ${getGradeColor(grade.percentage)}`}>
                        {grade.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getGradeBadge(grade.grade)}`}>{grade.grade}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-base-content/50" />
                        <span className="text-sm">{new Date(grade.graded_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {grades.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">No Grades Yet</h3>
              <p className="text-base-content/50">Your grades will appear here once assignments are graded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
