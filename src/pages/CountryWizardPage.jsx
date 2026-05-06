import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, Palette, LayoutGrid, FileText, CreditCard,
  ChevronLeft, ChevronRight, Check, ArrowLeft,
  Banknote, Wallet, ArrowRightLeft, Map, User, Clock,
  AlertCircle,
} from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import FlagImage from '../components/ui/FlagImage'

const STEPS = [
  { id: 'identity',  label: 'Identidad',       Icon: Image },
  { id: 'colors',    label: 'Colores',          Icon: Palette },
  { id: 'features',  label: 'Funciones',        Icon: LayoutGrid },
  { id: 'documents', label: 'Documentos',       Icon: FileText },
  { id: 'payment',   label: 'Pagos',            Icon: CreditCard },
]

const COLOR_PRESETS = [
  '#E8175D', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#0EA5E9', '#64748B', '#1E293B', '#7C3AED', '#059669',
]

const PAYMENT_META = {
  cash:     { label: 'Efectivo',          Icon: Banknote,        desc: 'Cobro en mano al momento de la entrega' },
  card:     { label: 'Tarjeta',           Icon: CreditCard,      desc: 'Débito y crédito' },
  wallet:   { label: 'Billetera digital', Icon: Wallet,          desc: 'SINPE, Nequi, Daviplata y similares' },
  transfer: { label: 'Transferencia',     Icon: ArrowRightLeft,  desc: 'Bancaria o interbancaria' },
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
      fontFamily: 'Space Mono, monospace', textTransform: 'uppercase',
      letterSpacing: '0.1em', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function FieldInput({ label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora', marginBottom: 6 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: 'rgba(255,255,255,0.9)', fontSize: 13,
          fontFamily: 'Sora, sans-serif', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      {hint && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 5 }}>
          {hint}
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange, label, desc, Icon, accent = '#E8175D' }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
        background: checked ? `${accent}08` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${checked ? `${accent}30` : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: checked ? `${accent}18` : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        <Icon size={14} color={checked ? accent : 'rgba(255,255,255,0.3)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: checked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', fontFamily: 'Sora' }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 2 }}>
            {desc}
          </div>
        )}
      </div>
      <div style={{
        width: 36, height: 20, borderRadius: 10, flexShrink: 0,
        background: checked ? accent : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }} />
      </div>
    </div>
  )
}

function StepIdentity({ country, baseBranding, patchModule }) {
  const name = country.moduleModes?.branding === 'custom'
    ? (country.customModules?.branding?.name ?? baseBranding.name)
    : baseBranding.name

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle>Imagen de marca para este país</SectionTitle>
      <FieldInput
        label="Nombre de la empresa"
        value={name}
        onChange={v => patchModule('branding', { ...(country.customModules?.branding ?? {}), name: v })}
        placeholder={baseBranding.name || 'Nombre en este país'}
        hint="Puede ser igual al nombre base o una variante local (ej. Moover México)"
      />
      <div style={{
        padding: '10px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', lineHeight: 1.6,
      }}>
        El logo específico por país se puede cargar desde la sección <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Imagen de marca</strong> una vez el país esté activo.
      </div>
    </div>
  )
}

function StepColors({ country, baseTheme, patchModule }) {
  const effectiveTheme = country.moduleModes?.theme === 'custom'
    ? (country.customModules?.theme ?? baseTheme)
    : baseTheme
  const primary = effectiveTheme.light?.primary ?? '#E8175D'

  function applyColor(color) {
    patchModule('theme', {
      ...effectiveTheme,
      light: { ...effectiveTheme.light, primary: color },
      dark:  { ...effectiveTheme.dark,  primary: color },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle>Color principal del país</SectionTitle>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: primary, boxShadow: `0 4px 20px ${primary}60`,
          border: '2px solid rgba(255,255,255,0.15)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora', marginBottom: 6 }}>
            Valor hexadecimal
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="color"
              value={primary}
              onChange={e => applyColor(e.target.value)}
              style={{
                width: 36, height: 36, padding: 0, border: 'none',
                borderRadius: 6, cursor: 'pointer', background: 'transparent',
              }}
            />
            <input
              value={primary}
              onChange={e => {
                const v = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) applyColor(v)
              }}
              style={{
                flex: 1, padding: '8px 10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 7, color: 'rgba(255,255,255,0.9)', fontSize: 13,
                fontFamily: 'Space Mono, monospace', outline: 'none', letterSpacing: '0.05em',
              }}
              onFocus={e => e.target.style.borderColor = `${primary}80`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora', marginBottom: 8 }}>
          Presets
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {COLOR_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => applyColor(c)}
              style={{
                width: 28, height: 28, borderRadius: 7, cursor: 'pointer',
                background: c, border: primary === c ? '2px solid #fff' : '2px solid transparent',
                boxShadow: primary === c ? `0 0 0 2px ${c}` : 'none',
                transition: 'all 0.12s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepFeatures({ country, baseFeatures, patchModule }) {
  const eff = country.moduleModes?.features === 'custom'
    ? { ...baseFeatures, ...country.customModules?.features }
    : baseFeatures

  function toggle(key, value) {
    patchModule('features', { ...eff, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionTitle>Módulos activos en este país</SectionTitle>
      <Toggle
        checked={eff.routesEnabled}
        onChange={v => toggle('routesEnabled', v)}
        label="Rutas y entregas"
        desc="Tab de rutas y gestión de entregas en tiempo real"
        Icon={Map}
        accent="#34C759"
      />
      <Toggle
        checked={eff.profileEnabled}
        onChange={v => toggle('profileEnabled', v)}
        label="Perfil del mensajero"
        desc="Tab de perfil con ajustes y estadísticas"
        Icon={User}
        accent="#5856D6"
      />
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginTop: 4,
        background: 'rgba(255,149,0,0.05)', border: '1px solid rgba(255,149,0,0.15)',
        display: 'flex', gap: 8,
      }}>
        <AlertCircle size={13} color="rgba(255,149,0,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 9, color: 'rgba(255,149,0,0.6)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
          Rutas requiere el servidor de tracking activo. Puedes habilitarlo ahora y ajustarlo después desde Funciones.
        </div>
      </div>
    </div>
  )
}

function StepDocuments({ country, setCountryDocumentsMode }) {
  const isCustom = country.documents !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle>Templates de documentos</SectionTitle>
      {[
        {
          value: false,
          label: 'Usar base del sistema',
          desc: 'Los templates configurados globalmente para este país se aplican automáticamente.',
        },
        {
          value: true,
          label: 'Configurar propios',
          desc: 'Definirás qué documentos acepta la app para este país. Se configura en detalle desde la sección Documentos.',
        },
      ].map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => setCountryDocumentsMode(country.id, opt.value)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
            background: isCustom === opt.value ? 'rgba(232,23,93,0.07)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${isCustom === opt.value ? 'rgba(232,23,93,0.3)' : 'rgba(255,255,255,0.07)'}`,
            textAlign: 'left', transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
            border: `2px solid ${isCustom === opt.value ? '#E8175D' : 'rgba(255,255,255,0.2)'}`,
            background: isCustom === opt.value ? '#E8175D' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {isCustom === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora', marginBottom: 3 }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
              {opt.desc}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function StepPayment({ country, basePaymentMethods, patchModule }) {
  const eff = country.moduleModes?.paymentMethods === 'custom'
    ? (country.customModules?.paymentMethods ?? basePaymentMethods)
    : basePaymentMethods

  function toggle(key, value) {
    patchModule('paymentMethods', { ...eff, [key]: { ...eff[key], enabled: value } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionTitle>Métodos de pago disponibles</SectionTitle>
      {Object.entries(PAYMENT_META).map(([key, { label, Icon, desc }]) => (
        <Toggle
          key={key}
          checked={eff[key]?.enabled ?? false}
          onChange={v => toggle(key, v)}
          label={label}
          desc={desc}
          Icon={Icon}
          accent="#E8175D"
        />
      ))}
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginTop: 4,
        background: 'rgba(99,179,237,0.05)', border: '1px solid rgba(99,179,237,0.15)',
        display: 'flex', gap: 8,
      }}>
        <Clock size={13} color="rgba(99,179,237,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 9, color: 'rgba(99,179,237,0.7)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
          La integración de pasarelas de pago estará disponible próximamente. Tu selección quedará guardada y se activará cuando esté lista.
        </div>
      </div>
    </div>
  )
}

export default function CountryWizardPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const country            = useTenantStore(s => s.countryConfigs.find(c => c.id === id))
  const baseBranding       = useTenantStore(s => s.branding)
  const baseTheme          = useTenantStore(s => s.theme)
  const baseFeatures       = useTenantStore(s => s.features)
  const basePaymentMethods = useTenantStore(s => s.paymentMethods)
  const primaryColor       = useTenantStore(s => s.theme.light?.primary ?? '#E8175D')

  const setCountryCustomModule  = useTenantStore(s => s.setCountryCustomModule)
  const setCountryModuleMode    = useTenantStore(s => s.setCountryModuleMode)
  const setCountryDraftStep     = useTenantStore(s => s.setCountryDraftStep)
  const setCountryDocumentsMode = useTenantStore(s => s.setCountryDocumentsMode)
  const finalizeCountry         = useTenantStore(s => s.finalizeCountry)

  const [step, setStep] = useState(() => {
    const ds = country?.draftStep ?? 0
    return ds > 0 ? Math.min(ds - 1, STEPS.length - 1) : 0
  })

  if (!country) return <Navigate to="/countries" replace />
  if (country.status === 'active') return <Navigate to={`/countries/${id}`} replace />

  function patchModule(moduleKey, value) {
    setCountryCustomModule(id, moduleKey, value)
    setCountryModuleMode(id, moduleKey, 'custom')
  }

  function handleNext() {
    const next = step + 1
    if (next >= STEPS.length) {
      finalizeCountry(id)
      navigate(`/countries/${id}`)
    } else {
      setCountryDraftStep(id, next + 1)
      setStep(next)
    }
  }

  function handlePrev() {
    setStep(s => Math.max(0, s - 1))
  }

  const isLast = step === STEPS.length - 1
  const accent = country.moduleModes?.theme === 'custom'
    ? (country.customModules?.theme?.light?.primary ?? primaryColor)
    : primaryColor

  return (
    <div style={{ maxWidth: 620 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/countries')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Sora',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          <ArrowLeft size={12} /> Países
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 20, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <FlagImage code={country.countryCode} size={28} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora', letterSpacing: '-0.2px' }}>
              {country.name ?? country.countryCode}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
              Configurando desde cero · {step + 1}/{STEPS.length} pasos
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {STEPS.map((s, i) => {
          const done    = i < step
          const current = i === step
          return (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{
                height: 3, borderRadius: 2,
                background: done || current ? accent : 'rgba(255,255,255,0.08)',
                transition: 'background 0.25s',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  background: done ? accent : current ? `${accent}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done || current ? accent : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done
                    ? <Check size={8} color="#fff" />
                    : <span style={{ fontSize: 7, fontWeight: 700, color: current ? accent : 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>{i + 1}</span>
                  }
                </div>
                <span style={{
                  fontSize: 9, fontFamily: 'Sora', fontWeight: current ? 700 : 500,
                  color: current ? 'rgba(255,255,255,0.8)' : done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.2s',
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '24px 22px',
        marginBottom: 16,
        minHeight: 260,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {step === 0 && (
              <StepIdentity
                country={country}
                baseBranding={baseBranding}
                patchModule={patchModule}
              />
            )}
            {step === 1 && (
              <StepColors
                country={country}
                baseTheme={baseTheme}
                patchModule={patchModule}
              />
            )}
            {step === 2 && (
              <StepFeatures
                country={country}
                baseFeatures={baseFeatures}
                patchModule={patchModule}
              />
            )}
            {step === 3 && (
              <StepDocuments
                country={country}
                setCountryDocumentsMode={setCountryDocumentsMode}
              />
            )}
            {step === 4 && (
              <StepPayment
                country={country}
                basePaymentMethods={basePaymentMethods}
                patchModule={patchModule}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrev}
          disabled={step === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 9, cursor: step === 0 ? 'not-allowed' : 'pointer',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
            fontSize: 12, fontFamily: 'Sora', fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (step > 0) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 9, cursor: 'pointer',
            background: accent, border: 'none',
            color: '#fff', fontSize: 12, fontFamily: 'Sora', fontWeight: 700,
            boxShadow: `0 4px 16px ${accent}45`,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          {isLast ? (
            <><Check size={14} /> Activar país</>
          ) : (
            <>Siguiente <ChevronRight size={14} /></>
          )}
        </motion.button>
      </div>
    </div>
  )
}
