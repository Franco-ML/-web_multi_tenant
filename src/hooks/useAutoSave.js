import { useEffect, useRef, useState } from 'react'
import { useTenantStore } from '../store/useTenantStore'
import { apiFetch } from '../lib/api'

const SERVER_URL  = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'
const DEBOUNCE_MS = 1500

/**
 * Suscribe a cambios del store y persiste al backend con debounce.
 * status: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
 */
export function useAutoSave() {
  const [status,    setStatus]    = useState('idle')
  const [lastSaved, setLastSaved] = useState(null)
  const [error,     setError]     = useState(null)

  const timeoutRef    = useRef(null)
  const isInitialRef  = useRef(true)
  const inFlightRef   = useRef(false)
  const lastPayloadRef = useRef(null)  // hash del último guardado, para evitar reenvíos sin cambio real

  useEffect(() => {
    const unsubscribe = useTenantStore.subscribe(() => {
      // No autosave en el primer render (solo en cambios reales)
      if (isInitialRef.current) {
        isInitialRef.current = false
        return
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(save, DEBOUNCE_MS)
    })

    return () => {
      unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function save() {
    if (inFlightRef.current) return  // evita pisar otro save en vuelo

    const state      = useTenantStore.getState()
    const tenantCode = state.advanced?.tenantCode?.trim()
    if (!tenantCode) return  // sin tenant, no hay qué guardar

    let body
    try {
      const json = state.exportToJson()
      body       = JSON.parse(json)
    } catch {
      return  // serialización rota
    }

    // Skip si el payload es idéntico al último guardado
    const payloadHash = JSON.stringify(body)
    if (payloadHash === lastPayloadRef.current) return

    inFlightRef.current = true
    setStatus('saving')
    setError(null)

    try {
      const res = await apiFetch(`${SERVER_URL}/admin/tenant/${tenantCode}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    payloadHash,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      lastPayloadRef.current = payloadHash
      setLastSaved(new Date(data.savedAt))
      setStatus('saved')
    } catch (err) {
      const isNetwork = err instanceof TypeError && /fetch/i.test(err.message)
      setError(isNetwork ? 'Servidor no disponible' : (err?.message ?? 'Error'))
      setStatus(isNetwork ? 'offline' : 'error')
    } finally {
      inFlightRef.current = false
    }
  }

  return { status, lastSaved, error }
}
