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
  _hasHydrated: boolean
  setAuth: (token: string, teacher: Teacher) => void
  logout: () => void
  isAuthenticated: () => boolean
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      teacher: null,
      _hasHydrated: false,
      setAuth: (token, teacher) => set({ token, teacher }),
      logout: () => set({ token: null, teacher: null }),
      isAuthenticated: () => !!get().token,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
