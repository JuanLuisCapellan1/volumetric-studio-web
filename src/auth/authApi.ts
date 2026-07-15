const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface LoginResponse {
  accessToken: string
  // el refreshToken NO viene en este JSON — el backend lo setea
  // directamente como Set-Cookie HttpOnly; el frontend nunca lo lee.
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos')
    this.name = 'InvalidCredentialsError'
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // imprescindible: permite que el navegador guarde/envíe la cookie HttpOnly
    body: JSON.stringify({ email, password }),
  })

  if (res.status === 401) throw new InvalidCredentialsError()
  if (!res.ok) throw new Error('No se pudo iniciar sesión. Intenta de nuevo.')

  return res.json()
}

export async function refreshAccessToken(): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // el navegador adjunta la cookie HttpOnly automáticamente
  })

  if (!res.ok) throw new Error('No se pudo renovar la sesión')
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // permite al backend invalidar/limpiar la cookie del refresh token
  })
}