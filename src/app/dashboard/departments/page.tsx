"use client"

import { ReactNode, useEffect, useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface User {
  temporaryPassword: ReactNode
  id: string
  roll_number: string
  name: string
  email: string
  user_type: string
  phone: string
  address: string
  dateOfBirth: string
  is_active: boolean
  created_at: string
  course_id?: number
  course_name?: string
  course_code?: string
  department_id?: number
  department_name?: string
  department_code?: string
}

interface CourseOption {
  id: number
  course_name: string
  course_code: string
}

interface DepartmentOption {
  id: number
  department_name: string
  department_code: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([])
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  const [newUser, setNewUser] = useState({
    name: "", email: "", userType: "student", phone: "", address: "", dateOfBirth: "", courseId: "", departmentId: ""
  })
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserData, setEditUserData] = useState({
    name: "", email: "", userType: "student", phone: "", address: "", dateOfBirth: "", courseId: "", departmentId: ""
  })

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
    fetchOptions()
  }, [selectedUserType, pagination.page])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?userType=${selectedUserType}&page=${pagination.page}&limit=${pagination.limit}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/admin/users?options=true")
      if (res.ok) {
        const data = await res.json()
        setCourseOptions(data.courses)
        setDepartmentOptions(data.departments)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Create User
const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newUser,
          courseId: newUser.courseId ? Number.parseInt(newUser.courseId) : null,
          departmentId: newUser.departmentId ? Number.parseInt(newUser.departmentId) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedUser(data.user)
        setNewUser({
          name: "",
          email: "",
          userType: "student",
          phone: "",
          address: "",
          dateOfBirth: "",
          courseId: "",
          departmentId: "",
        })
        setShowCreateModal(false)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      alert("An error occurred while creating user")
    }
  }

  // Edit User
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserData({
      name: user.name,
      email: user.email,
      userType: user.user_type,
      phone: user.phone || "",
      address: user.address || "",
      dateOfBirth: user.dateOfBirth || "",
      courseId: user.course_id?.toString() || "",
      departmentId: user.department_id?.toString() || ""
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUserData.name,
          email: editUserData.email,
          userType: editUserData.userType,
          phone: editUserData.phone,
          address: editUserData.address,
          dateOfBirth: editUserData.dateOfBirth,
          courseId: editUserData.courseId ? Number(editUserData.courseId) : null,
          departmentId: editUserData.departmentId ? Number(editUserData.departmentId) : null
        })
      })
      if (res.ok) {
        alert("User updated successfully")
        setEditingUser(null)
        fetchUsers()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch {
      alert("Failed to update user")
    }
  }

  // Delete
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsers()
        setSelectedUserIds(prev => prev.filter(uid => uid !== id))
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch {
      alert("Failed to delete user")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return
    if (!confirm("Delete selected users?")) return
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUserIds })
      })
      if (res.ok) {
        alert("Deleted successfully")
        setSelectedUserIds([])
        fetchUsers()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch {
      alert("Failed to delete users")
    }
  }

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(u => u!==id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) setSelectedUserIds([])
    else setSelectedUserIds(users.map(u=>u.id))
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.roll_number.includes(searchTerm)
  )

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg"></span></div>

  return (
    <div className="space-y-6 pt-16">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-base-content">User Management</h1>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body flex flex-col md:flex-row gap-4 items-center">
          <div className="form-control flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input type="text" placeholder="Search by name, email, or roll number..." className="input input-bordered pl-10 w-full" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <div className="form-control">
            <select className="select select-bordered" value={selectedUserType} onChange={e=>setSelectedUserType(e.target.value)}>
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <button onClick={()=>setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Create User</button>
        </div>
      </div>

      {/* Bulk Delete */}
      <div className="flex justify-end mb-2">
        <button className="btn btn-error btn-sm" disabled={selectedUserIds.length===0} onClick={handleBulkDelete}>Delete Selected</button>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedUserIds.length===filteredUsers.length && filteredUsers.length>0} onChange={toggleSelectAll} /></th>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Course/Department</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user=>(
                <tr key={user.id}>
                  <td><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={()=>toggleSelectUser(user.id)} /></td>
                  <td><span className="font-mono text-sm bg-base-200 px-2 py-1 rounded">{user.roll_number}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8">
                          <span className="text-xs flex items-center justify-center">{user.name.charAt(0)}</span>
                        </div>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`badge ${user.user_type==="admin"?"badge-error":user.user_type==="faculty"?"badge-warning":user.user_type==="teacher"?"badge-info":"badge-success"} capitalize`}>{user.user_type}</span></td>
                  <td>
                    <div className="text-sm">
                      {user.course_name && <div><span className="font-medium">{user.course_name}</span><div className="text-xs text-base-content/70">{user.course_code}</div></div>}
                      {user.department_name && <div><span className="font-medium">{user.department_name}</span><div className="text-xs text-base-content/70">{user.department_code}</div></div>}
                    </div>
                  </td>
                  <td><span className={`badge ${user.is_active?"badge-success":"badge-error"}`}>{user.is_active?"Active":"Inactive"}</span></td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={()=>handleEditUser(user)}><Edit className="w-4 h-4" /></button>
                      <button className="btn btn-ghost btn-sm text-error" onClick={()=>handleDeleteUser(user.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-base-content/70">
              Showing {(pagination.page-1)*pagination.limit+1} to {Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total} users
            </span>
            <div className="join">
              <button className="join-item btn btn-sm" disabled={pagination.page===1} onClick={()=>setPagination(p=>({...p,page:p.page-1}))}>Previous</button>
              <button className="join-item btn btn-sm btn-active">{pagination.page}</button>
              <button className="join-item btn btn-sm" disabled={pagination.page===pagination.pages} onClick={()=>setPagination(p=>({...p,page:p.page+1}))}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 shadow-lg rounded-lg max-w-2xl w-full p-6">
            <h3 className="font-bold text-lg mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Full Name *</span></label>
                  <input type="text" className="input input-bordered" value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Email *</span></label>
                  <input type="email" className="input input-bordered" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">User Type *</span></label>
                  <select className="select select-bordered" value={newUser.userType} onChange={e=>setNewUser({...newUser,userType:e.target.value,courseId:"",departmentId:""})}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {newUser.userType==="student" && (
                  <div className="form-control">
                    <label className="label"><span className="label-text">Course *</span></label>
                    <select className="select select-bordered" value={newUser.courseId} onChange={e=>setNewUser({...newUser,courseId:e.target.value})} required>
                      <option value="">Select Course</option>
                      {courseOptions.map(c=><option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>)}
                    </select>
                  </div>
                )}
                {(newUser.userType==="teacher" || newUser.userType==="faculty") && (
                  <div className="form-control">
                    <label className="label"><span className="label-text">Department *</span></label>
                    <select className="select select-bordered" value={newUser.departmentId} onChange={e=>setNewUser({...newUser,departmentId:e.target.value})} required>
                      <option value="">Select Department</option>
                      {departmentOptions.map(d=><option key={d.id} value={d.id}>{d.department_name} ({d.department_code})</option>)}
                    </select>
                  </div>
                )}
                <div className="form-control">
                  <label className="label"><span className="label-text">Phone</span></label>
                  <input type="text" className="input input-bordered" value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Date of Birth</span></label>
                  <input type="date" className="input input-bordered" value={newUser.dateOfBirth} onChange={e=>setNewUser({...newUser,dateOfBirth:e.target.value})} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Address</span></label>
                  <textarea className="textarea textarea-bordered" value={newUser.address} onChange={e=>setNewUser({...newUser,address:e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 shadow-lg rounded-lg max-w-lg w-full p-6">
            <h3 className="font-bold text-lg mb-4 text-success">User Created Successfully!</h3>
            <div className="space-y-4">
              <div className="alert alert-success">
                <div>
                  <h4 className="font-bold">User Details:</h4>
                  <p><strong>Roll Number:</strong> <span className="font-mono bg-base-200 px-2 py-1 rounded">{createdUser.roll_number}</span></p>
                  <p><strong>Name:</strong> {createdUser.name}</p>
                  <p><strong>Email:</strong> {createdUser.email}</p>
                  <p><strong>Type:</strong> {createdUser.user_type}</p>
                  {createdUser.course_name && <p><strong>Course:</strong> {createdUser.course_name}</p>}
                  {createdUser.department_name && <p><strong>Department:</strong> {createdUser.department_name}</p>}
                </div>
              </div>
              <div className="alert alert-warning">
                <div>
                    <h4 className="font-bold">Temporary Password:</h4>
                        <div className="flex items-center gap-2">
                            <code className="bg-base-200 px-2 py-1 rounded">
                                {showPassword ? createdUser.temporaryPassword : "••••••••••••"}
                            </code>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                              </button>
                                            </div>
                                            <p className="text-sm mt-2">
                                              Please share this password securely with the user. They should change it on first login.
                                            </p>
                                          </div>
                                        </div>
              <div className="modal-action">
                <button className="btn btn-primary" onClick={()=>setCreatedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 shadow-lg rounded-lg max-w-2xl w-full p-6">
            <h3 className="font-bold text-lg mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Full Name *</span></label>
                  <input type="text" className="input input-bordered" value={editUserData.name} onChange={e=>setEditUserData({...editUserData,name:e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Email *</span></label>
                  <input type="email" className="input input-bordered" value={editUserData.email} onChange={e=>setEditUserData({...editUserData,email:e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">User Type *</span></label>
                  <select className="select select-bordered" value={editUserData.userType} onChange={e=>setEditUserData({...editUserData,userType:e.target.value,courseId:"",departmentId:""})}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editUserData.userType==="student" && (
                  <div className="form-control">
                    <label className="label"><span className="label-text">Course *</span></label>
                    <select className="select select-bordered" value={editUserData.courseId} onChange={e=>setEditUserData({...editUserData,courseId:e.target.value})} required>
                      <option value="">Select Course</option>
                      {courseOptions.map(c=><option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>)}
                    </select>
                  </div>
                )}
                {(editUserData.userType==="teacher" || editUserData.userType==="faculty") && (
                  <div className="form-control">
                    <label className="label"><span className="label-text">Department *</span></label>
                    <select className="select select-bordered" value={editUserData.departmentId} onChange={e=>setEditUserData({...editUserData,departmentId:e.target.value})} required>
                      <option value="">Select Department</option>
                      {departmentOptions.map(d=><option key={d.id} value={d.id}>{d.department_name} ({d.department_code})</option>)}
                    </select>
                  </div>
                )}
                <div className="form-control">
                  <label className="label"><span className="label-text">Phone</span></label>
                  <input type="text" className="input input-bordered" value={editUserData.phone} onChange={e=>setEditUserData({...editUserData,phone:e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Date of Birth</span></label>
                  <input type="date" className="input input-bordered" value={editUserData.dateOfBirth} onChange={e=>setEditUserData({...editUserData,dateOfBirth:e.target.value})} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Address</span></label>
                  <textarea className="textarea textarea-bordered" value={editUserData.address} onChange={e=>setEditUserData({...editUserData,address:e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={()=>setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
