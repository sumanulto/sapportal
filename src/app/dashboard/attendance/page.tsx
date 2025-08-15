"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface AttendanceRecord {
  id: number
  course_name: string
  course_code: string
  attendance_date: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

interface AttendanceStats {
  totalClasses: number
  presentClasses: number
  absentClasses: number
  lateClasses: number
  attendancePercentage: number
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    lateClasses: 0,
    attendancePercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    fetchAttendance()
    fetchAttendanceStats()
  }, [selectedMonth])

  const fetchAttendance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch(`/api/student/attendance?userId=${user.id}&month=${selectedMonth}`)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch(`/api/student/attendance-stats?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "absent":
        return <XCircle className="w-5 h-5 text-error" />
      case "late":
        return <Clock className="w-5 h-5 text-warning" />
      case "excused":
        return <AlertCircle className="w-5 h-5 text-info" />
      default:
        return <Clock className="w-5 h-5 text-base-content/50" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      present: "badge-success",
      absent: "badge-error",
      late: "badge-warning",
      excused: "badge-info",
    }
    return badges[status] || "badge-neutral"
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
        <h1 className="text-3xl font-bold text-base-content">My Attendance</h1>
        <div className="form-control">
          <input
            type="month"
            className="input input-bordered"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Classes</div>
          <div className="stat-value text-primary">{stats.totalClasses}</div>
          <div className="stat-desc">This semester</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Present</div>
          <div className="stat-value text-success">{stats.presentClasses}</div>
          <div className="stat-desc">{stats.attendancePercentage.toFixed(1)}% attendance</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-error">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Absent</div>
          <div className="stat-value text-error">{stats.absentClasses}</div>
          <div className="stat-desc">Classes missed</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-warning">
            <Clock className="w-8 h-8" />
          </div>
          <div className="stat-title">Late</div>
          <div className="stat-value text-warning">{stats.lateClasses}</div>
          <div className="stat-desc">Late arrivals</div>
        </div>
      </div>

      {/* Attendance Progress */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Attendance Progress</h2>
          <div className="w-full bg-base-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                stats.attendancePercentage >= 75
                  ? "bg-success"
                  : stats.attendancePercentage >= 60
                    ? "bg-warning"
                    : "bg-error"
              }`}
              style={{ width: `${stats.attendancePercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-base-content/70">
            <span>0%</span>
            <span className="font-medium">{stats.attendancePercentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
          {stats.attendancePercentage < 75 && (
            <div className="alert alert-warning mt-4">
              <AlertCircle className="w-5 h-5" />
              <span>
                Your attendance is below 75%. Please attend classes regularly to meet the minimum requirement.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Attendance Records</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-base-content/50" />
                        <span>{new Date(record.attendance_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-bold">{record.course_name}</div>
                        <div className="text-sm text-base-content/70">{record.course_code}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`badge ${getStatusBadge(record.status)} capitalize`}>{record.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/70">{record.notes || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendance.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">No Attendance Records</h3>
              <p className="text-base-content/50">Attendance records for the selected month will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
