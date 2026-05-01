import { create } from 'zustand'

export const useSimulatorStore = create((set) => ({
  activeScreen: 'login',
  isNavigating: false,
  direction: 1,

  setActiveScreen: (screen) => {
    const order = ['login', 'home', 'routes', 'onboarding', 'profile']
    set((state) => {
      const currentIdx = order.indexOf(state.activeScreen)
      const nextIdx = order.indexOf(screen)
      return {
        activeScreen: screen,
        isNavigating: true,
        direction: nextIdx >= currentIdx ? 1 : -1,
      }
    })
    setTimeout(() => set({ isNavigating: false }), 400)
  },
}))
