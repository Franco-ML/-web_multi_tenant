import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Palette, Globe, ChevronRight, ChevronLeft, Check, X, Plus, Sun, Moon } from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import { saveDraft } from '../hooks/useTenantManager'
import LogoUploader from '../components/config/LogoUploader'
import FlagImage from '../components/ui/FlagImage'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.9)',
  fontSize: 13,
  fontFamily: 'Sora, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'Space Mono, monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

// ─── Step 1: Identidad ────────────────────────────────────────────────────────

function StepIdentidad({ primaryColor }) {
  const name         = useTenantStore((s) => s.branding.name)
  const description  = useTenantStore((s) => s.branding.description)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <FieldLabel>Logo de la empresa</FieldLabel>
        <LogoUploader />
      </div>

      <div>
        <FieldLabel>Nombre de la empresa</FieldLabel>
        <input
          value={name}
          onChange={(e) => setBrandingField('name', e.target.value)}
          placeholder="Nombre de la empresa"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = `${primaryColor}80`}
          onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      <div>
        <FieldLabel>Descripción corta</FieldLabel>
        <input
          value={description}
          onChange={(e) => setBrandingField('description', e.target.value)}
          placeholder="Ej. Plataforma de logística y mensajería"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = `${primaryColor}80`}
          onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      <div>
        <FieldLabel>Color primario</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => {
              const store = useTenantStore.getState()
              store.setColor('light', 'primary', e.target.value)
              store.setColor('dark',  'primary', e.target.value)
              store.setBrandingField('primaryColor', e.target.value)
            }}
            style={{
              width: 44, height: 44, borderRadius: 8, border: '2px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', background: 'none', padding: 2, boxSizing: 'border-box',
            }}
          />
          <div style={{
            flex: 1, padding: '10px 13px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Space Mono, monospace',
          }}>
            {primaryColor}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Tema visual ──────────────────────────────────────────────────────

function StepTema({ primaryColor }) {
  const colorMode    = useTenantStore((s) => s.theme.colorMode)
  const setColorMode = useTenantStore((s) => s.setColorMode)
  const setColor     = useTenantStore((s) => s.setColor)
  const lightPrimary = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')
  const darkPrimary  = useTenantStore((s) => s.theme.dark?.primary  ?? '#E8175D')

  const MODES = [
    { mode: 'light', Icon: Sun,  label: 'Claro'  },
    { mode: 'dark',  Icon: Moon, label: 'Oscuro' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <FieldLabel>Modo predeterminado de la app</FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {MODES.map(({ mode, Icon, label }) => {
            const active = colorMode === mode
            return (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 9,
                  border: active ? `1px solid ${primaryColor}50` : '1px solid rgba(255,255,255,0.08)',
                  background: active ? `${primaryColor}15` : 'rgba(255,255,255,0.03)',
                  color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} color={active ? primaryColor : 'rgba(255,255,255,0.3)'} />
                <span style={{ fontSize: 11, fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Color primario — modo claro</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={lightPrimary}
            onChange={(e) => setColor('light', 'primary', e.target.value)}
            style={{
              width: 44, height: 44, borderRadius: 8, border: '2px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', background: 'none', padding: 2, boxSizing: 'border-box',
            }}
          />
          <div style={{
            flex: 1, padding: '10px 13px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Space Mono, monospace',
          }}>
            {lightPrimary}
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Color primario — modo oscuro</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={darkPrimary}
            onChange={(e) => setColor('dark', 'primary', e.target.value)}
            style={{
              width: 44, height: 44, borderRadius: 8, border: '2px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', background: 'none', padding: 2, boxSizing: 'border-box',
            }}
          />
          <div style={{
            flex: 1, padding: '10px 13px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Space Mono, monospace',
          }}>
            {darkPrimary}
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 10, color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Space Mono, monospace', lineHeight: 1.6,
      }}>
        Los colores adicionales (superficies, textos, bordes) se ajustan en la sección de Tema visual.
      </div>
    </div>
  )
}

// ─── Step 3: Localización ─────────────────────────────────────────────────────

function StepLocalizacion({ primaryColor }) {
  const countryConfigs    = useTenantStore((s) => s.countryConfigs)
  const addCountry        = useTenantStore((s) => s.addCountry)
  const removeCountry     = useTenantStore((s) => s.removeCountry)
  const setPrimaryCountry = useTenantStore((s) => s.setPrimaryCountry)

  const [search, setSearch] = useState('')

  const available = COUNTRY_CATALOG.filter(c =>
    !countryConfigs.some(cc => cc.countryCode === c.countryCode) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.countryCode.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Países activos */}
      <div>
        <FieldLabel>Países de operación</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {countryConfigs.map((cc) => (
            <div key={cc.countryCode} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              border: cc.isPrimary ? `1px solid ${primaryColor}35` : '1px solid rgba(255,255,255,0.08)',
              background: cc.isPrimary ? `${primaryColor}0d` : 'rgba(255,255,255,0.03)',
            }}>
              <div style={{ width: 24, height: 17, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                <FlagImage code={cc.countryCode} size={24} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
                  {cc.name}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginTop: 3 }}>
                  {cc.countryCode} · {cc.currency ?? '—'} {cc.currencySymbol ?? ''} · {cc.phonePrefix ?? '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {!cc.isPrimary && (
                  <button
                    onClick={() => setPrimaryCountry(cc.countryCode)}
                    title="Hacer principal"
                    style={{
                      fontSize: 8, padding: '3px 7px', borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', fontFamily: 'Space Mono, monospace',
                    }}
                  >
                    Principal
                  </button>
                )}
                {cc.isPrimary && (
                  <span style={{
                    fontSize: 8, padding: '3px 7px', borderRadius: 4,
                    background: `${primaryColor}20`, border: `1px solid ${primaryColor}40`,
                    color: primaryColor, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                  }}>
                    PRINCIPAL
                  </span>
                )}
                {countryConfigs.length > 1 && (
                  <button
                    onClick={() => removeCountry(cc.countryCode)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: 5,
                      border: '1px solid rgba(255,100,100,0.2)',
                      background: 'transparent', color: 'rgba(255,100,100,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agregar país */}
      <div>
        <FieldLabel>Agregar otro país</FieldLabel>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar país..."
          style={{ ...inputStyle, marginBottom: 8, fontSize: 11 }}
          onFocus={(e) => e.target.style.borderColor = `${primaryColor}80`}
          onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <div style={{
          maxHeight: 150, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '2px 0',
        }}>
          {available.map((cat) => (
            <button
              key={cat.countryCode}
              onClick={() => { addCountry({ ...cat, isPrimary: false, idTypes: null, documents: null }); setSearch('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 9px', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                fontSize: 10, fontFamily: 'Sora, sans-serif',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${primaryColor}15`; e.currentTarget.style.borderColor = `${primaryColor}35` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <div style={{ width: 16, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <FlagImage code={cat.countryCode} size={16} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {cat.name}
              <Plus size={9} style={{ opacity: 0.5 }} />
            </button>
          ))}
          {available.length === 0 && search && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', padding: '4px 0' }}>
              Sin resultados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'identidad',    label: 'Identidad',    Icon: Package, Component: StepIdentidad },
  { id: 'tema',         label: 'Tema visual',  Icon: Palette, Component: StepTema     },
  { id: 'localizacion', label: 'Localización', Icon: Globe,   Component: StepLocalizacion },
]

export default function SetupPage() {
  const navigate            = useNavigate()
  const primaryColor        = useTenantStore((s) => s.branding.primaryColor ?? s.theme.light?.primary ?? '#E8175D')
  const tenantName          = useTenantStore((s) => s.branding.name)
  const setAdvancedField    = useTenantStore((s) => s.setAdvancedField)

  const [step, setStep] = useState(0)

  function completeSetup() {
    setAdvancedField('_setupComplete', true)
    // Sincronizar el draft para que un futuro switchTenant no cargue _setupComplete = false
    const state = useTenantStore.getState()
    saveDraft(state.advanced.tenantCode, state)
    navigate('/brand')
  }

  function finish() { completeSetup() }
  function skip()   { completeSetup() }

  const { Component } = STEPS[step]
  const isLast  = step === STEPS.length - 1
  const isFirst = step === 0

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 0 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.4px' }}>
            Configuración inicial
          </div>
          <button
            onClick={skip}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, color: 'rgba(255,255,255,0.3)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Space Mono, monospace',
            }}
          >
            Saltar por ahora <X size={10} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>
          {tenantName} · Paso {step + 1} de {STEPS.length}
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const done   = i < step
          const active = i === step
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <button
                onClick={() => i <= step && setStep(i)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: i <= step ? 'pointer' : 'default',
                  padding: 0,
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: done ? primaryColor : active ? `${primaryColor}20` : 'rgba(255,255,255,0.05)',
                  border: done ? 'none' : active ? `2px solid ${primaryColor}` : '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s ease',
                }}>
                  {done
                    ? <Check size={15} color="#fff" />
                    : <s.Icon size={14} color={active ? primaryColor : 'rgba(255,255,255,0.25)'} />
                  }
                </div>
                <div style={{
                  fontSize: 9, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                  color: active ? 'rgba(255,255,255,0.7)' : done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  transition: 'color 0.25s ease',
                }}>
                  {s.label}
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, marginBottom: 18, marginLeft: 8, marginRight: 8,
                  background: i < step ? primaryColor : 'rgba(255,255,255,0.07)',
                  borderRadius: 1, transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido del step */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: '24px 24px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          {(() => { const S = STEPS[step]; return <S.Icon size={16} color={primaryColor} /> })()}
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
            {STEPS[step].label}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            <Component primaryColor={primaryColor} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <div style={{ display: 'flex', gap: 8 }}>
        {!isFirst && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              fontSize: 12, fontFamily: 'Sora, sans-serif',
            }}
          >
            <ChevronLeft size={14} /> Anterior
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!isLast ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', borderRadius: 8, border: 'none',
              background: primaryColor, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'Sora, sans-serif',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Siguiente <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={finish}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', borderRadius: 8, border: 'none',
              background: primaryColor, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'Sora, sans-serif',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Check size={14} /> Finalizar configuración
          </button>
        )}
      </div>
    </div>
  )
}
