"use client"
import { useRouter } from "next/navigation"
import { GraduationCap, User, Settings, Shield, LogOut, Bell } from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    email: string
    userType: string
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="navbar bg-base-100 shadow-lg px-6 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-content" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">SAP Portal</h1>
            <p className="text-xs text-base-content/70 capitalize">{user.userType} Dashboard</p>
          </div>
        </div>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-base-200 transition-colors">
              <div className="indicator">
                <Bell className="w-5 h-5" />
                <span className="badge badge-xs badge-primary indicator-item">3</span>
              </div>
            </div>
            <div className="dropdown-content bg-base-100 rounded-box w-64 border border-base-300 mt-3">
              <div className="card-body">
                <h3 className="font-bold">Notifications</h3>
                <div className="space-y-2">
                  <div className="text-sm p-2 bg-base-200 rounded">
                    <p className="font-medium">New assignment posted</p>
                    <p className="text-xs text-base-content/70">2 hours ago</p>
                  </div>
                  <div className="text-sm p-2 bg-base-200 rounded">
                    <p className="font-medium">Grade updated</p>
                    <p className="text-xs text-base-content/70">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:bg-base-200 transition-colors"
            >
              <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="dropdown-content bg-base-100 rounded-box w-52 border border-base-300 mt-3">
              <ul className="menu p-2">
                <li className="menu-title px-4 py-2">
                  <div>
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-base-content/70 block">{user.email}</span>
                  </div>
                </li>
                <li>
                  <a className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Account Details
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </a>
                </li>
                <li>
                  <hr className="my-1 border-base-300" />
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-error hover:bg-error/10 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
