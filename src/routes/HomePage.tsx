import { Link } from 'react-router-dom'
import { useAuthToken } from '../auth/useAuthToken'

const FEATURES = [
  {
    title: 'Captura simple',
    description: 'Un video de 30-60 segundos desde tu celular es todo lo que necesitas.',
  },
  {
    title: 'IA de última generación',
    description: 'Gaussian Splatting y NeRF capturan reflejos y transparencias con realismo fotográfico.',
  },
  {
    title: 'Visor web nativo',
    description: 'Explora tu modelo 3D directamente en el navegador, a 60 FPS, sin instalar nada.',
  },
]

export function HomePage() {
  const { isAuthenticated, isInitializing } = useAuthToken()

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
        Convierte un video en un modelo 3D fotorrealista
      </h1>
      <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
        Sin fotogrametría tradicional, sin cientos de fotos. Solo un video corto y minutos de espera.
      </p>

      <div className="mt-8">
        {isInitializing ? (
          <div className="h-11 w-40 mx-auto rounded-lg bg-neutral-800 animate-pulse" />
        ) : (
          <Link
            to={isAuthenticated ? '/upload' : '/login'}
            className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
          >
            {isAuthenticated ? 'Crear mi modelo 3D' : 'Empezar gratis'}
          </Link>
        )}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
            <h3 className="font-medium text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-neutral-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}