import { useState, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaShieldAlt,
  FaBell,
  FaCog,
  FaCheck,
  FaTimes
} from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      setSubmitting(false)
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      setSubmitting(false)
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least 1 uppercase letter')
      setSubmitting(false)
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error('Password must contain at least 1 lowercase letter')
      setSubmitting(false)
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least 1 number')
      setSubmitting(false)
      return
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      setSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to change password')
        setSubmitting(false)
        return
      }

      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Change password error:', error)
      toast.error('Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  const getPasswordStrength = (password) => {
    let met = 0
    if (password.length >= 8) met++
    if (/[A-Z]/.test(password)) met++
    if (/[a-z]/.test(password)) met++
    if (/[0-9]/.test(password)) met++
    return met
  }

  const getStrengthPercentage = (password) => {
    return (getPasswordStrength(password) / 4) * 100
  }

  const getStrengthColor = (password) => {
    const strength = getPasswordStrength(password)
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']
    return colors[strength - 1] || 'bg-slate-200'
  }

  const getStrengthLabel = (password) => {
    const strength = getPasswordStrength(password)
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong']
    return strength > 0 ? labels[strength - 1] : 'Very Weak'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'DOCTOR': return 'bg-blue-100 text-blue-800'
      case 'NURSE': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-primary-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
            <FaCog className="text-lg" />
          </div>
          <div>
            <h1 className="page-title">Account Settings</h1>
            <p className="page-subtitle">Manage your profile and security preferences</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                  <FaUser className="text-4xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{user?.firstName} {user?.lastName}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <FaEnvelope className="text-slate-400 w-5" />
                  <span className="text-slate-600 truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <FaPhone className="text-slate-400 w-5" />
                    <span className="text-slate-600">{user?.phone}</span>
                  </div>
                )}
                {user?.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <FaBuilding className="text-slate-400 w-5" />
                    <span className="text-slate-600">{user?.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-slate-400" />
                <h2 className="section-title mb-0">Change Password</h2>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FaLock className="text-sm" />
                    </span>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FaLock className="text-sm" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="Enter new password"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-slate-200 rounded overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor(newPassword)}`}
                            style={{ width: `${getStrengthPercentage(newPassword)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getStrengthLabel(newPassword) !== 'Very Weak' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {getStrengthLabel(newPassword)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {[
                          { label: 'At least 8 characters', met: newPassword.length >= 8 },
                          { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(newPassword) },
                          { label: 'At least 1 lowercase letter', met: /[a-z]/.test(newPassword) },
                          { label: 'At least 1 number', met: /[0-9]/.test(newPassword) }
                        ].map((req, index) => (
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FaLock className="text-sm" />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`input pl-10 pr-10 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || getPasswordStrength(newPassword) < 4}
                    className="btn-primary"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Updating Password...
                      </>
                    ) : (
                      <>
                        <FaShieldAlt /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-6">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FaIdCard className="text-slate-400" />
                <h2 className="section-title mb-0">Account Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Role</p>
                  <p className="font-medium text-slate-900">{user?.role}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${user?.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 sm:col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">User ID</p>
                  <p className="font-mono text-sm text-slate-900">{user?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  )
}

export default Settings