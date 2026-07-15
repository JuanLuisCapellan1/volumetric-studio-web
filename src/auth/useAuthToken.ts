import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from './authStore'
import { login as loginRequest, InvalidCredentialsError, refreshAccessToken, logout as logoutRequest } from './authApi'

interface UseAuthTokenResult {
  isAuthenticated: boolean
  isInitializing: boolean
  getAccessToken: () => string | null
  logout: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
}

export function useAuthToken(): UseAuthTokenResult {
  const { accessToken, isAuthenticated, setAccessToken } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const tokenRef = useRef(accessToken)
  tokenRef.current = accessToken

  useEffect(() => {
    let isMounted = true

    // Al cargar la app (F5, nueva pestaña), no hay access token en memoria
    // porque memoria = se pierde al refrescar. Intentamos renovarlo en
    // silencio usando la cookie HttpOnly, que sí sobrevive al refresh.
    refreshAccessToken()
      .then(({ accessToken }) => {
        if (isMounted) setAccessToken(accessToken)
      })
      .catch(() => {
        // No hay sesión válida — el usuario simplemente no está logueado.
        // No es un error que deba mostrarse.
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false)
      })

    return () => {
      isMounted = false
    }
  }, [setAccessToken])

  // getAccessToken como función (no el valor directo) para que quien la use
  // en un closure (como ChunkedUploader) siempre lea el valor más reciente,
  // no uno capturado en el momento de la creación del closure.
  const getAccessToken = useCallback(() => tokenRef.current, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await loginRequest(email, password)
      setAccessToken(accessToken)
    },
    [setAccessToken],
  )

  const logout = useCallback(async () => {
    await logoutRequest()
    setAccessToken(null)
  }, [setAccessToken])

  return { isAuthenticated, isInitializing, getAccessToken, logout, login }
}