import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  setAccessToken: (token: string | null) => void
}

// Deliberadamente SIN persist middleware — si persistiéramos a localStorage
// o sessionStorage, reintroduciríamos el riesgo de XSS que queremos evitar.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: token !== null }),
}))