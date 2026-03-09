import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaUsers, FaCalendarCheck, FaStethoscope, FaClock, FaSpinner, FaPlus, FaUserPlus, FaClipboardList, FaFileMedical, FaArrowRight } from 'react-icons/fa'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsToday: 0,
    consultationsToday: 0,
    queueWaiting: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reports/daily-summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.report) {
        setStats(data.report.summary || data.report || {})
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { to: '/patients', label: 'Add Patient', icon: FaUserPlus, color: 'text-blue-600', hover: 'hover:bg-blue-50 hover:border-blue-200' },
    { to: '/consultation', label: 'Start Consultation', icon: FaStethoscope, color: 'text-purple-600', hover: 'hover:bg-purple-50 hover:border-purple-200' },
    { to: '/queue', label: 'Manage Queue', icon: FaClipboardList, color: 'text-amber-600', hover: 'hover:bg-amber-50 hover:border-amber-200' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-2xl text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's an overview of your system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Patients</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPatients || 0}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaUsers />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Visits Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.visitsToday || 0}</p>
            </div>
            <div className="stat-card-icon bg-emerald-50 text-emerald-600">
              <FaCalendarCheck />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Consultations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.consultationsToday || 0}</p>
            </div>
            <div className="stat-card-icon bg-purple-50 text-purple-600">
              <FaStethoscope />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Queue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.queueWaiting || 0}</p>
            </div>
            <div className="stat-card-icon bg-amber-50 text-amber-600">
              <FaClock />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title mb-0">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center justify-between p-3 rounded-lg border border-slate-200 ${action.hover} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 ${action.color}`}>
                    <action.icon />
                  </div>
                  <span className="font-medium text-slate-700">{action.label}</span>
                </div>
                <FaArrowRight className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title mb-0">Today's Overview</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FaUserPlus className="text-sm" />
                  </div>
                  <span className="text-sm text-slate-600">New Patients</span>
                </div>
                <span className="font-semibold text-slate-900">0</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <FaStethoscope className="text-sm" />
                  </div>
                  <span className="text-sm text-slate-600">Consultations</span>
                </div>
                <span className="font-semibold text-slate-900">{stats.consultationsToday || 0}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaFileMedical className="text-sm" />
                  </div>
                  <span className="text-sm text-slate-600">Prescriptions</span>
                </div>
                <span className="font-semibold text-slate-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="card bg-slate-900 text-white border-0">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">OPD EMR System</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-md">
                Your comprehensive outpatient department management system for efficient workflow and quality patient care.
              </p>
            </div>
            <button onClick={() => navigate('/patients')} className="btn bg-white text-slate-900 hover:bg-slate-100">
              <FaPlus />
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
