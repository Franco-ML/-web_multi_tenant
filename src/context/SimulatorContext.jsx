import { createContext, useContext } from 'react'
import { useTenantStore } from '../store/useTenantStore'

const SimulatorConfigContext = createContext(null)

const FALLBACK_I18N = {
  loginWelcome:  'Bienvenido',
  loginSubtitle: 'Ingresa para continuar',
  loginButton:   'Continuar',
  homeTitle:     'Inicio',
  tabHome:       'Inicio',
  routesTitle:   'Ruta',
  tabRoutes:     'Ruta',
  profileTitle:  'Perfil',
  tabProfile:    'Perfil',
  swipeToStart:  'Desliza para Iniciar Escaneo',
}

function resolveSimI18n(i18n) {
  if (!i18n?.translations) return FALLBACK_I18N
  const lang = i18n.defaultLang ?? 'es'
  const t = i18n.translations[lang] ?? i18n.translations['es'] ?? {}
  return { ...FALLBACK_I18N, ...t }
}

export function SimulatorConfigProvider({ children }) {
  const branding     = useTenantStore((s) => s.branding)
  const theme        = useTenantStore((s) => s.theme)
  const login        = useTenantStore((s) => s.login)
  const features     = useTenantStore((s) => s.features)
  const countries    = useTenantStore((s) => s.countryConfigs)
  const registration = useTenantStore((s) => s.registration)
  const i18nRaw      = useTenantStore((s) => s.i18n)
  const i18n         = resolveSimI18n(i18nRaw)
  const locale       = countries?.[0] ?? { countryCode: 'CR', currency: 'CRC', currencySymbol: '₡', phonePrefix: '+506', language: 'es-CR' }

  return (
    <SimulatorConfigContext.Provider value={{ branding, theme, login, features, i18n, locale, countries, registration }}>
      {children}
    </SimulatorConfigContext.Provider>
  )
}

export function useSimulatorConfig() {
  const ctx = useContext(SimulatorConfigContext)
  if (!ctx) throw new Error('useSimulatorConfig must be used inside SimulatorConfigProvider')
  return ctx
}
