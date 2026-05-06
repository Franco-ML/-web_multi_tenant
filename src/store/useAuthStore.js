import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,   // { id, username, email, rol: { id, name, level }, tenants: [] }

      setUser: (user) => set({ user }),

      logout: () => set({ user: null }),

      isAuthenticated: () => {
        // Se llama como función para evitar stale closures
        return useAuthStore.getState().user !== null
      },
    }),
    {
      name: 'mensajeros-config-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
)
