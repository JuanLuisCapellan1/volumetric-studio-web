// src/api/client.ts
import axios from 'axios'
import { useAuthStore } from '../auth/authStore'
import { refreshAccessToken } from '../auth/authApi'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // envía la cookie HttpOnly en cada request
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Si ya hay un refresh en curso (varias requests fallaron a la vez),
      // todas esperan la MISMA promesa en vez de disparar refresh duplicados.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .then(({ accessToken }) => {
            useAuthStore.getState().setAccessToken(accessToken)
            return accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().setAccessToken(null)
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)