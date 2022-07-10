import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RequireRole({ roles }) {
  const { user } = useAuth()

  if (!roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
