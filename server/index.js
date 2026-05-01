import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dir, 'data')
const PORT = process.env.API_PORT ?? 3001

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function configPath(tenantCode) {
  return join(DATA_DIR, `tenant-${tenantCode}.json`)
}

function readConfig(tenantCode) {
  const path = configPath(tenantCode)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function writeConfig(tenantCode, config) {
  writeFileSync(configPath(tenantCode), JSON.stringify(config, null, 2), 'utf8')
}

// ─── Rutas ────────────────────────────────────────────────────────────────────

// Bootstrap — la app mobile consume este endpoint
// Headers: X-Tenant-Code: <code>
// Params:  ?tenant=<code>  &country=<CC>  (country es opcional — usa el principal si se omite)
app.get('/mobile/bootstrap', (req, res) => {
  const tenantCode = req.headers['x-tenant-code'] ?? req.query.tenant ?? req.query.tenantCode
  if (!tenantCode) {
    return res.status(400).json({ error: 'X-Tenant-Code header or ?tenant= param required' })
  }
  const config = readConfig(tenantCode)
  if (!config) {
    return res.status(404).json({ error: `Tenant "${tenantCode}" not found` })
  }

  const countryCode = req.query.country
  const countryConfigs = config.countryConfigs ?? config.countries ?? []

  const countryConfig = countryCode
    ? countryConfigs.find(c => c.countryCode === countryCode)
    : countryConfigs.find(c => c.isPrimary) ?? countryConfigs[0]

  if (!countryConfig || (!countryConfig.idTypes && !countryConfig.documents)) {
    return res.json(config)
  }

  // Merge: override documents e idTypes en el primer step de registro
  const mergedSteps = (config.registration?.steps ?? []).map((step, i) => {
    if (i !== 0) return step
    const mergedFields = step.fields.map(f =>
      f.key === 'identificationTypeId' && countryConfig.idTypes
        ? { ...f, options: countryConfig.idTypes }
        : f
    )
    return {
      ...step,
      fields:    mergedFields,
      documents: countryConfig.documents ?? step.documents,
    }
  })

  res.json({
    ...config,
    locale:       countryConfig,
    registration: { steps: mergedSteps },
  })
})

// Compatibilidad: ruta pública legacy (soporta tanto tenantCode como tenantId)
app.get('/public/tenant/config', (req, res) => {
  const tenantCode = req.query.tenantCode ?? req.query.tenantId
  if (!tenantCode) {
    return res.status(400).json({ error: 'tenantCode param required' })
  }
  const config = readConfig(tenantCode)
  if (!config) {
    return res.status(404).json({ error: `Tenant "${tenantCode}" not found` })
  }
  res.json(config)
})

// El admin web publica aquí
app.post('/admin/tenant/:tenantCode', (req, res) => {
  const { tenantCode } = req.params
  const config = req.body

  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'Invalid config body' })
  }

  writeConfig(tenantCode, { ...config, tenantCode })
  console.log(`[${new Date().toLocaleTimeString()}] ✓ Tenant "${tenantCode}" config saved`)
  res.json({ ok: true, tenantCode, savedAt: new Date().toISOString() })
})

// Lista de tenants guardados
app.get('/admin/tenants', (_req, res) => {
  try {
    const files = readdirSync(DATA_DIR)
      .filter(f => f.startsWith('tenant-') && f.endsWith('.json'))
    const tenants = files.map(f => {
      const code = f.replace('tenant-', '').replace('.json', '')
      try {
        const cfg = JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'))
        return {
          id:           code,
          code,
          name:         cfg.branding?.name ?? code,
          primaryColor: cfg.branding?.primaryColor ?? cfg.theme?.light?.primary ?? '#E8175D',
          countries:    cfg.countryConfigs ?? cfg.countries ?? [],
        }
      } catch {
        return { id: code, code, name: code, primaryColor: '#E8175D', countries: [] }
      }
    })
    res.json({ tenants })
  } catch {
    res.json({ tenants: [] })
  }
})

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, port: PORT }))

app.listen(PORT, () => {
  console.log(`\n  🚀 Moover Tenant API corriendo en http://localhost:${PORT}`)
  console.log(`     GET  /mobile/bootstrap  (X-Tenant-Code: <code>  o  ?tenant=<code>)`)
  console.log(`     GET  /public/tenant/config?tenantCode=<code>`)
  console.log(`     POST /admin/tenant/:tenantCode`)
  console.log(`     Datos en: ${DATA_DIR}\n`)
})
