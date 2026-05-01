import { useEffect } from 'react'
import { useTenantStore } from '../store/useTenantStore'

export function useCssVariables() {
  const colors = useTenantStore((s) => {
    const { colorMode, light, dark } = s.theme
    return (colorMode === 'dark' ? dark : light) ?? light
  })

  useEffect(() => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--sim-${cssKey}`, value)
    })
  }, [colors])
}
