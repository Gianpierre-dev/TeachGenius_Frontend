import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Teacher {
  id: string
  email: string
  name: string
}

interface AuthState {
  token: string | null
  teacher: Teacher | null
  setAuth: (token: string, teacher: Teacher) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      teacher: null,
      setAuth: (token, teacher) => set({ token, teacher }),
      logout: () => set({ token: null, teacher: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
)
