import { useState, useCallback } from 'react'
import { useTenantStore } from '../store/useTenantStore'
import { clearDraft } from './useTenantManager'
import { apiFetch } from '../lib/api'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

export function useSaveToServer() {
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null)
  const [error, setError] = useState(null)

  const publish = useCallback(async () => {
    const { advanced, exportToJson } = useTenantStore.getState()
    const tenantCode = advanced.tenantCode?.trim()

    if (!tenantCode) {
      setError('No hay tenant activo — crea uno antes de publicar')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
      return
    }

    setStatus('saving')
    setError(null)

    try {
      const json = exportToJson()
      const body = JSON.parse(json)

      const res = await apiFetch(`${SERVER_URL}/admin/tenant/${tenantCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      clearDraft(tenantCode)
      setLastSaved(new Date(data.savedAt))
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      const msg = err instanceof TypeError && err.message.includes('fetch')
        ? 'Servidor no disponible — ejecutá npm run dev:full'
        : (err.message ?? 'Error de red')
      setError(msg)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }, [])

  return { publish, status, lastSaved, error }
}
