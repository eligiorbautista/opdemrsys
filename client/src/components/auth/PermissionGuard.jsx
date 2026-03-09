import { usePermissions } from '../hooks/usePermissions'

/**
 * Component to conditionally render content based on permissions
 * @param {Object} permission - The permission to check
 * @param {React.ReactNode} children - Content to render if permission granted
 * @param {React.ReactNode} fallback - Content to render if permission denied
 */
function PermissionGuard({ permission, children, fallback = null }) {
  const { can } = usePermissions()

  if (!can(permission)) {
    return fallback
  }

  return children
}

/**
 * HOC (Higher-Order Component) to add permission checking to a component
 */
export function withPermission(WrappedComponent, permission) {
  return function PermissionProtectedComponent(props) {
    return (
      <PermissionGuard permission={permission}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Component to conditionally render content based on role
 */
export function RoleGuard({ roles, children, fallback = null }) {
  const { user } = usePermissions()

  if (!user || !roles.includes(user.role)) {
    return fallback
  }

  return children
}

export default PermissionGuard
