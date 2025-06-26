"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, User, BookOpen, Users, Shield, Eye, EyeOff } from "lucide-react"

type UserType = "student" | "teacher" | "faculty" | "admin"

const userTypeConfig = {
  student: {
    icon: User,
    title: "Student Portal",
    description: "Access your courses, grades, and academic information",
    color: "text-primary",
  },
  teacher: {
    icon: BookOpen,
    title: "Teacher Portal",
    description: "Manage classes, assignments, and student progress",
    color: "text-secondary",
  },
  faculty: {
    icon: Users,
    title: "Faculty Portal",
    description: "Administrative tools and faculty resources",
    color: "text-accent",
  },
  admin: {
    icon: Shield,
    title: "Admin Portal",
    description: "System administration and user management",
    color: "text-info",
  },
}

export default function SignInPage() {
  const [userType, setUserType] = useState<UserType>("student")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        const error = await response.json()
        alert(error.message || "Sign in failed")
      }
    } catch (error) {
      alert("An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const currentConfig = userTypeConfig[userType]
  const IconComponent = currentConfig.icon

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="btn btn-ghost btn-sm mb-4">
              ← Back to Home
            </Link>
            <div className="avatar">
              <div className="w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-4">SAP Portal</h1>
          </div>

          {/* User Type Selector */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold">Select Portal Type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(userTypeConfig).map(([type, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type as UserType)}
                    className={`btn btn-outline ${userType === type ? "btn-active" : ""} flex-col h-auto py-3`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs capitalize">{type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="alert alert-info mb-6">
            <IconComponent className={`w-5 h-5 ${currentConfig.color}`} />
            <div>
              <h3 className="font-bold">{currentConfig.title}</h3>
              <div className="text-xs">{currentConfig.description}</div>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/50" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/50" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="divider">Demo Credentials</div>
          <div className="text-xs text-base-content/70 space-y-1">
            <p>
              <strong>Admin:</strong> admin@sap.edu / admin123
            </p>
            <p>
              <strong>Student:</strong> student@sap.edu / student123
            </p>
            <p>
              <strong>Teacher:</strong> teacher@sap.edu / teacher123
            </p>
            <p>
              <strong>Faculty:</strong> faculty@sap.edu / faculty123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
