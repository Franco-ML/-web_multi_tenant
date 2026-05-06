import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Lock, LogIn, ClipboardList, Map, User,
  ChevronDown, ChevronUp, Phone, Mail, Plus, Trash2, FileText, Eye, EyeOff,
  Smartphone, Camera, Moon, KeyRound, AlertCircle, MailOpen,
} from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import { useSimulatorStore } from '../store/useSimulatorStore'
import PageHeader from '../components/ui/PageHeader'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const sectionLabelStyle = {
  fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  fontFamily: 'Space Mono', marginBottom: 6,
}

const metaInputStyle = {
  width: '100%', padding: '6px 9px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  color: 'rgba(255,255,255,0.75)', fontSize: 11,
  fontFamily: 'Sora', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const addBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', borderRadius: 6,
  border: '1px solid rgba(232,23,93,0.3)',
  background: 'rgba(232,23,93,0.08)',
  color: 'rgba(232,23,93,0.8)', fontSize: 10,
  fontFamily: 'Sora', fontWeight: 600, cursor: 'pointer',
}

const FIELD_TYPE_COLORS = {
  text: '#93C5FD', select: '#A78BFA', date: '#6EE7B7',
  phone: '#FCD34D', email: '#FCA5A5', number: '#FB923C',
}
const FIELD_TYPES = ['text', 'select', 'date', 'phone', 'email', 'number']

// ─── Toggle de feature ────────────────────────────────────────────────────────

function FeatureSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: enabled ? '#E8175D' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position: 'absolute', top: 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

// ─── Sub-toggle de opción ─────────────────────────────────────────────────────

function SubToggle({ label, description, icon: Icon, checked, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px',
      background: checked ? 'rgba(232,23,93,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${checked ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 8, transition: 'all 0.2s',
      opacity: disabled ? 0.4 : 1,
    }}>
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {Icon && <Icon size={14} color={checked ? 'rgba(232,23,93,0.8)' : 'rgba(255,255,255,0.35)'} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginTop: 1 }}>
            {description}
          </div>
        )}
      </div>
      <FeatureSwitch enabled={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// ─── Módulo principal acordeón ────────────────────────────────────────────────

function ModuleCard({ icon: Icon, label, description, required, enabled, onToggle, children, defaultOpen, accentColor = '#E8175D' }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${(enabled ?? true) ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        opacity: (enabled ?? true) ? 1 : 0.55,
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: (enabled ?? true) ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${(enabled ?? true) ? `${accentColor}30` : 'rgba(255,255,255,0.07)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <Icon size={16} color={(enabled ?? true) ? accentColor : 'rgba(255,255,255,0.25)'} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, fontFamily: 'Sora', letterSpacing: '-0.3px',
            color: (enabled ?? true) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
          }}>
            {label}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 1 }}>
            {description}
          </div>
        </div>

        {required ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Lock size={9} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
              requerido
            </span>
          </div>
        ) : (
          <FeatureSwitch
            enabled={enabled}
            onChange={onToggle}
          />
        )}

        <div style={{ flexShrink: 0, marginLeft: 4, color: 'rgba(255,255,255,0.25)' }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '14px 18px 18px',
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Módulo LOGIN ─────────────────────────────────────────────────────────────

function LoginModule() {
  const login = useTenantStore((s) => s.login)
  const setLoginField = useTenantStore((s) => s.setLoginField)
  const [pinOpen, setPinOpen] = useState(false)

  const bothDisabled = !login.phoneEnabled && !login.emailEnabled

  function toggle(field) {
    const next = !login[field]
    if (!next && (field === 'phoneEnabled' ? !login.emailEnabled : !login.phoneEnabled)) return
    setLoginField(field, next)
  }

  return (
    <ModuleCard
      icon={LogIn}
      label="Inicio de sesión"
      description="Métodos de acceso y seguridad de la app"
      required
      defaultOpen
    >
      <div style={{ marginBottom: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
        Métodos de acceso · al menos uno requerido
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SubToggle
          icon={Smartphone}
          label="Número de teléfono"
          description="El mensajero ingresa su teléfono y recibe un código de verificación"
          checked={login.phoneEnabled}
          onChange={() => toggle('phoneEnabled')}
          disabled={login.phoneEnabled && !login.emailEnabled}
        />
        <SubToggle
          icon={Mail}
          label="Correo electrónico"
          description="El mensajero ingresa su correo y contraseña"
          checked={login.emailEnabled}
          onChange={() => toggle('emailEnabled')}
          disabled={login.emailEnabled && !login.phoneEnabled}
        />
      </div>
      {bothDisabled && (
        <div style={{ marginTop: 8, fontSize: 10, color: '#f87171', fontFamily: 'Space Mono' }}>
          Debe haber al menos un método activo
        </div>
      )}

      {/* PIN de seguridad */}
      <div
        onClick={() => setPinOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
          padding: '8px 12px', borderRadius: 8, cursor: 'pointer', userSelect: 'none',
          background: pinOpen ? 'rgba(88,86,214,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${pinOpen ? 'rgba(88,86,214,0.25)' : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.2s',
        }}
      >
        <KeyRound size={13} color={pinOpen ? '#5856D6' : 'rgba(255,255,255,0.3)'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
            PIN de seguridad
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 1 }}>
            Código numérico requerido al abrir la app
          </div>
        </div>
        {pinOpen ? <ChevronUp size={12} color="rgba(255,255,255,0.25)" /> : <ChevronDown size={12} color="rgba(255,255,255,0.25)" />}
      </div>

      <AnimatePresence initial={false}>
        {pinOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SubToggle
                icon={KeyRound}
                label="Requerir PIN"
                description="El mensajero debe crear un PIN al registrarse"
                checked={login.pinRequired ?? true}
                onChange={(v) => setLoginField('pinRequired', v)}
              />
              {(login.pinRequired ?? true) && (
                <>
                  <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Longitud del PIN
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[4, 6, 8].map(len => (
                        <button
                          key={len}
                          onClick={() => setLoginField('pinLength', len)}
                          style={{
                            flex: 1, padding: '7px', borderRadius: 7,
                            border: (login.pinLength ?? 4) === len ? '1px solid rgba(88,86,214,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            background: (login.pinLength ?? 4) === len ? 'rgba(88,86,214,0.15)' : 'transparent',
                            color: (login.pinLength ?? 4) === len ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                            fontSize: 12, fontFamily: 'Space Mono', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {len} {'●'.repeat(len > 4 ? 4 : len)}{len > 4 ? '…' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SubToggle
                    icon={MailOpen}
                    label="Recuperar PIN por correo"
                    description="El mensajero puede restablecer su PIN desde su email"
                    checked={login.pinRecoveryViaEmail ?? true}
                    onChange={(v) => setLoginField('pinRecoveryViaEmail', v)}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleCard>
  )
}

// ─── Módulo REGISTRO ──────────────────────────────────────────────────────────

function RegistrationModule() {
  const steps = useTenantStore((s) => s.registration.steps)
  const updateStep = useTenantStore((s) => s.updateRegistrationStep)
  const updateField = useTenantStore((s) => s.updateStepField)
  const addField = useTenantStore((s) => s.addStepField)
  const removeField = useTenantStore((s) => s.removeStepField)
  const setActiveScreen = useSimulatorStore((s) => s.setActiveScreen)
  const [expandedStep, setExpandedStep] = useState(null)

  const activeCount = steps.filter(s => s.enabled !== false).length

  function handleExpand(idx) {
    setExpandedStep(expandedStep === idx ? null : idx)
    setActiveScreen('onboarding')
  }

  return (
    <ModuleCard
      icon={ClipboardList}
      label="Registro"
      description="Onboarding de nuevos mensajeros"
      required
      defaultOpen
    >
      <div style={{ marginBottom: 10, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
        {activeCount} de {steps.length} pasos activos · click en un paso para configurar sus campos
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, idx) => (
          <StepRow
            key={step.id}
            step={step}
            stepIndex={idx}
            isExpanded={expandedStep === idx}
            onToggle={() => handleExpand(idx)}
            onEnableToggle={(e) => { e.stopPropagation(); updateStep(idx, { enabled: step.enabled === false }) }}
            updateField={updateField}
            addField={addField}
            removeField={removeField}
          />
        ))}
      </div>
    </ModuleCard>
  )
}

function StepRow({ step, stepIndex, isExpanded, onToggle, onEnableToggle, updateField, addField, removeField }) {
  const isEnabled = step.enabled !== false

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${isEnabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
      borderRadius: 10, overflow: 'hidden',
      opacity: isEnabled ? 1 : 0.5, transition: 'opacity 0.2s',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: isEnabled ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isEnabled ? 'rgba(232,23,93,0.25)' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
          color: isEnabled ? '#E8175D' : 'rgba(255,255,255,0.25)',
          fontFamily: 'Space Mono', transition: 'all 0.2s',
        }}>
          {stepIndex + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: isEnabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)', fontFamily: 'Sora' }}>
            {step.label}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', marginTop: 1 }}>
            {step.fields.length} campos · {step.documents.length} docs
          </div>
        </div>
        <button
          onClick={onEnableToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
        >
          {isEnabled
            ? <Eye size={13} color="rgba(255,255,255,0.3)" />
            : <EyeOff size={13} color="rgba(255,255,255,0.2)" />
          }
        </button>
        {isExpanded ? <ChevronUp size={13} color="rgba(255,255,255,0.25)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.25)" />}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Metadatos */}
              <div>
                <div style={sectionLabelStyle}>Metadatos</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
                  <MetaField label="Etiqueta" value={step.label}
                    onChange={(v) => useTenantStore.getState().updateRegistrationStep(stepIndex, { label: v })} />
                  <MetaField label="Ícono (Feather)" value={step.icon} mono
                    onChange={(v) => useTenantStore.getState().updateRegistrationStep(stepIndex, { icon: v })} />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <MetaField label="Subtítulo" value={step.subtitle}
                      onChange={(v) => useTenantStore.getState().updateRegistrationStep(stepIndex, { subtitle: v })} />
                  </div>
                </div>
              </div>

              {/* Campos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={sectionLabelStyle}>Campos</div>
                  <button
                    onClick={() => addField(stepIndex, { key: `campo_${Date.now()}`, label: 'Nuevo campo', type: 'text', required: false })}
                    style={addBtnStyle}
                  >
                    <Plus size={10} />Agregar
                  </button>
                </div>
                {step.fields.length === 0 && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'Space Mono', paddingBottom: 4 }}>
                    Sin campos
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {step.fields.map((field, fi) => (
                    <FieldRow
                      key={fi}
                      field={field}
                      onChange={(patch) => updateField(stepIndex, fi, patch)}
                      onRemove={() => removeField(stepIndex, fi)}
                    />
                  ))}
                </div>
              </div>

              {/* Documentos (solo lectura) */}
              {step.documents.length > 0 && (
                <div>
                  <div style={sectionLabelStyle}>Documentos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {step.documents.map((doc) => (
                      <div key={doc.key} style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '6px 9px',
                        background: 'rgba(110,231,183,0.04)',
                        border: '1px solid rgba(110,231,183,0.1)', borderRadius: 6,
                      }}>
                        <FileText size={11} color="rgba(110,231,183,0.6)" />
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', fontFamily: 'Sora' }}>
                          {doc.label}
                        </span>
                        {doc.ocr?.autofill && (
                          <span style={{
                            fontSize: 8, padding: '1px 5px', borderRadius: 3,
                            background: 'rgba(110,231,183,0.1)', color: 'rgba(110,231,183,0.7)',
                            fontFamily: 'Space Mono',
                          }}>Lectura auto</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.12)', fontFamily: 'Space Mono' }}>
                    Edición avanzada de documentos en la sección Documentos
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── FieldRow y MetaField (portados desde RegistrationPage) ───────────────────

function FieldRow({ field, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 7, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', cursor: 'pointer' }}
      >
        <span style={{
          fontSize: 8, fontFamily: 'Space Mono', padding: '2px 6px', borderRadius: 4, fontWeight: 700,
          background: `${FIELD_TYPE_COLORS[field.type] ?? '#aaa'}18`,
          color: FIELD_TYPE_COLORS[field.type] ?? '#aaa', flexShrink: 0,
        }}>{field.type}</span>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>{field.label}</span>
        <span style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.18)' }}>{field.key}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onChange({ required: !field.required }) }}
          style={{
            padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
            border: `1px solid ${field.required ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`,
            background: field.required ? 'rgba(255,59,48,0.08)' : 'transparent',
            color: field.required ? 'rgba(255,59,48,0.8)' : 'rgba(255,255,255,0.2)',
            fontSize: 8, fontFamily: 'Space Mono', flexShrink: 0,
          }}
        >{field.required ? 'requerido' : 'opcional'}</button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.4, display: 'flex' }}
        ><Trash2 size={11} color="#FF3B30" /></button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '8px 9px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 10px' }}>
              <MetaField label="Etiqueta" value={field.label} onChange={(v) => onChange({ label: v })} placeholder="Etiqueta visible" />
              <div>
                <label style={{ ...sectionLabelStyle, fontSize: 9 }}>Tipo</label>
                <select value={field.type} onChange={(e) => onChange({ type: e.target.value })}
                  style={{ ...metaInputStyle, cursor: 'pointer' }}>
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <MetaField label="Placeholder" value={field.placeholder ?? ''} onChange={(v) => onChange({ placeholder: v })} placeholder="Texto de ayuda" />
              <MetaField label="Fuente opciones" value={field.optionsSource ?? ''} onChange={(v) => onChange({ optionsSource: v || undefined })} placeholder="catalog/types" mono />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MetaField({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label style={{ ...sectionLabelStyle, fontSize: 9 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...metaInputStyle, fontFamily: mono ? 'Space Mono' : 'Sora' }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.4)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  )
}

// ─── Módulo RUTAS ─────────────────────────────────────────────────────────────

function RoutesModule() {
  const features = useTenantStore((s) => s.features)
  const setFeature = useTenantStore((s) => s.setFeature)
  const enabled = features.routesEnabled

  return (
    <ModuleCard
      icon={Map}
      label="Rutas y entregas"
      description="Tab de rutas y gestión de entregas en tiempo real"
      enabled={enabled}
      onToggle={(v) => setFeature('routesEnabled', v)}
      accentColor="#34C759"
    >
      {/* Banner de infraestructura requerida */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px', marginBottom: 10,
        background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.2)',
        borderRadius: 8,
      }}>
        <AlertCircle size={14} color="rgba(255,149,0,0.7)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 10, color: 'rgba(255,149,0,0.7)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
          Este módulo requiere el servidor de tracking activo. Actívalo solo cuando la infraestructura de rutas esté lista.
        </div>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <SubToggle
              icon={Map}
              label="Mapa integrado"
              description="Muestra el mapa en el detalle de cada entrega"
              checked={features.googleMapsEnabled}
              onChange={(v) => setFeature('googleMapsEnabled', v)}
            />
            <SubToggle
              icon={Camera}
              label="Captura de documentos"
              description="Cámara para fotografiar órdenes y comprobantes"
              checked={features.scanningEnabled}
              onChange={(v) => setFeature('scanningEnabled', v)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!enabled && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>
          Módulo desactivado — el tab de rutas no aparece en la app
        </div>
      )}
    </ModuleCard>
  )
}

// ─── Módulo PERFIL ────────────────────────────────────────────────────────────

function ProfileModule() {
  const features = useTenantStore((s) => s.features)
  const setFeature = useTenantStore((s) => s.setFeature)
  const enabled = features.profileEnabled

  return (
    <ModuleCard
      icon={User}
      label="Perfil"
      description="Tab de perfil del mensajero"
      enabled={enabled}
      onToggle={(v) => setFeature('profileEnabled', v)}
      accentColor="#5856D6"
    >
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <SubToggle
              icon={Moon}
              label="Toggle de modo oscuro"
              description="El mensajero puede cambiar entre tema claro y oscuro"
              checked={features.darkModeToggleEnabled}
              onChange={(v) => setFeature('darkModeToggleEnabled', v)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!enabled && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>
          Módulo desactivado — el tab de perfil no aparece en la app
        </div>
      )}
    </ModuleCard>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ModulesPage() {
  return (
    <div>
      <PageHeader
        title="Pantallas y funciones"
        subtitle="Configura qué secciones y opciones estarán disponibles en la app del mensajero."
        icon={LayoutGrid}
      />
      <LoginModule />
      <RegistrationModule />
      <RoutesModule />
      <ProfileModule />
    </div>
  )
}
