"use client"

import { useEffect, useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
        dateOfBirth: parsedUser.dateOfBirth || "",
      })
    }
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      })

      if (response.ok) {
        const updatedUser = { ...user, ...formData }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setEditing(false)
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("An error occurred while updating profile")
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-base-content">Profile</h1>
        <button onClick={() => setEditing(!editing)} className="btn btn-primary">
          <Edit className="w-4 h-4" />
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card bg-base-100 shadow">
          <div className="card-body text-center">
            <div className="avatar">
              <div className="w-24 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="card-title justify-center">{user.name}</h2>
            <p className="text-base-content/70 capitalize">{user.userType}</p>
            <div className="badge badge-primary">{user.is_active ? "Active" : "Inactive"}</div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <User className="w-4 h-4 text-base-content/70" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      className="input input-bordered"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <Mail className="w-4 h-4 text-base-content/70" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      className="input input-bordered"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <Phone className="w-4 h-4 text-base-content/70" />
                      <span>{formData.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date of Birth</span>
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      className="input input-bordered"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <Calendar className="w-4 h-4 text-base-content/70" />
                      <span>{formData.dateOfBirth || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  {editing ? (
                    <textarea
                      className="textarea textarea-bordered"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-base-200 rounded">
                      <MapPin className="w-4 h-4 text-base-content/70 mt-0.5" />
                      <span>{formData.address || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="card-actions justify-end mt-6">
                  <button onClick={() => setEditing(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
