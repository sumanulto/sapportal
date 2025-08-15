"use client"

import { useEffect, useState } from "react"
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, Clock, Award, Bell } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchStats(parsedUser.id, parsedUser.userType)
    }
  }, [])

  const fetchStats = async (userId: number, userType: string) => {
    try {
      const response = await fetch(`/api/dashboard/stats?userId=${userId}&userType=${userType}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
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

  if (!user || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  const renderStudentDashboard = () => (
    <div className="space-y-6 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Attendance</div>
          <div className="stat-value text-primary">{stats.attendance}%</div>
          <div className="stat-desc">This semester</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <Award className="w-8 h-8" />
          </div>
          <div className="stat-title">GPA</div>
          <div className="stat-value text-secondary">{stats.gpa}</div>
          <div className="stat-desc">Current semester</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Assignments</div>
          <div className="stat-value text-accent">{stats.assignments}</div>
          <div className="stat-desc">Pending</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-info">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title">Fees Due</div>
          <div className="stat-value text-info">${stats.fees}</div>
          <div className="stat-desc">Next payment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Activities</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs">A</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Assignment submitted: Data Structures</p>
                  <p className="text-xs text-base-content/70">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-secondary text-secondary-content rounded-full w-8">
                    <span className="text-xs">G</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Grade received: Mathematics - A</p>
                  <p className="text-xs text-base-content/70">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-accent text-accent-content rounded-full w-8">
                    <span className="text-xs">C</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Class attended: Physics Lab</p>
                  <p className="text-xs text-base-content/70">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Upcoming Events</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mid-term Exams</p>
                  <p className="text-xs text-base-content/70">March 15-20, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Project Submission</p>
                  <p className="text-xs text-base-content/70">March 25, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fee Payment Due</p>
                  <p className="text-xs text-base-content/70">March 30, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTeacherDashboard = () => (
    <div className="space-y-6 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Classes</div>
          <div className="stat-value text-primary">{stats.classes}</div>
          <div className="stat-desc">Active courses</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Students</div>
          <div className="stat-value text-secondary">{stats.students}</div>
          <div className="stat-desc">Total enrolled</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <Clock className="w-8 h-8" />
          </div>
          <div className="stat-title">Assignments</div>
          <div className="stat-value text-accent">{stats.assignments}</div>
          <div className="stat-desc">To be graded</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-info">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Attendance</div>
          <div className="stat-value text-info">{stats.attendance}%</div>
          <div className="stat-desc">Class average</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Today's Classes</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <div>
                  <p className="font-medium">Data Structures</p>
                  <p className="text-sm text-base-content/70">Room 101 • 45 students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">9:00 AM</p>
                  <span className="badge badge-success badge-sm">Active</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <div>
                  <p className="font-medium">Algorithms</p>
                  <p className="text-sm text-base-content/70">Room 205 • 38 students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">2:00 PM</p>
                  <span className="badge badge-warning badge-sm">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Submissions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Assignment 3 - Arrays</p>
                  <p className="text-xs text-base-content/70">John Doe</p>
                </div>
                <span className="badge badge-info badge-sm">New</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Project - Database Design</p>
                  <p className="text-xs text-base-content/70">Jane Smith</p>
                </div>
                <span className="badge badge-success badge-sm">Graded</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Quiz 2 - Sorting</p>
                  <p className="text-xs text-base-content/70">Mike Johnson</p>
                </div>
                <span className="badge badge-warning badge-sm">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-6 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc">All portal users</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Active Users</div>
          <div className="stat-value text-secondary">{stats.activeUsers}</div>
          <div className="stat-desc">This month</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Departments</div>
          <div className="stat-value text-accent">{stats.departments}</div>
          <div className="stat-desc">Active departments</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-info">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title">Revenue</div>
          <div className="stat-value text-info">${stats.revenue.toLocaleString()}</div>
          <div className="stat-desc">This semester</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">System Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Server Status</span>
                <span className="badge badge-success">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <span className="badge badge-success">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Backup Status</span>
                <span className="badge badge-info">Completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span>System Load</span>
                <span className="badge badge-warning">Medium</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Activities</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs flex justify-center items-center">U</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">New user registered</p>
                  <p className="text-xs text-base-content/70">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-secondary text-secondary-content rounded-full w-8">
                    <span className="text-xs flex justify-center items-center">S</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">System backup completed</p>
                  <p className="text-xs text-base-content/70">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-accent text-accent-content rounded-full w-8">
                    <span className="text-xs flex justify-center items-center">D</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Database optimized</p>
                  <p className="text-xs text-base-content/70">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pt-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Welcome back, {user.name}!</h1>
          <p className="text-base-content/70 mt-1">Here's what's happening with your {user.userType} portal today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-base-content/70">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {user.userType === "student" && renderStudentDashboard()}
      {user.userType === "teacher" && renderTeacherDashboard()}
      {user.userType === "faculty" && renderTeacherDashboard()}
      {user.userType === "admin" && renderAdminDashboard()}
    </div>
  )
}
