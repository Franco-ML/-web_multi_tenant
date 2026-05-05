import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe2, Plus, Layers, Check, AlertCircle, Archive, ChevronRight, X, Settings, Wand2 } from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

// ─── Componente: árbol de herencias ───────────────────────────────────────────

function InheritanceTree({ countries, primaryColor, onPickCountry }) {
  // Agrupa: hijos directos de 'base', hijos por countryId
  const byParent = {}
  for (const c of countries) {
    const key = c.inheritsFrom ?? 'own'
    if (!byParent[key]) byParent[key] = []
    byParent[key].push(c)
  }

  function renderChildren(parentKey, depth = 0) {
    const list = byParent[parentKey] ?? []
    if (list.length === 0) return null
    return (
      <div style={{ paddingLeft: depth === 0 ? 0 : 18 }}>
        {list.map(c => (
          <div key={c.id ?? c.countryCode}>
            <button
              onClick={() => onPickCountry(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '6px 10px', marginBottom: 3,
                borderRadius: 7, width: '100%',
                background: c.status === 'active'
                  ? 'rgba(255,255,255,0.04)'
                  : c.status === 'draft' ? 'rgba(255,180,0,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${
                  c.status === 'active' ? 'rgba(255,255,255,0.07)' :
                  c.status === 'draft' ? 'rgba(255,180,0,0.2)' : 'rgba(255,255,255,0.05)'
                }`,
                cursor: 'pointer', textAlign: 'left',
                opacity: c.status === 'inactive' ? 0.5 : 1,
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,23,93,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = c.status === 'active'
                ? 'rgba(255,255,255,0.04)'
                : c.status === 'draft' ? 'rgba(255,180,0,0.06)' : 'rgba(255,255,255,0.02)'}
            >
              <div style={{ width: 22, height: 16, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <FlagImage code={c.countryCode} size={22} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
                  {c.name ?? c.countryCode}
                  {c.isPrimary && (
                    <span style={{
                      fontSize: 7, padding: '1px 4px', borderRadius: 3,
                      background: `${primaryColor}25`, color: primaryColor,
                      fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.06em',
                    }}>
                      PRIMARIO
                    </span>
                  )}
                  <StatusBadge status={c.status} primaryColor={primaryColor} draftStep={c.draftStep} totalSteps={c.totalSteps} />
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
                  {c.countryCode} · {inheritanceLabel(c, countries)}
                </div>
              </div>
              <ChevronRight size={11} color="rgba(255,255,255,0.25)" />
            </button>
            {/* Recurse: hijos cuyo inheritsFrom === este país */}
            {renderChildren(c.id, depth + 1)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Layers size={13} color="rgba(255,255,255,0.5)" />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Config base
        </span>
      </div>
      {renderChildren('base')}
      {byParent['own'] && byParent['own'].length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 10 }}>
            <Globe2 size={13} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Configuración propia (own)
            </span>
          </div>
          {renderChildren('own')}
        </>
      )}
    </div>
  )
}

function inheritanceLabel(country, all) {
  if (country.inheritsFrom === null || country.inheritsFrom === 'own' || country.inheritsFrom === undefined) {
    return 'config propia'
  }
  if (country.inheritsFrom === 'base') return 'hereda de base'
  const parent = all.find(c => c.id === country.inheritsFrom)
  return parent ? `hereda de ${parent.name ?? parent.countryCode}` : 'hereda de país desconocido'
}

function StatusBadge({ status, primaryColor, draftStep, totalSteps }) {
  if (status === 'active') return null  // default, no necesita badge
  if (status === 'draft') {
    return (
      <span style={{
        fontSize: 7, padding: '1px 5px', borderRadius: 3,
        background: 'rgba(255,180,0,0.15)', color: 'rgba(255,180,0,0.9)',
        fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.05em',
      }}>
        DRAFT {draftStep ?? 0}/{totalSteps ?? 7}
      </span>
    )
  }
  if (status === 'inactive') {
    return (
      <span style={{
        fontSize: 7, padding: '1px 5px', borderRadius: 3,
        background: 'rgba(150,150,150,0.15)', color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.05em',
      }}>
        INACTIVO
      </span>
    )
  }
  return null
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function CountriesPage() {
  const navigate       = useNavigate()
  const tenantCode     = useTenantStore((s) => s.advanced.tenantCode)
  const setupComplete  = useTenantStore((s) => s.advanced._setupComplete === true)
  const countryConfigs = useTenantStore((s) => s.countryConfigs)
  const setActiveCountry = useTenantStore((s) => s.setActiveCountry)
  const [createOpen, setCreateOpen] = useState(false)

  // Bloqueos (después de hooks)
  if (!tenantCode) return <Navigate to="/branding" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  const total       = countryConfigs.length
  const totalActive = countryConfigs.filter(c => c.status === 'active').length
  const totalDraft  = countryConfigs.filter(c => c.status === 'draft').length
  const totalInactive = countryConfigs.filter(c => c.status === 'inactive').length

  function handlePickCountry(c) {
    if (c.status === 'draft') {
      navigate(`/countries/wizard/${c.id}`)
    } else {
      setActiveCountry(c.countryCode)
      // Por ahora navega a /locale para editar (pronto será un editor inline en /countries)
      navigate('/locale')
    }
  }

  return (
    <div>
      <PageHeader
        title="Países y herencias"
        subtitle="Gestión completa de países: estado, herencias, activación y archivado."
        icon={Globe2}
      />

      {/* Acciones top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Stat label="Total" value={total} />
          <Stat label="Activos" value={totalActive} />
          <Stat label="Drafts" value={totalDraft} accent="rgba(255,180,0,0.7)" />
          <Stat label="Inactivos" value={totalInactive} accent="rgba(150,150,150,0.5)" />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreateOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: '#E8175D', color: '#fff',
            fontSize: 12, fontWeight: 700, fontFamily: 'Sora, sans-serif',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,23,93,0.3)',
          }}
        >
          <Plus size={14} />
          Crear país
        </motion.button>
      </div>

      {/* Estado vacío */}
      {total === 0 ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 12,
        }}>
          <Globe2 size={28} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
            Sin países configurados
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
            Crea el primer país para empezar a operar
          </div>
        </div>
      ) : (
        <InheritanceTree countries={countryConfigs} primaryColor="#E8175D" onPickCountry={handlePickCountry} />
      )}

      {/* Aviso Fase 2 */}
      <div style={{
        marginTop: 20, padding: '12px 14px',
        background: 'rgba(147,197,253,0.05)',
        border: '1px solid rgba(147,197,253,0.12)',
        borderRadius: 10, fontSize: 11,
        color: 'rgba(147,197,253,0.7)', fontFamily: 'Space Mono, monospace', lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <AlertCircle size={12} color="rgba(147,197,253,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong style={{ color: 'rgba(147,197,253,0.9)' }}>Fase 2 activa.</strong>
            {' '}Crea países con 3 modos: heredar base, heredar de otro país, o config propia (wizard). Cambio de herencia con cascada y desactivación llegan en Fase 3.
          </span>
        </div>
      </div>

      {/* Modal de creación */}
      <CreateCountryModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  )
}

// ─── Modal: Crear país (modo A/B/C) ──────────────────────────────────────────

function CreateCountryModal({ open, onClose }) {
  const navigate       = useNavigate()
  const countryConfigs = useTenantStore((s) => s.countryConfigs)
  const createCountry  = useTenantStore((s) => s.createCountry)

  const [step, setStep] = useState(1)        // 1: pick country, 2: pick mode, 3: pick source/customize (mode B)
  const [selectedCode, setSelectedCode] = useState(null)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState(null)     // 'inherit-base' | 'inherit-from' | 'own'
  const [sourceId, setSourceId] = useState(null)
  const [forkType, setForkType] = useState(null)  // 'completa' | 'personalizada'

  const existingCodes = countryConfigs.map(c => c.countryCode)
  const activeCountries = countryConfigs.filter(c => c.status === 'active')

  function reset() {
    setStep(1); setSelectedCode(null); setSearch('')
    setMode(null); setSourceId(null); setForkType(null)
  }
  function close() {
    reset(); onClose()
  }

  function handleCreate(modeArg, opts = {}) {
    const cat = COUNTRY_CATALOG.find(c => c.countryCode === selectedCode)
    if (!cat) return
    const newId = createCountry(cat, { mode: modeArg, ...opts })
    close()
    if (modeArg === 'own') {
      navigate(`/countries/wizard/${newId}`)
    }
  }

  const filtered = COUNTRY_CATALOG.filter(c =>
    !existingCodes.includes(c.countryCode) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.countryCode.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(8,10,15,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 580,
              background: 'rgba(20,23,32,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.3px' }}>
                  Crear país
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
                  Paso {step} de {step === 3 ? 3 : 2}
                </div>
              </div>
              <button onClick={close} style={{
                width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={13} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', maxHeight: '70vh', overflowY: 'auto' }}>

              {/* STEP 1: Pick country */}
              {step === 1 && (
                <>
                  <FieldLabel>Selecciona el país del catálogo</FieldLabel>
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar país..."
                    style={{
                      width: '100%', padding: '8px 11px', marginBottom: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, color: '#fff', fontSize: 11, fontFamily: 'Sora, sans-serif', outline: 'none',
                    }}
                  />
                  <div style={{
                    maxHeight: 280, overflowY: 'auto',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: 7,
                  }}>
                    {filtered.map(c => {
                      const selected = selectedCode === c.countryCode
                      return (
                        <button
                          key={c.countryCode}
                          onClick={() => setSelectedCode(c.countryCode)}
                          title={c.name}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                            background: selected ? 'rgba(232,23,93,0.18)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(232,23,93,0.6)' : '1px solid rgba(255,255,255,0.07)',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          <div style={{ width: 40, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                            <FlagImage code={c.countryCode} size={40} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                          </div>
                          <div style={{ fontSize: 8, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: selected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}>
                            {c.countryCode}
                          </div>
                        </button>
                      )
                    })}
                    {filtered.length === 0 && (
                      <div style={{ gridColumn: '1/-1', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', padding: '20px 0', textAlign: 'center' }}>
                        Sin resultados
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2: Pick mode */}
              {step === 2 && (
                <>
                  <FieldLabel>¿Cómo configurar este país?</FieldLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <ModeCard
                      title="Heredar config base"
                      sublabel="Listo en 1 paso · ACTIVE inmediato"
                      description="Toma toda la config base del tenant (identidad, tema, módulos, idiomas, login, avanzado)."
                      Icon={Layers}
                      selected={mode === 'inherit-base'}
                      onClick={() => setMode('inherit-base')}
                    />
                    <ModeCard
                      title="Heredar de otro país"
                      sublabel={`${activeCountries.length === 0 ? 'Sin países activos disponibles' : `${activeCountries.length} país(es) disponibles`}`}
                      description="Copia la config de un país que ya esté ACTIVE. Puedes heredarla completa o personalizar por módulo."
                      Icon={Globe2}
                      selected={mode === 'inherit-from'}
                      disabled={activeCountries.length === 0}
                      onClick={() => activeCountries.length > 0 && setMode('inherit-from')}
                    />
                    <ModeCard
                      title="Config propia"
                      sublabel="DRAFT · 7 pasos del wizard"
                      description="Configura desde cero. Cada paso se guarda automáticamente, podés retomar desde otro dispositivo."
                      Icon={Wand2}
                      selected={mode === 'own'}
                      onClick={() => setMode('own')}
                    />
                  </div>
                </>
              )}

              {/* STEP 3: Pick source for mode B */}
              {step === 3 && mode === 'inherit-from' && (
                <>
                  <FieldLabel>Heredar de qué país</FieldLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {activeCountries.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSourceId(c.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 8,
                          background: sourceId === c.id ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.03)',
                          border: sourceId === c.id ? '1px solid rgba(232,23,93,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 22, height: 16, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                          <FlagImage code={c.countryCode} size={22} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
                          {c.name ?? c.countryCode}
                        </span>
                        {sourceId === c.id && <Check size={12} color="#E8175D" style={{ marginLeft: 'auto' }} />}
                      </button>
                    ))}
                  </div>

                  {sourceId && (
                    <>
                      <FieldLabel>Tipo de herencia</FieldLabel>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => setForkType('completa')}
                          style={typeBtnStyle(forkType === 'completa')}
                        >
                          <strong style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Completa</strong>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
                            Hereda los 7 módulos tal cual
                          </span>
                        </button>
                        <button
                          onClick={() => alert('TODO: editor por módulo (próxima iteración Fase 2)')}
                          style={{ ...typeBtnStyle(false), opacity: 0.5, cursor: 'not-allowed' }}
                          disabled
                        >
                          <strong style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Personalizada</strong>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
                            Override por módulo (pronto)
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 8, justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <button
                onClick={() => step === 1 ? close() : setStep(s => s - 1)}
                style={{
                  padding: '9px 16px', borderRadius: 7,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: 'rgba(255,255,255,0.5)',
                  fontSize: 11, fontFamily: 'Sora, sans-serif', cursor: 'pointer',
                }}
              >
                {step === 1 ? 'Cancelar' : 'Anterior'}
              </button>

              {/* Botón principal — varía por step y modo */}
              {step === 1 && (
                <button
                  onClick={() => selectedCode && setStep(2)}
                  disabled={!selectedCode}
                  style={{
                    padding: '9px 22px', borderRadius: 7, border: 'none',
                    background: selectedCode ? '#E8175D' : 'rgba(232,23,93,0.3)',
                    color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                    cursor: selectedCode ? 'pointer' : 'not-allowed',
                  }}
                >
                  Siguiente
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={() => {
                    if (mode === 'inherit-base') handleCreate('inherit-base')
                    else if (mode === 'own')     handleCreate('own')
                    else if (mode === 'inherit-from') setStep(3)
                  }}
                  disabled={!mode}
                  style={{
                    padding: '9px 22px', borderRadius: 7, border: 'none',
                    background: mode ? '#E8175D' : 'rgba(232,23,93,0.3)',
                    color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                    cursor: mode ? 'pointer' : 'not-allowed',
                  }}
                >
                  {mode === 'own' ? 'Empezar wizard' : mode === 'inherit-base' ? 'Crear (active)' : 'Siguiente'}
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={() => sourceId && forkType === 'completa' && handleCreate('inherit-from', { sourceId })}
                  disabled={!sourceId || !forkType}
                  style={{
                    padding: '9px 22px', borderRadius: 7, border: 'none',
                    background: (sourceId && forkType) ? '#E8175D' : 'rgba(232,23,93,0.3)',
                    color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                    cursor: (sourceId && forkType) ? 'pointer' : 'not-allowed',
                  }}
                >
                  Crear (active)
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ModeCard({ title, sublabel, description, Icon, selected, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px', borderRadius: 10,
        background: selected ? 'rgba(232,23,93,0.10)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(232,23,93,0.45)' : '1px solid rgba(255,255,255,0.07)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textAlign: 'left', transition: 'all 0.12s ease',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: selected ? 'rgba(232,23,93,0.2)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={selected ? '#E8175D' : 'rgba(255,255,255,0.5)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif' }}>
            {title}
          </span>
          <span style={{ fontSize: 9, color: selected ? '#E8175D' : 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {sublabel}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora, sans-serif', lineHeight: 1.45 }}>
          {description}
        </div>
      </div>
      {selected && <Check size={14} color="#E8175D" style={{ flexShrink: 0, marginTop: 8 }} />}
    </button>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      fontFamily: 'Space Mono, monospace', textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function typeBtnStyle(active) {
  return {
    flex: 1, padding: '10px 12px', borderRadius: 8,
    background: active ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.03)',
    border: active ? '1px solid rgba(232,23,93,0.45)' : '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer', textAlign: 'left',
  }
}

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: '7px 12px', borderRadius: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ?? 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif' }}>
        {value}
      </div>
    </div>
  )
}
