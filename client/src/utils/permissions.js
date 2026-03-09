/**
 * Permission constants for Role-Based Access Control (RBAC)
 */

// Role permissions
export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  STUDENT: 'STUDENT',
  CLINIC: 'CLINIC'
}

// Permission categories
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Patients
  VIEW_PATIENTS: 'view_patients',
  CREATE_PATIENT: 'create_patient',
  EDIT_PATIENT: 'edit_patient',
  DELETE_PATIENT: 'delete_patient',

  // Consultations
  VIEW_CONSULTATIONS: 'view_consultations',
  CREATE_CONSULTATION: 'create_consultation',
  EDIT_CONSULTATION: 'edit_consultation',
  DELETE_CONSULTATION: 'delete_consultation',
  SIGN_CONSULTATION: 'sign_consultation',

  // Orders
  VIEW_LAB_ORDERS: 'view_lab_orders',
  CREATE_LAB_ORDERS: 'create_lab_orders',
  COMPLETE_LAB_ORDERS: 'complete_lab_orders',

  VIEW_NURSING_ORDERS: 'view_nursing_orders',
  CREATE_NURSING_ORDERS: 'create_nursing_orders',
  COMPLETE_NURSING_ORDERS: 'complete_nursing_orders',

  VIEW_PROCEDURE_ORDERS: 'view_procedure_orders',
  CREATE_PROCEDURE_ORDERS: 'create_procedure_orders',

  VIEW_REFERRALS: 'view_referrals',
  CREATE_REFERRALS: 'create_referrals',

  // Documentation
  VIEW_NURSE_DOCUMENTATION: 'view_nurse_documentation',
  CREATE_NURSE_DOCUMENTATION: 'create_nurse_documentation',
  EDIT_NURSE_DOCUMENTATION: 'edit_nurse_documentation',

  // Prescriptions
  VIEW_PRESCRIPTIONS: 'view_prescriptions',
  CREATE_PRESCRIPTION: 'create_prescription',
  EDIT_PRESCRIPTION: 'edit_prescription',

  // Queue
  VIEW_QUEUE: 'view_queue',
  MANAGE_QUEUE: 'manage_queue',

  // Admin
  VIEW_ADMIN: 'view_admin',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports'
}

// Role to Permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin gets all permissions

  [ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.CREATE_PATIENT,
    PERMISSIONS.EDIT_PATIENT,
    PERMISSIONS.DELETE_PATIENT,
    PERMISSIONS.VIEW_CONSULTATIONS,
    PERMISSIONS.CREATE_CONSULTATION,
    PERMISSIONS.EDIT_CONSULTATION,
    PERMISSIONS.DELETE_CONSULTATION,
    PERMISSIONS.SIGN_CONSULTATION,
    PERMISSIONS.VIEW_LAB_ORDERS,
    PERMISSIONS.CREATE_LAB_ORDERS,
    PERMISSIONS.VIEW_NURSING_ORDERS,
    PERMISSIONS.CREATE_NURSING_ORDERS,
    PERMISSIONS.VIEW_PROCEDURE_ORDERS,
    PERMISSIONS.CREATE_PROCEDURE_ORDERS,
    PERMISSIONS.VIEW_REFERRALS,
    PERMISSIONS.CREATE_REFERRALS,
    PERMISSIONS.VIEW_NURSE_DOCUMENTATION,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.CREATE_PRESCRIPTION,
    PERMISSIONS.EDIT_PRESCRIPTION,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.NURSE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CONSULTATIONS,
    PERMISSIONS.VIEW_LAB_ORDERS,
    PERMISSIONS.COMPLETE_LAB_ORDERS,
    PERMISSIONS.VIEW_NURSING_ORDERS,
    PERMISSIONS.CREATE_NURSING_ORDERS,
    PERMISSIONS.COMPLETE_NURSING_ORDERS,
    PERMISSIONS.VIEW_PROCEDURE_ORDERS,
    PERMISSIONS.VIEW_REFERRALS,
    PERMISSIONS.VIEW_NURSE_DOCUMENTATION,
    PERMISSIONS.CREATE_NURSE_DOCUMENTATION,
    PERMISSIONS.EDIT_NURSE_DOCUMENTATION,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.MANAGE_QUEUE
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CONSULTATIONS,
    PERMISSIONS.VIEW_LAB_ORDERS,
    PERMISSIONS.VIEW_NURSING_ORDERS,
    PERMISSIONS.VIEW_PROCEDURE_ORDERS,
    PERMISSIONS.VIEW_REFERRALS,
    PERMISSIONS.VIEW_NURSE_DOCUMENTATION,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.VIEW_QUEUE
  ],

  [ROLES.CLINIC]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CONSULTATIONS,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.VIEW_NURSE_DOCUMENTATION
  ]
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user) return false

  // Admin has all permissions
  if (user.role === ROLES.ADMIN) return true

  // Get permissions for the user's role
  const rolePermissions = ROLE_PERMISSIONS[user.role]

  // If no permissions defined for this role, deny access
  if (!rolePermissions) return false

  // Check if the permission exists in the role's permissions
  return rolePermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user, permissions) {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user, permissions) {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(user) {
  const items = []

  if (!user) return items

  switch (user.role) {
    case ROLES.ADMIN:
      items.push(
        { to: '/', label: 'Dashboard', icon: 'FaHome' },
        { to: '/patients', label: 'Patients', icon: 'FaUsers' },
        { to: '/consultation', label: 'Consultation', icon: 'FaStethoscope' },
        { to: '/nurse', label: 'Nurse', icon: 'FaUserNurse' },
        { to: '/queue', label: 'Queue', icon: 'FaClipboardList' },
        { to: '/admin', label: 'Admin', icon: 'FaUserShield' }
      )
      break

    case ROLES.DOCTOR:
      items.push(
        { to: '/', label: 'Dashboard', icon: 'FaHome' },
        { to: '/patients', label: 'Patients', icon: 'FaUsers' },
        { to: '/consultation', label: 'Consultation', icon: 'FaStethoscope' },
        { to: '/queue', label: 'Queue', icon: 'FaClipboardList' }
      )
      break

    case ROLES.NURSE:
      items.push(
        { to: '/', label: 'Dashboard', icon: 'FaHome' },
        { to: '/patients', label: 'Patients', icon: 'FaUsers' }
      )
      break

    case ROLES.STUDENT:
      items.push(
        { to: '/', label: 'Dashboard', icon: 'FaHome' },
        { to: '/patients', label: 'Patients', icon: 'FaUsers' }
      )
      break

    case ROLES.CLINIC:
      items.push(
        { to: '/', label: 'Dashboard', icon: 'FaHome' },
        { to: '/patients', label: 'Patients', icon: 'FaUsers' },
        { to: '/queue', label: 'Queue', icon: 'FaClipboardList' }
      )
      break

    default:
      // No access if role is unknown
      break
  }

  return items
}
