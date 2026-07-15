import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthToken } from '../auth/useAuthToken'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthToken()
  const location = useLocation()

  if (isInitializing) {
    return <div className="text-center text-neutral-500 py-16">Verificando sesión…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}