import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import {
  FaUsers,
  FaStethoscope,
  FaUserNurse,
  FaClipboardList,
  FaChartBar,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHeartbeat,
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaCog,
  FaUserShield
} from 'react-icons/fa'

function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const userMenuRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { to: '/', label: 'Dashboard', icon: FaChartLine },
    { to: '/patients', label: 'Patients', icon: FaUsers },
    { to: '/consultation', label: 'Consultation', icon: FaStethoscope, roles: ['DOCTOR', 'ADMIN'] },
    { to: '/nurse', label: 'Nurse', icon: FaUserNurse, roles: ['NURSE', 'ADMIN'] },
    { to: '/queue', label: 'Queue', icon: FaClipboardList, roles: ['DOCTOR', 'NURSE', 'CLINIC', 'ADMIN'] },
    { to: '/admin', label: 'Admin', icon: FaUserShield, roles: ['ADMIN'] }
  ]

  const filteredNavItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  )

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700'
      case 'DOCTOR': return 'bg-blue-100 text-blue-700'
      case 'NURSE': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FaHeartbeat className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">OPD EMR</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`text-base ${isActive(item.to) ? 'text-primary-600' : ''}`} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Date/Time Display */}
            <div className="text-right hidden xl:block">
              <p className="text-sm font-semibold text-slate-900">
                {currentDate.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {currentDate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  userMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  {user?.firstName ? `${user.firstName}` : 'User'}
                </span>
                {userMenuOpen ? (
                  <FaChevronUp className="text-slate-400 text-xs" />
                ) : (
                  <FaChevronDown className="text-slate-400 text-xs" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-soft-lg border border-slate-100 py-2 animate-fade-in">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
                        {getInitials()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.email}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(user?.role)}`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FaCog className="text-base" />
                      <span>Account Settings</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="text-base" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes className="text-slate-600" /> : <FaBars className="text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100">
            <nav className="space-y-1">
              {filteredNavItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon className={`text-lg ${isActive(item.to) ? 'text-primary-600' : ''}`} />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-slate-100 my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header