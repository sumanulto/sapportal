"use client"

import { useEffect, useState } from "react"
import { FileText, Calendar, Clock, CheckCircle } from "lucide-react"

export default function AssignmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchAssignments(parsedUser.id, parsedUser.userType)
    }
  }, [])

  const fetchAssignments = async (userId: number, userType: string) => {
    try {
      const response = await fetch(`/api/assignments?userId=${userId}&userType=${userType}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (assignment: any) => {
    if (assignment.submission_status === "submitted") {
      return <span className="badge badge-success">Submitted</span>
    } else if (assignment.submission_status === "graded") {
      return <span className="badge badge-info">Graded</span>
    } else if (new Date(assignment.due_date) < new Date()) {
      return <span className="badge badge-error">Overdue</span>
    } else {
      return <span className="badge badge-warning">Pending</span>
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true
    if (filter === "pending") return !assignment.submission_status
    if (filter === "submitted") return assignment.submission_status === "submitted"
    if (filter === "graded") return assignment.submission_status === "graded"
    return true
  })

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
        <h1 className="text-3xl font-bold text-base-content">Assignments</h1>
        {user?.userType === "teacher" && (
          <button className="btn btn-primary">
            <FileText className="w-4 h-4" />
            Create Assignment
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`btn btn-sm ${filter === "pending" ? "btn-primary" : "btn-ghost"}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("submitted")}
          className={`btn btn-sm ${filter === "submitted" ? "btn-primary" : "btn-ghost"}`}
        >
          Submitted
        </button>
        <button
          onClick={() => setFilter("graded")}
          className={`btn btn-sm ${filter === "graded" ? "btn-primary" : "btn-ghost"}`}
        >
          Graded
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title">
                  <FileText className="w-5 h-5 text-primary" />
                  {assignment.title}
                </h2>
                {getStatusBadge(assignment)}
              </div>

              <p className="text-sm text-base-content/70 mb-4">{assignment.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-base-content/70" />
                  <span>Course: {assignment.course_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-base-content/70" />
                  <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Max Points: {assignment.max_points}</span>
                </div>
                {assignment.points_earned && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>
                      Score: {assignment.points_earned}/{assignment.max_points}
                    </span>
                  </div>
                )}
              </div>

              <div className="card-actions justify-end mt-4">
                {user?.userType === "student" && !assignment.submission_status && (
                  <button className="btn btn-primary btn-sm">Submit</button>
                )}
                {user?.userType === "student" && assignment.submission_status && (
                  <button className="btn btn-ghost btn-sm">View Submission</button>
                )}
                {user?.userType === "teacher" && <button className="btn btn-primary btn-sm">View Details</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content/70 mb-2">No Assignments Found</h3>
          <p className="text-base-content/50">
            {filter === "all" ? "No assignments available." : `No ${filter} assignments found.`}
          </p>
        </div>
      )}
    </div>
  )
}
