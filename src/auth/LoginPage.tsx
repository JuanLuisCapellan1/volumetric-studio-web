import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from './loginSchema.ts'
import { useAuthToken } from './useAuthToken.ts'
import { InvalidCredentialsError } from './authApi.ts'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login } = useAuthToken()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      await login(values.email, values.password)

      // Si el usuario fue redirigido aquí desde una ruta protegida
      // (ej. intentó entrar a /models/123 sin sesión), lo devolvemos ahí.
      const state = location.state as LocationState | null
      const redirectTo = state?.from?.pathname ?? '/upload'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        setServerError(err.message)
      } else {
        setServerError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold text-center">Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm text-neutral-400 mb-1">
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-blue-500 outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-neutral-400 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-blue-500 outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-400">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-neutral-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-400 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}