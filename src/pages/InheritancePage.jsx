import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, ChevronDown, ArrowUp, Layers, Sparkles, Check, AlertCircle } from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

// ─── Config de los 7 módulos ──────────────────────────────────────────────────

const MODULES = [
  { key: 'branding',     label: 'Identidad',  short: 'ID'  },
  { key: 'theme',        label: 'Tema',        short: 'TM'  },
  { key: 'features',     label: 'Módulos',     short: 'MD'  },
  { key: 'registration', label: 'Registro',    short: 'RG'  },
  { key: 'i18n',         label: 'Idiomas',     short: 'I18' },
  { key: 'login',        label: 'Login',       short: 'LG'  },
  { key: 'advanced',     label: 'Avanzado',    short: 'AV'  },
]

// inherit → override-base → custom → inherit
const MODE_CYCLE = { inherit: 'override-base', 'override-base': 'custom', custom: 'inherit' }

const MODE_CFG = {
  inherit: {
    label: 'Hereda',
    Icon: ArrowUp,
    color: 'rgba(255,255,255,0.25)',
    bg: 'rgba(255,255,255,0.02)',
    border: 'rgba(255,255,255,0.06)',
  },
  'override-base': {
    label: 'Override base',
    Icon: Layers,
    color: 'rgba(99,179,237,0.8)',
    bg: 'rgba(99,179,237,0.06)',
    border: 'rgba(99,179,237,0.2)',
  },
  custom: {
    label: 'Propio',
    Icon: Sparkles,
    color: 'rgba(232,23,93,0.9)',
    bg: 'rgba(232,23,93,0.07)',
    border: 'rgba(232,23,93,0.25)',
  },
}

// ─── ParentPicker ─────────────────────────────────────────────────────────────

function ParentPicker({ country, allCountries, onChangeParent }) {
  const [open, setOpen] = useState(false)
  const [cascade, setCascade] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const currentSource = country.inheritsFrom ?? 'own'
  const parentCountry = allCountries.find(c => c.id === currentSource)

  const label = currentSource === 'base'
    ? 'Base'
    : currentSource === null || currentSource === 'own'
      ? 'Propio'
      : (parentCountry?.name ?? parentCountry?.countryCode ?? '?')

  const isOwn = currentSource === null || currentSource === 'own'

  const options = [
    { value: 'base', label: 'Hereda base', sub: 'config del tenant' },
    ...allCountries
      .filter(c => c.id !== country.id && c.status === 'active')
      .map(c => ({ value: c.id, label: c.name ?? c.countryCode, sub: c.countryCode, flag: c.countryCode })),
    { value: 'own', label: 'Config propia', sub: 'sin herencia', accent: true },
  ]

  function pick(value) {
    const source = value === 'own' ? null : value
    onChangeParent(country.id, source, cascade)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
          background: isOwn ? 'rgba(232,23,93,0.1)' : 'rgba(255,255,255,0.06)',
          border: isOwn ? '1px solid rgba(232,23,93,0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: isOwn ? 'rgba(232,23,93,0.85)' : 'rgba(255,255,255,0.55)',
          fontSize: 8, fontFamily: 'Space Mono, monospace',
        }}
      >
        {!isOwn && currentSource !== 'base' && parentCountry && (
          <div style={{ width: 12, height: 9, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
            <FlagImage code={parentCountry.countryCode} size={12} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {!isOwn && <ArrowUp size={7} />}
        {label}
        <ChevronDown size={7} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 300,
              background: 'rgba(16,19,28,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9, minWidth: 200,
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => pick(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 12px', border: 'none',
                  background: opt.value === currentSource ? 'rgba(255,255,255,0.05)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = opt.value === currentSource ? 'rgba(255,255,255,0.05)' : 'transparent'}
              >
                {opt.flag && (
                  <div style={{ width: 16, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                    <FlagImage code={opt.flag} size={16} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: opt.accent ? '#E8175D' : 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>
                    {opt.sub}
                  </div>
                </div>
                {opt.value === currentSource && <Check size={10} color="rgba(255,255,255,0.5)" />}
              </button>
            ))}

            {/* Toggle cascada */}
            <div style={{
              padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <button
                onClick={() => setCascade(c => !c)}
                style={{
                  width: 28, height: 15, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: cascade ? '#E8175D' : 'rgba(255,255,255,0.1)',
                  position: 'relative', flexShrink: 0, transition: 'background 0.15s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, borderRadius: '50%', width: 11, height: 11,
                  background: '#fff', transition: 'left 0.15s ease',
                  left: cascade ? 15 : 2,
                }} />
              </button>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
                Cascada a hijos
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ModuleCell ───────────────────────────────────────────────────────────────

function ModuleCell({ mode, onClick, isBase }) {
  if (isBase) {
    return (
      <td style={baseCellStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Sparkles size={10} color="rgba(255,255,255,0.35)" />
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono, monospace' }}>fuente</span>
        </div>
      </td>
    )
  }

  const cfg = MODE_CFG[mode] ?? MODE_CFG.inherit
  const Icon = cfg.Icon

  return (
    <td style={{ ...cellStyle, background: cfg.bg, borderColor: 'transparent' }}>
      <button
        onClick={onClick}
        title={cfg.label}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '5px 8px', borderRadius: 5, width: '100%',
          transition: 'background 0.1s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Icon size={10} color={cfg.color} />
        <span style={{ fontSize: 7, color: cfg.color, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>
          {cfg.label}
        </span>
      </button>
    </td>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function InheritancePage() {
  const tenantCode    = useTenantStore(s => s.advanced.tenantCode)
  const setupComplete = useTenantStore(s => s.advanced._setupComplete === true)
  const countryConfigs       = useTenantStore(s => s.countryConfigs)
  const setCountryInheritance = useTenantStore(s => s.setCountryInheritance)
  const setCountryModuleMode  = useTenantStore(s => s.setCountryModuleMode)

  if (!tenantCode)    return <Navigate to="/branding" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  const ownCount     = countryConfigs.filter(c => !c.inheritsFrom || c.inheritsFrom === 'own').length
  const inheritCount = countryConfigs.length - ownCount
  const overrides    = countryConfigs.reduce((acc, c) => {
    return acc + Object.values(c.moduleModes ?? {}).filter(m => m !== 'inherit').length
  }, 0)

  function handleCycleModule(countryId, moduleKey, currentMode) {
    const next = MODE_CYCLE[currentMode] ?? 'inherit'
    setCountryModuleMode(countryId, moduleKey, next)
  }

  function handleChangeParent(countryId, newSource, cascade) {
    setCountryInheritance(countryId, newSource, { cascadeChildren: cascade })
  }

  return (
    <div>
      <PageHeader
        title="Herencias"
        subtitle="Define qué módulos hereda cada país y desde dónde."
        icon={GitBranch}
      />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <Stat label="Países" value={countryConfigs.length} />
        <Stat label="Heredan" value={inheritCount} />
        <Stat label="Config propia" value={ownCount} accent="#E8175D" />
        <Stat label="Overrides activos" value={overrides} accent="rgba(99,179,237,0.8)" />
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(MODE_CFG).map(([key, cfg]) => {
          const Icon = cfg.Icon
          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', borderRadius: 5,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              fontSize: 8, color: cfg.color, fontFamily: 'Space Mono, monospace',
            }}>
              <Icon size={8} color={cfg.color} />
              {cfg.label}
            </div>
          )
        })}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 5,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace',
        }}>
          Click en una celda para cambiar modo
        </div>
      </div>

      {countryConfigs.length === 0 ? (
        <Empty />
      ) : (
        <div style={{
          overflowX: 'auto',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
        }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 680 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={thStickyStyle}>
                  <span style={thTextStyle}>País · Hereda de</span>
                </th>
                {MODULES.map(m => (
                  <th key={m.key} style={thStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={thTextStyle}>{m.label}</span>
                      <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace' }}>
                        {m.short}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fila BASE */}
              <tr style={{ background: 'rgba(255,255,255,0.015)' }}>
                <td style={tdStickyStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.08)',
                      fontSize: 8, fontFamily: 'Space Mono, monospace',
                      fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em',
                    }}>
                      BASE
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif' }}>
                      {tenantCode}
                    </span>
                  </div>
                </td>
                {MODULES.map(m => <ModuleCell key={m.key} isBase />)}
              </tr>

              {/* Filas de países */}
              {countryConfigs.map(country => {
                const modes = country.moduleModes ?? {}
                const source = country.inheritsFrom

                return (
                  <tr
                    key={country.id ?? country.countryCode}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.1s' }}
                  >
                    {/* Celda país */}
                    <td style={tdStickyStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 24, height: 17, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                            <FlagImage code={country.countryCode} size={24} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif', lineHeight: 1.2 }}>
                              {country.name ?? country.countryCode}
                            </div>
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace' }}>
                              {country.countryCode} · {statusLabel(country.status)}
                            </div>
                          </div>
                        </div>
                        <ParentPicker
                          country={country}
                          allCountries={countryConfigs}
                          onChangeParent={handleChangeParent}
                        />
                      </div>
                    </td>

                    {/* Celdas de módulos */}
                    {MODULES.map(m => {
                      const mode = modes[m.key] ?? 'inherit'
                      return (
                        <ModuleCell
                          key={m.key}
                          mode={mode}
                          onClick={() => handleCycleModule(country.id ?? country.countryCode, m.key, mode)}
                        />
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota */}
      <div style={{
        marginTop: 18, padding: '11px 14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <AlertCircle size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Hereda</strong> — usa el módulo del padre sin cambios.{' '}
          <strong style={{ color: 'rgba(99,179,237,0.8)' }}>Override base</strong> — hereda del padre pero puede personalizarse desde su propia sección.{' '}
          <strong style={{ color: 'rgba(232,23,93,0.85)' }}>Propio</strong> — config completamente independiente del padre.
          Los cambios se guardan automáticamente.
        </div>
      </div>
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusLabel(status) {
  if (status === 'active')   return 'activo'
  if (status === 'draft')    return 'draft'
  if (status === 'inactive') return 'inactivo'
  return status ?? '—'
}

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: '7px 12px', borderRadius: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent ?? 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif' }}>
        {value}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: 12,
    }}>
      <GitBranch size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
        Sin países configurados
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>
        Agrega países en la sección Países para configurar herencias
      </div>
    </div>
  )
}

// ─── estilos de tabla ─────────────────────────────────────────────────────────

const cellStyle = {
  padding: '8px 4px', minWidth: 85, textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  borderRight: '1px solid rgba(255,255,255,0.04)',
}

const baseCellStyle = {
  ...cellStyle,
  background: 'rgba(255,255,255,0.01)',
}

const thStyle = {
  padding: '10px 8px', textAlign: 'center', minWidth: 85,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  borderRight: '1px solid rgba(255,255,255,0.04)',
}

const thStickyStyle = {
  ...thStyle,
  position: 'sticky', left: 0, zIndex: 2,
  minWidth: 200, textAlign: 'left',
  background: 'rgba(14,16,22,0.97)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
}

const thTextStyle = {
  fontSize: 8, fontWeight: 700,
  color: 'rgba(255,255,255,0.45)',
  fontFamily: 'Space Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.07em',
}

const tdStickyStyle = {
  padding: '10px 12px',
  position: 'sticky', left: 0, zIndex: 1,
  background: 'rgba(14,16,22,0.97)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  minWidth: 200,
}
