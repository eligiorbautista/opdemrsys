import { useState, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import Dialog from '../components/ui/Dialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
import {
  FaUsers,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaUser,
  FaLock,
  FaUnlock,
  FaCheck,
  FaEye,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserMd,
  FaUserNurse,
  FaStethoscope,
  FaHistory,
  FaShieldAlt,
  FaFileAlt,
  FaDownload,
  FaFilter,
  FaCalendar,
  FaEyeSlash
} from 'react-icons/fa'

function Admin() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'users'
  })
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [resetUser, setResetUser] = useState(null)
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [currentUser, setCurrentUser] = useState(null)
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' })

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    loadCurrentUser()
    loadData()
  }, [activeTab])

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.user) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (activeTab === 'users') {
        const response = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.data) setUsers(data.data)
      } else if (activeTab === 'audit') {
        const response = await fetch(`${API_URL}/audit`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.data) setAuditLogs(data.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDeactivate = (user) => {
    setDialog({
      isOpen: true,
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`,
      type: 'warning',
      onConfirm: () => executeDeactivate(user)
    })
  }

  const executeDeactivate = async (user) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${user.id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to deactivate user')
        return
      }

      toast.success('User deactivated successfully')
      loadData()
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      toast.error('Failed to deactivate user')
    }
  }

  const handleActivate = (user) => {
    setDialog({
      isOpen: true,
      title: 'Activate User',
      message: `Are you sure you want to activate ${user.firstName} ${user.lastName}?`,
      type: 'info',
      onConfirm: () => executeActivate(user)
    })
  }

  const executeActivate = async (user) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${user.id}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to activate user')
        return
      }

      toast.success('User activated successfully')
      loadData()
    } catch (error) {
      console.error('Failed to activate user:', error)
      toast.error('Failed to activate user')
    }
  }

  const handleResetPassword = (user) => {
    setResetUser(user)
    setShowResetPasswordModal(true)
  }

  const executeResetPassword = async (newPassword) => {
    if (!resetUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${resetUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to reset password')
        return
      }

      toast.success('Password reset successfully')
      setShowResetPasswordModal(false)
      setResetUser(null)
    } catch (error) {
      console.error('Failed to reset password:', error)
      toast.error('Failed to reset password')
    }
  }

  const handleView = (user) => {
    setViewingUser(user)
    setShowViewModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || user.role === filter
    return matchesSearch && matchesFilter
  })

  const tabs = [
    { id: 'users', label: 'User Management', icon: FaUsers, count: users.length },
    { id: 'audit', label: 'Audit Trails', icon: FaHistory, count: auditLogs.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">System administration and management</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <FaUsers />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Doctors</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.filter(u => u.role === 'DOCTOR').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <FaUserMd />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Nurses</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.filter(u => u.role === 'NURSE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <FaUserNurse />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Audit Logs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{auditLogs.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <FaShieldAlt />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4 -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <UsersTab
          users={filteredUsers}
          loading={loading}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onAddUser={() => setShowUserModal(true)}
          onRefresh={loadData}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onView={handleView}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'audit' && (
        <AuditTab
          logs={auditLogs}
          loading={loading}
        />
      )}

      {/* Modal */}
      {showUserModal && (
        <UserFormModal
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            setShowUserModal(false)
            loadData()
          }}
        />
      )}

      {showEditModal && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingUser(null)
            loadData()
          }}
        />
      )}

      {showViewModal && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => {
            setShowViewModal(false)
            setViewingUser(null)
          }}
          onResetPassword={handleResetPassword}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => {
            setShowResetPasswordModal(false)
            setResetUser(null)
          }}
          onConfirm={executeResetPassword}
        />
      )}

      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  )
}

function UsersTab({ users, loading, search, setSearch, filter, setFilter, onAddUser, onRefresh, onEdit, onDeactivate, onActivate, onView, currentUser }) {
  return (
    <div className="card">
      <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="section-title mb-0">System Users</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input py-1.5 text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctors</option>
            <option value="NURSE">Nurses</option>
            <option value="CLINIC">Clinic Staff</option>
            <option value="STUDENT">Students</option>
          </select>
          <button onClick={onAddUser} className="btn-primary py-1.5 text-sm inline-flex items-center gap-1.5 whitespace-nowrap">
            <FaPlus className="text-xs" /> Add User
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-2xl text-primary-600" />
        </div>
      ) : users.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department/Specialization</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        {user.role === 'DOCTOR' ? <FaUserMd /> : 
                         user.role === 'NURSE' ? <FaUserNurse /> : <FaUser />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'ADMIN' ? 'badge-danger' :
                      user.role === 'DOCTOR' ? 'badge-info' :
                      user.role === 'NURSE' ? 'badge-success' : 'badge-neutral'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.role === 'DOCTOR' && (
                      <div>
                        <p className="text-slate-900">{user.specialization || 'General'}</p>
                        {user.department && <p className="text-sm text-slate-500">{user.department}</p>}
                      </div>
                    )}
                    {user.role === 'NURSE' && (
                      <div>
                        <p className="text-slate-900">{user.certificationLevel || 'RN'}</p>
                        {user.department && <p className="text-sm text-slate-500">{user.department}</p>}
                      </div>
                    )}
                    {user.role === 'ADMIN' && (
                      <div>
                        <p className="text-slate-900">System</p>
                        <p className="text-sm text-slate-500">Administration</p>
                      </div>
                    )}
                    {user.role === 'STUDENT' && (
                      <div>
                        <p className="text-slate-900">{user.specialization || 'Student'}</p>
                        <p className="text-sm text-slate-500">{user.department || 'Clinical Training'}</p>
                      </div>
                    )}
                    {!user.role.match(/DOCTOR|NURSE|ADMIN|STUDENT/) && <span className="text-slate-400">--</span>}
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '--'}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onView(user)} className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition" title="View">
                        <FaEye />
                      </button>
                      <button onClick={() => onEdit(user)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary-600 transition" title="Edit">
                        <FaEdit />
                      </button>
                      {currentUser?.id !== user.id && (
                        user.isActive ? (
                          <button onClick={() => onDeactivate(user)} className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition" title="Deactivate">
                            <FaLock />
                          </button>
                        ) : (
                          <button onClick={() => onActivate(user)} className="p-2 hover:bg-emerald-50 rounded-lg text-slate-600 hover:text-emerald-600 transition" title="Activate">
                            <FaCheck />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="text-slate-400 text-2xl" />
          </div>
          <p className="text-slate-500">No users found</p>
        </div>
      )}
    </div>
  )
}

function AuditTab({ logs, loading }) {
  const [dateFilter, setDateFilter] = useState('today')
  const [actionFilter, setActionFilter] = useState('ALL')

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'text-emerald-600 bg-emerald-50',
      UPDATE: 'text-blue-600 bg-blue-50',
      DELETE: 'text-red-600 bg-red-50',
      LOGIN: 'text-purple-600 bg-purple-50',
      LOGOUT: 'text-slate-600 bg-slate-50',
      VIEW: 'text-slate-600 bg-slate-50'
    }
    return colors[action] || 'text-slate-600 bg-slate-50'
  }

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false
    return true
  })

  return (
    <div className="card">
      <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="section-title mb-0">Audit Trail</h2>
        <div className="flex gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input py-1.5 text-sm"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="VIEW">View</option>
          </select>
          <button className="btn-secondary py-1.5 text-sm">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <FaCalendar />
          <span>Showing all activity logs for compliance tracking</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-2xl text-primary-600" />
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {filteredLogs.slice(0, 50).map((log, index) => (
            <div key={log.id || index} className="p-4 hover:bg-slate-50 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                    {log.action === 'CREATE' && <FaPlus />}
                    {log.action === 'UPDATE' && <FaEdit />}
                    {log.action === 'DELETE' && <FaTrash />}
                    {log.action === 'LOGIN' && <FaLock />}
                    {log.action === 'VIEW' && <FaSearch />}
                    {!['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'VIEW'].includes(log.action) && <FaFileAlt />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {log.user?.firstName} {log.user?.lastName}
                      </p>
                      <span className={`badge ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{log.description || `${log.resourceType} ${log.action?.toLowerCase()}`}</p>
                    {log.resourceType && (
                      <p className="text-xs text-slate-400 mt-1">
                        Resource: {log.resourceType} {log.resourceId && `#${log.resourceId.slice(0, 8)}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '--'}</p>
                  {log.ipAddress && <p className="text-xs">IP: {log.ipAddress}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHistory className="text-slate-400 text-2xl" />
          </div>
          <p className="text-slate-500">No audit logs found</p>
          <p className="text-sm text-slate-400 mt-1">Activity will be tracked here</p>
        </div>
      )}
    </div>
  )
}

function UserFormModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'DOCTOR',
    specialization: '',
    licenseNumber: '',
    department: '',
    consultationFee: '',
    yearsExperience: '',
    nursingLicense: '',
    certificationLevel: '',
    shiftType: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const data = {
        ...formData,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMsg = result.error || result.errors?.[0]?.msg || 'Failed to create user'
        toast.error(errorMsg)
        return
      }

      toast.success('User created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Add New User</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="input"
              >
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="CLINIC">Clinic Staff</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="0912 345 6789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="input"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="input"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="input"
                placeholder="Minimum 8 characters"
                required
                minLength="8"
              />
            </div>
          </div>

          {formData.role === 'DOCTOR' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Doctor Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Anesthesiology">Anesthesiology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Outpatient">Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Consultation Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => handleChange('consultationFee', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'NURSE' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Nurse Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                  <input
                    type="text"
                    value={formData.nursingLicense}
                    onChange={(e) => handleChange('nursingLicense', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Outpatient">Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Certification Level</label>
                  <select
                    value={formData.certificationLevel}
                    onChange={(e) => handleChange('certificationLevel', e.target.value)}
                    className="input"
                  >
                    <option value="">Select</option>
                    <option value="RN">RN</option>
                    <option value="BSN">BSN</option>
                    <option value="MSN">MSN</option>
                    <option value="NP">NP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => handleChange('shiftType', e.target.value)}
                    className="input"
                  >
                    <option value="">Select</option>
                    <option value="DAY">Day</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                    <option value="ROTATING">Rotating</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <FaSpinner className="animate-spin" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    role: user.role || 'DOCTOR',
    specialization: user.specialization || '',
    licenseNumber: user.licenseNumber || '',
    department: user.department || '',
    consultationFee: user.consultationFee?.toString() || '',
    yearsExperience: user.yearsExperience?.toString() || '',
    nursingLicense: user.nursingLicense || '',
    certificationLevel: user.certificationLevel || '',
    shiftType: user.shiftType || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const data = {
        ...formData,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to update user')
        return
      }

      toast.success('User updated successfully!')
      onSuccess()
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="input"
              >
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="CLINIC">Clinic Staff</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="0912 345 6789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="input"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="input"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input"
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          {formData.role === 'DOCTOR' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Doctor Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Anesthesiology">Anesthesiology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Outpatient">Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Consultation Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => handleChange('consultationFee', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'NURSE' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Nurse Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                  <input
                    type="text"
                    value={formData.nursingLicense}
                    onChange={(e) => handleChange('nursingLicense', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Outpatient">Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Certification Level</label>
                  <select
                    value={formData.certificationLevel}
                    onChange={(e) => handleChange('certificationLevel', e.target.value)}
                    className="input"
                  >
                    <option value="">Select</option>
                    <option value="RN">RN</option>
                    <option value="BSN">BSN</option>
                    <option value="MSN">MSN</option>
                    <option value="NP">NP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => handleChange('shiftType', e.target.value)}
                    className="input"
                  >
                    <option value="">Select</option>
                    <option value="DAY">Day</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                    <option value="ROTATING">Rotating</option>
                  </select>
                </div>
              </div>
            </div>
          )}

<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <FaSpinner className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ViewUserModal({ user, onClose, onResetPassword }) {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
          <button onClick={onClose} className="p-1.5 hover-bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
              <FaUser className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{user.firstName} {user.lastName}</h3>
              <p className="text-slate-500">{user.email}</p>
              <span className={`badge ${
                user.role === 'ADMIN' ? 'badge-danger' :
                user.role === 'DOCTOR' ? 'badge-info' :
                user.role === 'NURSE' ? 'badge-success' : 'badge-neutral'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900">{user.phone || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-sm text-slate-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '--'}</p>
                </div>
              </div>
            </div>

            {user.role === 'DOCTOR' && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Doctor Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Specialization</p>
                    <p className="text-sm text-slate-900">{user.specialization || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-sm text-slate-900">{user.department || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">License Number</p>
                    <p className="text-sm text-slate-900">{user.licenseNumber || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Consultation Fee</p>
                    <p className="text-sm text-slate-900">{user.consultationFee ? `PHP ${user.consultationFee}` : '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Years of Experience</p>
                    <p className="text-sm text-slate-900">{user.yearsExperience ? `${user.yearsExperience} years` : '--'}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'NURSE' && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Nurse Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-sm text-slate-900">{user.department || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">License Number</p>
                    <p className="text-sm text-slate-900">{user.nursingLicense || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Certification Level</p>
                    <p className="text-sm text-slate-900">{user.certificationLevel || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Shift</p>
                    <p className="text-sm text-slate-900">{user.shiftType || '--'}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'ADMIN' && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Admin Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-sm text-slate-900">System Administration</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'STUDENT' && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Student Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Specialization</p>
                    <p className="text-sm text-slate-900">{user.specialization || 'Student'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-sm text-slate-900">{user.department || '--'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {onResetPassword && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={() => onResetPassword(user)}
                className="w-full btn-secondary text-amber-600 hover:bg-amber-50 border-amber-200"
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResetPasswordModal({ user, onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least 1 number', met: /[0-9]/.test(password) }
  ]

  const strength = requirements.filter(r => r.met).length
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (strength < 4) {
      toast.error('Password does not meet all requirements')
      return
    }
    setSubmitting(true)
    await onConfirm(password)
    setSubmitting(false)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Reset Password</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              Resetting password for: <strong>{user.firstName} {user.lastName}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Confirm new password"
                required
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-slate-200 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-slate-200'}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${strength >= 4 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {strength > 0 ? strengthLabels[strength - 1] : 'Very Weak'}
                </span>
              </div>

              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`text-xs ${req.met ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {req.met ? <FaCheck /> : <FaTimes />}
                    </span>
                    <span className={`text-xs ${req.met ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting || strength < 4} className="btn-primary">
              {submitting ? <FaSpinner className="animate-spin" /> : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Admin