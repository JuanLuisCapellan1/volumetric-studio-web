import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthToken } from '../auth/useAuthToken'

export function AppLayout() {
  const { isAuthenticated, isInitializing, logout } = useAuthToken()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          Estudio de Clonación Volumétrica
        </Link>

        {!isInitializing && (
          <nav>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}