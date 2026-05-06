import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe2, Plus, Check, X, ChevronDown, Image, LayoutGrid,
  Settings, FileText, ArrowUp, Layers, Sparkles, Wand2,
  GitBranch, Info,
} from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

// ─── 4 módulos consolidados ───────────────────────────────────────────────────

const SUPER_MODULES = [
  {
    key: 'branding',
    label: 'Imagen de marca',
    Icon: Image,
    color: '#E8175D',
    storeKeys: ['branding', 'theme'],
    fields: [
      { key: 'logo',            label: 'Logo de la empresa' },
      { key: 'name',            label: 'Nombre y descripción' },
      { key: 'primaryColor',    label: 'Color primario' },
      { key: 'backgroundColor', label: 'Color de fondo' },
      { key: 'colorMode',       label: 'Modo claro / oscuro' },
    ],
  },
  {
    key: 'features',
    label: 'Funciones',
    Icon: LayoutGrid,
    color: '#3B82F6',
    storeKeys: ['features', 'login', 'registration'],
    fields: [
      { key: 'loginPhone',   label: 'Login por teléfono' },
      { key: 'loginEmail',   label: 'Login por email' },
      { key: 'pin',          label: 'PIN de seguridad' },
      { key: 'routes',       label: 'Módulo de rutas' },
      { key: 'onboarding',   label: 'Registro / onboarding' },
    ],
  },
  {
    key: 'advanced',
    label: 'Avanzado',
    Icon: Settings,
    color: '#8B5CF6',
    storeKeys: ['advanced'],
    fields: [
      { key: 'apiUrl',             label: 'URL del servidor' },
      { key: 'supportCenterPhone', label: 'Tel. centro de soporte' },
      { key: 'emergencyPhone',     label: 'Tel. de emergencias' },
      { key: 'integrations',       label: 'Claves de integraciones' },
    ],
  },
  {
    key: 'documents',
    label: 'Documentos',
    Icon: FileText,
    color: '#10B981',
    storeKeys: ['documents'],
    fields: [
      { key: 'idTypes',    label: 'Tipos de ID aceptados' },
      { key: 'ocr',        label: 'Lectura automática (OCR)' },
      { key: 'required',   label: 'Documentos requeridos' },
    ],
  },
]

// ─── Modos de herencia ────────────────────────────────────────────────────────

const MODES = {
  inherit: {
    label: 'Hereda todo',
    short: 'Hereda',
    Icon: ArrowUp,
    color: 'rgba(255,255,255,0.45)',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
  },
  'override-base': {
    label: 'Parcial',
    short: 'Parcial',
    Icon: Layers,
    color: 'rgba(99,179,237,0.9)',
    bg: 'rgba(99,179,237,0.08)',
    border: 'rgba(99,179,237,0.25)',
  },
  custom: {
    label: 'Propio',
    short: 'Propio',
    Icon: Sparkles,
    color: 'rgba(232,23,93,0.9)',
    bg: 'rgba(232,23,93,0.08)',
    border: 'rgba(232,23,93,0.3)',
  },
}

// Devuelve el modo representativo del super-módulo (primer storeKey disponible)
function getSuperModuleMode(country, superModKey) {
  const sm = SUPER_MODULES.find(m => m.key === superModKey)
  if (!sm) return 'inherit'
  for (const k of sm.storeKeys) {
    const m = country.moduleModes?.[k]
    if (m && m !== 'inherit') return m
  }
  return country.moduleModes?.[sm.storeKeys[0]] ?? 'inherit'
}

// ─── Chip de módulo en la card del país ───────────────────────────────────────

function ModuleChip({ country, mod, onClick }) {
  const mode = getSuperModuleMode(country, mod.key)
  const cfg  = MODES[mode] ?? MODES.inherit
  const Icon = mod.Icon

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 20, cursor: 'pointer',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.25)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
      title={`${mod.label} · ${cfg.label}`}
    >
      <Icon size={9} color={cfg.color} />
      <span style={{ fontSize: 9, fontWeight: 600, color: cfg.color, fontFamily: 'Sora', whiteSpace: 'nowrap' }}>
        {mod.label}
      </span>
      <span style={{ fontSize: 8, color: cfg.color, opacity: 0.7, fontFamily: 'Space Mono' }}>
        · {cfg.short}
      </span>
    </button>
  )
}

// ─── Card de país ─────────────────────────────────────────────────────────────

function CountryCard({ country, allCountries }) {
  const navigate     = useNavigate()
  const primaryColor = useTenantStore(s => s.theme.light?.primary ?? '#E8175D')

  const parentLabel = (() => {
    if (!country.inheritsFrom || country.inheritsFrom === 'own') return 'Config propia'
    if (country.inheritsFrom === 'base') return 'Hereda base'
    const p = allCountries.find(c => c.id === country.inheritsFrom)
    return p ? `Hereda de ${p.name ?? p.countryCode}` : 'Hereda de país'
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/countries/${country.id}`)}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'pointer',
      }}
    >
      {/* Fila superior: bandera + info + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 25, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          <FlagImage code={country.countryCode} size={36} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora' }}>
              {country.name ?? country.countryCode}
            </span>
            {country.isPrimary && (
              <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 4, background: `${primaryColor}25`, color: primaryColor, fontFamily: 'Space Mono', fontWeight: 700, letterSpacing: '0.05em' }}>
                PRIMARIO
              </span>
            )}
            <StatusBadge status={country.status} />
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginTop: 2 }}>
            {country.countryCode} · {parentLabel}
          </div>
        </div>
      </div>

      {/* Módulos + clic para abrir detalle */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SUPER_MODULES.map(mod => (
          <ModuleChip
            key={mod.key}
            country={country}
            mod={mod}
            onClick={() => navigate(`/countries/${country.id}`)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Modal de herencia ────────────────────────────────────────────────────────

function InheritanceModal({ country, initialModule, allCountries, onClose }) {
  const setCountryModuleMode    = useTenantStore(s => s.setCountryModuleMode)
  const setCountryCustomModule  = useTenantStore(s => s.setCountryCustomModule)
  const setCountryInheritance   = useTenantStore(s => s.setCountryInheritance)

  const [activeModKey, setActiveModKey] = useState(initialModule ?? SUPER_MODULES[0].key)
  const [localState, setLocalState] = useState(() => {
    // Inicializar estado local desde el store para cada módulo
    const s = {}
    for (const sm of SUPER_MODULES) {
      const mode = getSuperModuleMode(country, sm.key)
      const inheritedFields = country.customModules?.[sm.key]?.inheritedFields ?? sm.fields.map(f => f.key)
      s[sm.key] = { mode, inheritedFields, source: country.inheritsFrom ?? 'base' }
    }
    return s
  })

  const activeMod  = SUPER_MODULES.find(m => m.key === activeModKey)
  const activeData = localState[activeModKey]

  const sources = [
    { value: 'base', label: 'Configuración base', sub: 'del tenant' },
    ...allCountries
      .filter(c => c.id !== country.id && c.status === 'active')
      .map(c => ({ value: c.id, label: c.name ?? c.countryCode, sub: c.countryCode, flag: c.countryCode })),
  ]

  function setMod(key, patch) {
    setLocalState(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  function toggleField(fieldKey) {
    const cur = activeData.inheritedFields
    const next = cur.includes(fieldKey) ? cur.filter(f => f !== fieldKey) : [...cur, fieldKey]
    setMod(activeModKey, { inheritedFields: next })
  }

  function toggleAllFields(inherit) {
    setMod(activeModKey, {
      inheritedFields: inherit ? activeMod.fields.map(f => f.key) : [],
      mode: inherit ? 'inherit' : 'custom',
    })
  }

  function handleSave() {
    for (const sm of SUPER_MODULES) {
      const data = localState[sm.key]
      // Aplicar mode a todos los storeKeys del super-módulo
      for (const k of sm.storeKeys) {
        setCountryModuleMode(country.id, k, data.mode)
      }
      // Guardar fields en customModules
      setCountryCustomModule(country.id, sm.key, {
        inheritedFields: data.inheritedFields,
      })
    }
    // Aplicar fuente de herencia global si todos apuntan al mismo source
    const sources = [...new Set(Object.values(localState).map(d => d.source))]
    if (sources.length === 1) {
      setCountryInheritance(country.id, sources[0] === 'base' ? 'base' : sources[0])
    }
    onClose()
  }

  const allInherited = activeData.inheritedFields.length === activeMod.fields.length
  const noneInherited = activeData.inheritedFields.length === 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          width: '100%', maxWidth: 620,
          background: '#0D1017',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 0',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 22, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                <FlagImage code={country.countryCode} size={32} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora', letterSpacing: '-0.3px' }}>
                  {country.name ?? country.countryCode}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                  Configurar herencias por módulo
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={12} color="rgba(255,255,255,0.4)" />
            </button>
          </div>

          {/* Tabs de módulos */}
          <div style={{ display: 'flex', gap: 2 }}>
            {SUPER_MODULES.map(sm => {
              const active = sm.key === activeModKey
              const mode   = localState[sm.key].mode
              const cfg    = MODES[mode] ?? MODES.inherit
              const Icon   = sm.Icon
              return (
                <button
                  key={sm.key}
                  onClick={() => setActiveModKey(sm.key)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                    padding: '8px 6px 10px',
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none', borderBottom: `2px solid ${active ? sm.color : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon size={12} color={active ? sm.color : 'rgba(255,255,255,0.3)'} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', fontFamily: 'Sora' }}>
                      {sm.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 8, color: cfg.color, fontFamily: 'Space Mono', opacity: active ? 1 : 0.6 }}>
                    {cfg.short}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Fuente de herencia */}
          <div>
            <SectionLabel icon={GitBranch}>Heredar configuración de</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {sources.map(src => {
                const sel = activeData.source === src.value
                return (
                  <button
                    key={src.value}
                    onClick={() => setMod(activeModKey, { source: src.value })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
                      background: sel ? `${activeMod.color}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${sel ? activeMod.color + '40' : 'rgba(255,255,255,0.07)'}`,
                      transition: 'all 0.12s',
                    }}
                  >
                    {src.flag && (
                      <div style={{ width: 20, height: 14, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <FlagImage code={src.flag} size={20} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                      </div>
                    )}
                    {!src.flag && (
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        background: sel ? `${activeMod.color}20` : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Layers size={10} color={sel ? activeMod.color : 'rgba(255,255,255,0.4)'} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', fontFamily: 'Sora' }}>
                        {src.label}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                        {src.sub}
                      </div>
                    </div>
                    {sel && <Check size={12} color={activeMod.color} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modo de herencia */}
          <div>
            <SectionLabel icon={activeMod.Icon}>Modo para {activeMod.label}</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              {Object.entries(MODES).map(([modeKey, cfg]) => {
                const Icon = cfg.Icon
                const sel  = activeData.mode === modeKey
                return (
                  <button
                    key={modeKey}
                    onClick={() => {
                      setMod(activeModKey, {
                        mode: modeKey,
                        inheritedFields: modeKey === 'inherit'
                          ? activeMod.fields.map(f => f.key)
                          : modeKey === 'custom'
                          ? []
                          : activeData.inheritedFields,
                      })
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                      background: sel ? cfg.bg : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${sel ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={16} color={sel ? cfg.color : 'rgba(255,255,255,0.25)'} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: sel ? cfg.color : 'rgba(255,255,255,0.4)', fontFamily: 'Sora' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', textAlign: 'center', lineHeight: 1.4 }}>
                      {modeKey === 'inherit' && 'Igual al padre'}
                      {modeKey === 'override-base' && 'Campos selectivos'}
                      {modeKey === 'custom' && 'Configuración propia'}
                    </span>
                    {sel && (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={9} color="#fff" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Campos — solo cuando el modo no es 'inherit' ni 'custom' puro */}
          {activeData.mode !== 'inherit' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <SectionLabel icon={Info}>¿Qué campos heredar?</SectionLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleAllFields(true)} style={quickBtnStyle(!noneInherited)}>
                    Todos
                  </button>
                  <button onClick={() => toggleAllFields(false)} style={quickBtnStyle(noneInherited)}>
                    Ninguno
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeMod.fields.map(field => {
                  const on = activeData.inheritedFields.includes(field.key)
                  return (
                    <button
                      key={field.key}
                      onClick={() => toggleField(field.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
                        background: on ? `${activeMod.color}08` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${on ? activeMod.color + '30' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.12s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: on ? activeMod.color : 'rgba(255,255,255,0.06)',
                        border: `2px solid ${on ? activeMod.color : 'rgba(255,255,255,0.12)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {on && <Check size={9} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', fontFamily: 'Sora', transition: 'color 0.12s' }}>
                        {field.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeData.mode === 'inherit' && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <Info size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
                Todos los campos de <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{activeMod.label}</strong> se tomarán exactamente de la fuente seleccionada. Para personalizar campos individuales, cambiá a modo <strong style={{ color: 'rgba(99,179,237,0.8)' }}>Parcial</strong>.
              </span>
            </div>
          )}

          {activeData.mode === 'custom' && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'rgba(232,23,93,0.06)', border: '1px solid rgba(232,23,93,0.15)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <Sparkles size={13} color="rgba(232,23,93,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
                Este módulo tendrá configuración <strong style={{ color: 'rgba(232,23,93,0.8)' }}>completamente propia</strong>. Podés editarlo desde la sección correspondiente del panel.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px 18px', borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, display: 'flex', gap: 8,
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Sora', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleSave} style={{
            flex: 2, padding: '10px', borderRadius: 10,
            background: '#E8175D', border: 'none',
            color: '#fff', fontSize: 12, fontFamily: 'Sora', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(232,23,93,0.3)',
          }}>
            Guardar herencias
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Modal: crear país ────────────────────────────────────────────────────────

function CreateCountryModal({ open, onClose }) {
  const navigate       = useNavigate()
  const countryConfigs = useTenantStore(s => s.countryConfigs)
  const createCountry  = useTenantStore(s => s.createCountry)

  const [step, setStep]               = useState(1)
  const [selectedCode, setSelectedCode] = useState(null)
  const [mode, setMode]               = useState(null)
  const [search, setSearch]           = useState('')
  // Step 3: herencia desde país
  const [sourceId, setSourceId]       = useState(null)
  const [showModuleConfig, setShowModuleConfig] = useState(false)

  const existingCodes   = countryConfigs.map(c => c.countryCode)
  const activeCountries = countryConfigs.filter(c => c.status === 'active')
  const filtered = COUNTRY_CATALOG.filter(c =>
    !existingCodes.includes(c.countryCode) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.countryCode.toLowerCase().includes(search.toLowerCase()))
  )

  function reset() { setStep(1); setSelectedCode(null); setSearch(''); setMode(null); setSourceId(null); setShowModuleConfig(false) }
  function close()  { reset(); onClose() }

  function handleCreate(modeArg, opts = {}) {
    const cat = COUNTRY_CATALOG.find(c => c.countryCode === selectedCode)
    if (!cat) return
    const newId = createCountry(cat, { mode: modeArg, ...opts })
    close()
    if (modeArg === 'own') navigate(`/countries/wizard/${newId}`)
  }

  const totalSteps = mode === 'inherit-from' ? 3 : 2

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 560,
              background: 'rgba(20,23,32,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora', letterSpacing: '-0.3px' }}>
                  Agregar país
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', marginTop: 2 }}>
                  Paso {step} de {totalSteps}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Progress dots */}
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} style={{
                    width: i + 1 === step ? 16 : 6, height: 6, borderRadius: 3,
                    background: i + 1 <= step ? '#E8175D' : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.2s',
                  }} />
                ))}
                <button onClick={close} style={{ marginLeft: 8, width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} color="rgba(255,255,255,0.5)" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', maxHeight: '65vh', overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <FieldLabel>Seleccioná el país</FieldLabel>
                    <input
                      autoFocus value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar país..."
                      style={{ width: '100%', padding: '8px 11px', marginBottom: 12, boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 11, fontFamily: 'Sora', outline: 'none' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 7, maxHeight: 280, overflowY: 'auto' }}>
                      {filtered.map(c => {
                        const sel = selectedCode === c.countryCode
                        return (
                          <button key={c.countryCode} onClick={() => setSelectedCode(c.countryCode)} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                            background: sel ? 'rgba(232,23,93,0.18)' : 'rgba(255,255,255,0.03)',
                            border: sel ? '1px solid rgba(232,23,93,0.6)' : '1px solid rgba(255,255,255,0.07)',
                            transition: 'all 0.12s',
                          }}>
                            <div style={{ width: 40, height: 28, borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                              <FlagImage code={c.countryCode} size={40} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                            </div>
                            <span style={{ fontSize: 8, fontFamily: 'Space Mono', fontWeight: 700, color: sel ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}>
                              {c.countryCode}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <FieldLabel>¿Cómo configurar este país?</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 4 }}>
                      {[
                        { id: 'inherit-base', title: 'Heredar config base', sub: 'Activo inmediatamente', desc: 'Toma toda la configuración base del tenant sin modificaciones.', Icon: Layers },
                        { id: 'inherit-from', title: 'Heredar de otro país', sub: activeCountries.length === 0 ? 'Sin países activos' : `${activeCountries.length} disponibles`, desc: 'Copia o hereda la config de un país activo. Podés elegir módulo por módulo.', Icon: Globe2, disabled: activeCountries.length === 0 },
                        { id: 'own', title: 'Config propia', sub: 'Wizard paso a paso', desc: 'Configuración desde cero con wizard guiado.', Icon: Wand2 },
                      ].map(opt => {
                        const sel = mode === opt.id
                        return (
                          <button key={opt.id} onClick={() => !opt.disabled && setMode(opt.id)} disabled={opt.disabled} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderRadius: 10, textAlign: 'left',
                            background: sel ? 'rgba(232,23,93,0.1)' : 'rgba(255,255,255,0.02)',
                            border: sel ? '1px solid rgba(232,23,93,0.45)' : '1px solid rgba(255,255,255,0.06)',
                            cursor: opt.disabled ? 'not-allowed' : 'pointer', opacity: opt.disabled ? 0.4 : 1,
                            transition: 'all 0.12s',
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: sel ? 'rgba(232,23,93,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <opt.Icon size={15} color={sel ? '#E8175D' : 'rgba(255,255,255,0.4)'} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora' }}>{opt.title}</span>
                                <span style={{ fontSize: 9, color: sel ? '#E8175D' : 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>{opt.sub}</span>
                              </div>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Sora', lineHeight: 1.4 }}>{opt.desc}</span>
                            </div>
                            {sel && <Check size={13} color="#E8175D" style={{ flexShrink: 0, marginTop: 4 }} />}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 3 && mode === 'inherit-from' && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <FieldLabel>¿Heredar de qué país?</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {activeCountries.map(c => (
                        <button key={c.id} onClick={() => setSourceId(c.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
                          background: sourceId === c.id ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.03)',
                          border: sourceId === c.id ? '1px solid rgba(232,23,93,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                        }}>
                          <div style={{ width: 22, height: 16, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                            <FlagImage code={c.countryCode} size={22} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                          </div>
                          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora' }}>
                            {c.name ?? c.countryCode}
                          </span>
                          {sourceId === c.id && <Check size={12} color="#E8175D" />}
                        </button>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 12, padding: '10px 12px', borderRadius: 8,
                      background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.15)',
                      fontSize: 10, color: 'rgba(99,179,237,0.7)', fontFamily: 'Space Mono', lineHeight: 1.5,
                    }}>
                      Una vez creado el país podrás configurar la herencia módulo por módulo desde la vista de Países.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
              <button onClick={() => step === 1 ? close() : setStep(s => s - 1)} style={{ padding: '9px 16px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Sora', cursor: 'pointer' }}>
                {step === 1 ? 'Cancelar' : 'Anterior'}
              </button>
              {step === 1 && (
                <button onClick={() => selectedCode && setStep(2)} disabled={!selectedCode} style={primaryBtnStyle(!selectedCode)}>
                  Siguiente
                </button>
              )}
              {step === 2 && (
                <button
                  disabled={!mode}
                  onClick={() => {
                    if (mode === 'inherit-base') handleCreate('inherit-base')
                    else if (mode === 'own')     handleCreate('own')
                    else if (mode === 'inherit-from') setStep(3)
                  }}
                  style={primaryBtnStyle(!mode)}
                >
                  {mode === 'own' ? 'Empezar wizard' : mode === 'inherit-base' ? 'Crear país' : 'Siguiente'}
                </button>
              )}
              {step === 3 && (
                <button onClick={() => sourceId && handleCreate('inherit-from', { sourceId })} disabled={!sourceId} style={primaryBtnStyle(!sourceId)}>
                  Crear país
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CountriesPage() {
  const tenantCode     = useTenantStore(s => s.advanced.tenantCode)
  const setupComplete  = useTenantStore(s => s.advanced._setupComplete === true)
  const countryConfigs = useTenantStore(s => s.countryConfigs)
  const activeCountry  = useTenantStore(s => s.activeCountry)

  const [createOpen, setCreateOpen] = useState(false)

  if (!tenantCode)    return <Navigate to="/brand" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  // Si hay un país seleccionado en el switcher, ir directo al detalle
  if (activeCountry) {
    const c = countryConfigs.find(x => x.countryCode === activeCountry)
    if (c) return <Navigate to={`/countries/${c.id}`} replace />
  }

  const total         = countryConfigs.length
  const totalActive   = countryConfigs.filter(c => c.status === 'active').length
  const totalDraft    = countryConfigs.filter(c => c.status === 'draft').length

  return (
    <div>
      <PageHeader
        title="Países"
        subtitle="Configurá la herencia de cada módulo por país."
        icon={Globe2}
      />

      {/* Stats + botón */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Stat label="Total" value={total} />
          <Stat label="Activos" value={totalActive} />
          {totalDraft > 0 && <Stat label="Drafts" value={totalDraft} accent="rgba(255,180,0,0.7)" />}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setCreateOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: '#E8175D', color: '#fff',
            fontSize: 12, fontWeight: 700, fontFamily: 'Sora',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,23,93,0.3)',
          }}
        >
          <Plus size={14} />
          Agregar país
        </motion.button>
      </div>

      {/* Lista de países */}
      {total === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <Globe2 size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora', marginBottom: 4 }}>
            Sin países configurados
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
            Agregá el primer país para comenzar
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {countryConfigs.map(country => (
            <CountryCard
              key={country.id ?? country.countryCode}
              country={country}
              allCountries={countryConfigs}
            />
          ))}
        </div>
      )}

      {/* Modal crear país */}
      <CreateCountryModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === 'active')   return null
  if (status === 'draft')    return <span style={badgeStyle('rgba(255,180,0,0.15)', 'rgba(255,180,0,0.85)')}>DRAFT</span>
  if (status === 'inactive') return <span style={badgeStyle('rgba(150,150,150,0.1)', 'rgba(255,255,255,0.3)')}>INACTIVO</span>
  return null
}

function badgeStyle(bg, color) {
  return { fontSize: 7, padding: '1px 5px', borderRadius: 3, background: bg, color, fontFamily: 'Space Mono', fontWeight: 700, letterSpacing: '0.05em' }
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={11} color="rgba(255,255,255,0.35)" />
      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {children}
      </span>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function quickBtnStyle(active) {
  return {
    padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 9,
    fontFamily: 'Space Mono', fontWeight: 700,
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  }
}

function primaryBtnStyle(disabled) {
  return {
    flex: 1, padding: '9px 22px', borderRadius: 7, border: 'none',
    background: disabled ? 'rgba(232,23,93,0.3)' : '#E8175D',
    color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Sora',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ?? 'rgba(255,255,255,0.9)', fontFamily: 'Sora' }}>{value}</div>
    </div>
  )
}
