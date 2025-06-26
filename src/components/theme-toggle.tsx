"use client"

import { Palette } from "lucide-react"
import { useTheme } from "./theme-provider"

const themes = [
  { name: "night", label: "Night", color: "bg-slate-800" },
  { name: "forest", label: "Forest", color: "bg-green-800" },
  { name: "lemonade", label: "Lemonade", color: "bg-yellow-400" },
  { name: "nord", label: "Nord", color: "bg-blue-600" },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="dropdown dropdown-top dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-circle btn-primary shadow-lg">
          <Palette className="w-5 h-5" />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-48 border border-base-300 mb-2"
        >
          <li className="menu-title px-4 py-2">
            <span>Choose Theme</span>
          </li>
          {themes.map((themeOption) => (
            <li key={themeOption.name}>
              <button
                onClick={() => setTheme(themeOption.name)}
                className={`flex items-center gap-3 w-full text-left ${
                  theme === themeOption.name ? "bg-primary text-primary-content" : ""
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${themeOption.color}`}></div>
                <span>{themeOption.label}</span>
                {theme === themeOption.name && <span className="badge badge-sm ml-auto">Active</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
