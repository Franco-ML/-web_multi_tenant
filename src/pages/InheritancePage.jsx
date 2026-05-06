import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, Image, Palette, LayoutGrid, FileText, CreditCard, Settings,
  Globe2, Check, Info, ChevronRight, Lock,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'
import { useTenantStore } from '../store/useTenantStore'

const FONT_SORA = 'Sora, sans-serif'
const FONT_MONO = '"Space Mono", monospace'
const ACCENT    = '#E8175D'
const BLUE      = '#63B3ED'
const GREEN     = '#10B981'
const PURPLE    = '#B794F4'
const BORDER    = 'rgba(255,255,255,0.07)'
const PANEL_BG  = 'rgba(255,255,255,0.03)'

const MODULES = [
  { key: 'branding',       label: 'Identidad',        Icon: Image,      color: ACCENT,    desc: 'Logo, nombre y favicon' },
  { key: 'theme',          label: 'Colores',          Icon: Palette,    color: PURPLE,    desc: 'Paleta y modo claro/oscuro' },
  { key: 'features',       label: 'Funciones',        Icon: LayoutGrid, color: BLUE,      desc: 'Toggles de pantallas y módulos' },
  { key: 'login',          label: 'Login',            Icon: Lock,       color: GREEN,     desc: 'Métodos de inicio de sesión y PIN' },
  { key: 'documents',      label: 'Documentos',       Icon: FileText,   color: '#F6AD55', desc: 'Templates de documentos del país' },
  { key: 'paymentMethods', label: 'Métodos de pago',  Icon: CreditCard, color: '#FC8181', desc: 'Efectivo, tarjeta, billetera' },
  { key: 'advanced',       label: 'Avanzado',         Icon: Settings,   color: '#A0AEC0', desc: 'URLs, claves y entorno' },
]

// ¿Hacer que `targetId` herede de `sourceId` crearía un ciclo?
// Se camina la cadena de herencia desde sourceId hacia arriba; si toca targetId, hay ciclo.
function wouldCreateCycle(allCountries, targetId, sourceId) {
  if (sourceId === 'base' || !sourceId) return false
  if (sourceId === targetId) return true
  let current = sourceId
  const visited = new Set()
  while (current && current !== 'base') {
    if (current === targetId) return true
    if (visited.has(current)) return false  // hay ciclo previo en los datos, lo ignoramos
    visited.add(current)
    const c = allCountries.find(x => x.id === current)
    current = c?.inheritsFrom
  }
  return false
}

function cellState(country, moduleKey) {
  if (moduleKey === 'documents') {
    return country.documents && country.documents.length > 0 ? 'own' : 'inherit'
  }
  return country.moduleModes?.[moduleKey] ?? 'inherit'
}

// ─── Celda de la matriz ────────────────────────────────────────────────────────

function MatrixCell({ country, moduleKey, allCountries, onModeChange, onHover }) {
  const [open, setOpen] = useState(false)
  const state = cellState(country, moduleKey)
  const isOwn = state === 'own'
  const isDocs = moduleKey === 'documents'

  const source = country.inheritsFrom ?? 'base'
  const sourceCountry = source !== 'base' ? allCountries.find(c => c.id === source) : null

  function handleSelect(newMode) {
    onModeChange(country.id, moduleKey, newMode)
    setOpen(false)
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => onHover({ country, moduleKey, state })}
      onMouseLeave={() => onHover(null)}
    >
      <button
        onClick={() => !isDocs && setOpen(v => !v)}
        disabled={isDocs}
        title={isDocs ? 'La herencia de documentos se gestiona desde la página de Documentos' : undefined}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 10px', borderRadius: 8, cursor: isDocs ? 'not-allowed' : 'pointer',
          background: isOwn ? `${ACCENT}10` : 'rgba(255,255,255,0.02)',
          border: isOwn ? `1px solid ${ACCENT}40` : `1px solid ${BORDER}`,
          opacity: isDocs ? 0.7 : 1,
          transition: 'all 0.15s',
        }}
      >
        {isOwn ? (
          <>
            <FlagImage code={country.countryCode} size={14} style={{ height: 10, borderRadius: 2 }} />
            <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: ACCENT, fontWeight: 700 }}>propia</span>
          </>
        ) : (
          <>
            {sourceCountry
              ? <FlagImage code={sourceCountry.countryCode} size={14} style={{ height: 10, borderRadius: 2, opacity: 0.85 }} />
              : <Globe2 size={11} color="rgba(255,255,255,0.6)" />
            }
            <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.55)' }}>
              {sourceCountry ? sourceCountry.countryCode : 'base'}
            </span>
          </>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 11,
            background: '#0D1017', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)', minWidth: 200,
          }}>
            <button onClick={() => handleSelect('inherit')} style={menuItemStyle(state === 'inherit')}
              onMouseEnter={e => { if (state !== 'inherit') e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (state !== 'inherit') e.currentTarget.style.background = 'transparent' }}>
              {sourceCountry
                ? <FlagImage code={sourceCountry.countryCode} size={11} style={{ height: 8, borderRadius: 1 }} />
                : <Globe2 size={11} color={state === 'inherit' ? ACCENT : 'rgba(255,255,255,0.5)'} />}
              <span>Heredar de {sourceCountry ? sourceCountry.name : 'base'}</span>
              {state === 'inherit' && <Check size={11} color={ACCENT} style={{ marginLeft: 'auto' }} />}
            </button>
            <button onClick={() => handleSelect('own')} style={menuItemStyle(state === 'own')}
              onMouseEnter={e => { if (state !== 'own') e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (state !== 'own') e.currentTarget.style.background = 'transparent' }}>
              <FlagImage code={country.countryCode} size={11} style={{ height: 8, borderRadius: 1 }} />
              <span>Configuración propia</span>
              {state === 'own' && <Check size={11} color={ACCENT} style={{ marginLeft: 'auto' }} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function menuItemStyle(active) {
  return {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px', cursor: 'pointer',
    background: active ? `${ACCENT}15` : 'transparent',
    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: active ? ACCENT : 'rgba(255,255,255,0.75)',
    fontSize: 11, fontFamily: FONT_SORA, textAlign: 'left',
    transition: 'background 0.1s',
  }
}

// ─── Selector de fuente por país ───────────────────────────────────────────────

function SourceSelector({ country, allCountries, onChange }) {
  const [open, setOpen] = useState(false)
  const source = country.inheritsFrom ?? 'base'
  const sourceCountry = source !== 'base' ? allCountries.find(c => c.id === source) : null

  // Países que generarían un ciclo si este país heredara de ellos
  const candidates = allCountries
    .filter(c => c.id !== country.id)
    .map(c => ({ ...c, wouldCycle: wouldCreateCycle(allCountries, country.id, c.id) }))

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
          color: 'rgba(255,255,255,0.55)', fontSize: 9, fontFamily: FONT_MONO,
        }}
      >
        {sourceCountry
          ? <FlagImage code={sourceCountry.countryCode} size={11} style={{ height: 8, borderRadius: 1 }} />
          : <Globe2 size={9} />
        }
        <span>hereda de {sourceCountry ? sourceCountry.name : 'base'}</span>
        <ChevronRight size={9} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 11,
            background: '#0D1017', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, overflow: 'hidden', minWidth: 240,
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
          }}>
            <button onClick={() => { onChange(country.id, 'base'); setOpen(false) }} style={menuItemStyle(source === 'base')}
              onMouseEnter={e => { if (source !== 'base') e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (source !== 'base') e.currentTarget.style.background = 'transparent' }}>
              <Globe2 size={11} />
              <span>Configuración base</span>
              {source === 'base' && <Check size={11} color={ACCENT} style={{ marginLeft: 'auto' }} />}
            </button>
            {candidates.map(c => {
              const disabled = c.wouldCycle
              return (
                <button
                  key={c.id}
                  onClick={() => { if (!disabled) { onChange(country.id, c.id); setOpen(false) } }}
                  disabled={disabled}
                  title={disabled ? `${c.name} hereda (directa o indirectamente) de ${country.name}, eso crearía un ciclo` : undefined}
                  style={{
                    ...menuItemStyle(source === c.id),
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                  }}
                  onMouseEnter={e => { if (!disabled && source !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!disabled && source !== c.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <FlagImage code={c.countryCode} size={11} style={{ height: 8, borderRadius: 1 }} />
                  <span>{c.name}</span>
                  {disabled && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 7, padding: '2px 5px', borderRadius: 3,
                      background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.2)',
                      color: 'rgba(255,180,0,0.8)', fontFamily: FONT_MONO, fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}>
                      ciclo
                    </span>
                  )}
                  {!disabled && source === c.id && <Check size={11} color={ACCENT} style={{ marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Panel explicativo ─────────────────────────────────────────────────────────

function ExplanationPanel({ hover, allCountries }) {
  if (!hover) {
    return (
      <div style={{
        padding: '14px 18px', borderRadius: 12,
        background: PANEL_BG, border: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Info size={14} color="rgba(255,255,255,0.35)" />
        <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)' }}>
          Pasá el mouse sobre cualquier celda para ver la explicación. Hacé clic para cambiar la herencia.
        </span>
      </div>
    )
  }

  const { country, moduleKey, state } = hover
  const moduleMeta = MODULES.find(m => m.key === moduleKey)
  const ModuleIcon = moduleMeta.Icon

  const sourceCountry = country.inheritsFrom && country.inheritsFrom !== 'base'
    ? allCountries.find(c => c.id === country.inheritsFrom)
    : null

  let message = ''
  if (state === 'own') {
    message = `${country.name} usa su propia configuración de ${moduleMeta.label.toLowerCase()}. Los cambios que hagas en ${sourceCountry ? sourceCountry.name : 'la configuración base'} no afectan a este país.`
  } else {
    const sourceLabel = sourceCountry ? sourceCountry.name : 'la configuración base del tenant'
    message = `${country.name} hereda ${moduleMeta.label.toLowerCase()} de ${sourceLabel}. Si ${sourceCountry ? sourceCountry.name : 'la base'} cambia, este país se actualiza automáticamente.`
  }

  return (
    <motion.div
      key={`${country.id}-${moduleKey}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        padding: '14px 18px', borderRadius: 12,
        background: PANEL_BG, border: `1px solid ${moduleMeta.color}30`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `${moduleMeta.color}15`, border: `1px solid ${moduleMeta.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ModuleIcon size={14} color={moduleMeta.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <FlagImage code={country.countryCode} size={14} style={{ height: 10, borderRadius: 2 }} />
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.9)' }}>
            {country.name}
          </span>
          <ChevronRight size={11} color="rgba(255,255,255,0.3)" />
          <span style={{ fontSize: 11, fontFamily: FONT_SORA, color: moduleMeta.color, fontWeight: 600 }}>
            {moduleMeta.label}
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: 8, padding: '2px 7px', borderRadius: 4,
            fontFamily: FONT_MONO, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: state === 'own' ? `${ACCENT}15` : 'rgba(255,255,255,0.05)',
            color: state === 'own' ? ACCENT : 'rgba(255,255,255,0.5)',
          }}>
            {state === 'own' ? 'Override' : 'Heredado'}
          </span>
        </div>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
          {message}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InheritancePage() {
  const countryConfigs        = useTenantStore(s => s.countryConfigs)
  const setCountryModuleMode  = useTenantStore(s => s.setCountryModuleMode)
  const setCountryInheritance = useTenantStore(s => s.setCountryInheritance)

  const [hover, setHover] = useState(null)

  const rows = useMemo(() => [
    { id: 'base', isBase: true, name: 'Config base', countryCode: null },
    ...countryConfigs,
  ], [countryConfigs])

  function handleModeChange(countryId, moduleKey, newMode) {
    if (moduleKey === 'documents') return
    setCountryModuleMode(countryId, moduleKey, newMode)
  }

  function handleSourceChange(countryId, newSource) {
    if (newSource !== 'base' && wouldCreateCycle(countryConfigs, countryId, newSource)) {
      console.warn('[Herencias] cambio bloqueado: crearía un ciclo', { countryId, newSource })
      return
    }
    setCountryInheritance(countryId, newSource)
  }

  if (countryConfigs.length === 0) {
    return (
      <div>
        <PageHeader title="Herencias" subtitle="Cómo cada país hereda configuración" icon={GitBranch} />
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14,
        }}>
          <GitBranch size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
            Sin países configurados
          </div>
          <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.25)' }}>
            Agregá al menos un país desde la sección "Países" para ver las herencias
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Herencias" subtitle="Visualizá y modificá cómo cada país hereda configuración del tenant" icon={GitBranch} />

      <div style={{
        background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14,
        overflow: 'auto', marginBottom: 14,
      }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 820 }}>
          <thead>
            <tr>
              <th style={headerCellStyle(true)}>Contexto</th>
              {MODULES.map(m => {
                const Icon = m.Icon
                return (
                  <th key={m.key} style={headerCellStyle(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Icon size={11} color={m.color} />
                      <span style={{ color: 'rgba(255,255,255,0.55)' }}>{m.label}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isBase = row.isBase
              const isLast = idx === rows.length - 1
              return (
                <tr key={row.id}>
                  <td style={rowHeaderStyle(isLast)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {isBase ? (
                        <div style={{
                          width: 22, height: 16, borderRadius: 3, flexShrink: 0,
                          background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Globe2 size={10} color="rgba(255,255,255,0.55)" />
                        </div>
                      ) : (
                        <FlagImage code={row.countryCode} size={22} style={{ height: 16, borderRadius: 3, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.85)' }}>
                          {row.name}
                        </div>
                        {!isBase && (
                          <div style={{ marginTop: 3 }}>
                            <SourceSelector country={row} allCountries={countryConfigs} onChange={handleSourceChange} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {MODULES.map(m => (
                    <td key={m.key} style={cellStyle(isLast)}>
                      {isBase ? (
                        <div style={{
                          padding: '8px 10px', borderRadius: 8, textAlign: 'center',
                          background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
                          fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)', fontWeight: 700,
                        }}>
                          fuente
                        </div>
                      ) : (
                        <MatrixCell
                          country={row}
                          moduleKey={m.key}
                          allCountries={countryConfigs}
                          onModeChange={handleModeChange}
                          onHover={setHover}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence mode="wait">
        <ExplanationPanel hover={hover} allCountries={countryConfigs} />
      </AnimatePresence>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14, padding: '0 4px' }}>
        <Legend color={ACCENT}                bg={`${ACCENT}10`}        label="Configuración propia (override)" />
        <Legend color="rgba(255,255,255,0.5)" bg="rgba(255,255,255,0.02)" label="Heredado de la fuente" />
        <Legend color="rgba(255,255,255,0.4)" bg="rgba(255,255,255,0.02)" label="Es la fuente original" />
      </div>
    </div>
  )
}

function Legend({ color, bg, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: `1px solid ${color}40` }} />
      <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  )
}

const headerCellStyle = (sticky) => ({
  position: sticky ? 'sticky' : 'static',
  left: sticky ? 0 : 'auto',
  zIndex: sticky ? 2 : 1,
  background: '#0a0d13',
  padding: '10px 10px',
  fontSize: 9, fontWeight: 700, fontFamily: FONT_MONO,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${BORDER}`,
  textAlign: sticky ? 'left' : 'center',
  width: sticky ? 180 : undefined,
  minWidth: sticky ? 180 : 96,
})

const rowHeaderStyle = (isLast) => ({
  position: 'sticky',
  left: 0,
  background: '#0a0d13',
  padding: '10px 12px',
  borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
  borderRight: `1px solid ${BORDER}`,
  width: 180, minWidth: 180, verticalAlign: 'top',
})

const cellStyle = (isLast) => ({
  padding: '6px 7px',
  borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
  verticalAlign: 'top',
})
