import Link from "next/link"
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-lg px-4 lg:px-8">
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-content" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-base-content">SAP Portal</h1>
              <p className="text-xs text-base-content/70">Student Academic Portal</p>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <Link href="/signin" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-content">
            <div className="max-w-md">
              <div className="mb-8">
                <div className="avatar">
                  <div className="w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl font-bold text-base-content mb-6">
                Welcome to <span className="text-primary">SAP Portal</span>
              </h1>

              <p className="text-lg text-base-content/70 mb-8">
                Your comprehensive Student Academic Portal for managing education, tracking progress, and staying
                connected with your academic journey.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card bg-base-200 p-4">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Students</h3>
                </div>
                <div className="card bg-base-200 p-4">
                  <BookOpen className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Teachers</h3>
                </div>
                <div className="card bg-base-200 p-4">
                  <GraduationCap className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Faculty</h3>
                </div>
                <div className="card bg-base-200 p-4">
                  <Shield className="w-8 h-8 text-info mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Admin</h3>
                </div>
              </div>

              <Link href="/signin" className="btn btn-primary btn-lg">
                Access Portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>© 2025 SAP Portal. All rights reserved. Built with Next.js & DaisyUI</p>
        </div>
      </footer>
    </div>
  )
}
