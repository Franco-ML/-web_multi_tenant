import { useState, useCallback, useEffect } from 'react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'
const DRAFT_PREFIX = 'moover-draft-'

function saveDraft(tenantCode, state) {
  if (!tenantCode) return
  try {
    const { branding, countryConfigs, theme, features, registration, advanced, i18n, login } = state
    localStorage.setItem(
      DRAFT_PREFIX + tenantCode,
      JSON.stringify({ branding: { ...branding, logoFile: null }, countryConfigs, theme, features, registration, advanced, i18n, login })
    )
  } catch {}
}

function loadDraft(tenantCode) {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + tenantCode)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearDraft(tenantCode) {
  try { localStorage.removeItem(DRAFT_PREFIX + tenantCode) } catch {}
}

// Lee todos los drafts locales del localStorage y los devuelve como lista de tenants
function getLocalDraftTenants() {
  const tenants = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(DRAFT_PREFIX)) continue
      const config = JSON.parse(localStorage.getItem(key) ?? 'null')
      if (!config) continue
      const code = key.slice(DRAFT_PREFIX.length)
      tenants.push({
        id:           code,
        code,
        name:         config.branding?.name ?? code,
        primaryColor: config.branding?.primaryColor ?? '#E8175D',
        countries:    config.countryConfigs ?? [],
        isDraft:      true,
      })
    }
  } catch {}
  return tenants
}

export function useTenantManager() {
  const [tenants, setTenants] = useState([])
  const [switching, setSwitching] = useState(false)

  const fetchTenants = useCallback(async () => {
    // Siempre incluir drafts locales y el tenant activo actual
    const localDrafts  = getLocalDraftTenants()
    const currentState = useTenantStore.getState()
    const currentCode  = currentState.advanced?.tenantCode

    // El tenant activo también debe estar en la lista, aunque no tenga draft aún
    const activeTenant = currentCode ? {
      id:           currentCode,
      code:         currentCode,
      name:         currentState.branding?.name ?? currentCode,
      primaryColor: currentState.branding?.primaryColor ?? '#E8175D',
      countries:    currentState.countryConfigs ?? [],
      isDraft:      true,
    } : null

    function merge(serverList) {
      const map = new Map()
      // Primero los del server (ya publicados)
      for (const t of serverList) map.set(t.code, { ...t, isDraft: false })
      // Drafts locales: si el server no lo tiene, lo agrega; si lo tiene, lo deja (ya publicado)
      for (const t of localDrafts) {
        if (!map.has(t.code)) map.set(t.code, t)
      }
      // Tenant activo: si no está en ningún lado, lo agrega
      if (activeTenant && !map.has(activeTenant.code)) {
        map.set(activeTenant.code, activeTenant)
      }
      return Array.from(map.values())
    }

    try {
      const res  = await fetch(`${SERVER_URL}/admin/tenants`)
      const data = await res.json()
      setTenants(merge(data.tenants ?? []))
    } catch {
      // Server caído: usar solo locales
      setTenants(merge([]))
    }
  }, [])

  useEffect(() => { fetchTenants() }, [fetchTenants])

  const switchTenant = useCallback(async (targetCode) => {
    const store = useTenantStore.getState()
    const currentCode = store.advanced.tenantCode

    if (currentCode) saveDraft(currentCode, store)

    const draft = loadDraft(targetCode)
    if (draft) {
      store.loadFromJson(draft)
      return
    }

    setSwitching(true)
    try {
      const res = await fetch(`${SERVER_URL}/public/tenant/config?tenantCode=${targetCode}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      store.loadFromJson(data)
    } catch {
      store.resetToDefaults()
      store.setAdvancedField('tenantCode', targetCode)
    }
    setSwitching(false)
  }, [])

  const createTenant = useCallback(({ id, name, countryCode }) => {
    const store = useTenantStore.getState()
    const currentCode = store.advanced.tenantCode

    if (currentCode) saveDraft(currentCode, store)

    store.resetToDefaults()
    store.setAdvancedField('tenantCode', id.trim())
    store.setBrandingField('name', name.trim())

    if (countryCode) {
      const cat = COUNTRY_CATALOG.find(c => c.countryCode === countryCode)
      if (cat) {
        store.setCountryConfigs([{ ...cat, isPrimary: true, idTypes: null, documents: null }])
      }
    }

    // Guardar draft inmediatamente para que aparezca en la lista sin publicar
    saveDraft(id.trim(), useTenantStore.getState())
  }, [])

  const forkTenant = useCallback(async (sourceCode, { id, name }) => {
    const store = useTenantStore.getState()
    const currentCode = store.advanced.tenantCode
    if (currentCode) saveDraft(currentCode, store)

    const sourceDraft = loadDraft(sourceCode)
    let sourceConfig = sourceDraft
    if (!sourceConfig) {
      try {
        const res = await fetch(`${SERVER_URL}/public/tenant/config?tenantCode=${sourceCode}`)
        if (res.ok) sourceConfig = await res.json()
      } catch {}
    }

    if (sourceConfig) {
      store.loadFromJson({
        ...sourceConfig,
        advanced: { ...sourceConfig.advanced, tenantCode: id.trim(), _setupComplete: true },
        branding:  { ...sourceConfig.branding,  name: name.trim() },
      })
    } else {
      store.resetToDefaults()
      store.setAdvancedField('tenantCode', id.trim())
      store.setBrandingField('name', name.trim())
    }

    // Guardar draft inmediatamente para que aparezca en la lista sin publicar
    saveDraft(id.trim(), useTenantStore.getState())
  }, [])

  return { tenants, switching, fetchTenants, switchTenant, createTenant, forkTenant }
}
