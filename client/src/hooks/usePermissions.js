import { useAuth } from '../context/AuthContext'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  ROLES,
  PERMISSIONS
} from '../utils/permissions'

/**
 * Custom hook for accessing permission controls
 */
export function usePermissions() {
  const { user } = useAuth()

  /**
   * Check if the current user has a specific permission
   */
  const can = (permission) => {
    return hasPermission(user, permission)
  }

  /**
   * Check if the current user has any of the specified permissions
   */
  const canAny = (permissions) => {
    return hasAnyPermission(user, permissions)
  }

  /**
   * Check if the current user has all of the specified permissions
   */
  const canAll = (permissions) => {
    return hasAllPermissions(user, permissions)
  }

  /**
   * Check if the current user is a specific role
   */
  const isRole = (role) => {
    return user?.role === role
  }

  /**
   * Check if the current user is an admin
   */
  const isAdmin = () => isRole(ROLES.ADMIN)

  /**
   * Check if the current user is a doctor
   */
  const isDoctor = () => isRole(ROLES.DOCTOR)

  /**
   * Check if the current user is a nurse
   */
  const isNurse = () => isRole(ROLES.NURSE)

  return {
    user,
    can,
    canAny,
    canAll,
    isRole,
    isAdmin,
    isDoctor,
    isNurse,
    ROLES,
    PERMISSIONS
  }
}

export default usePermissions
