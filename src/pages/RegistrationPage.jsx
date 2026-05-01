import { useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Plus, Trash2, FileText, Type, ToggleLeft, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTenantStore } from '../store/useTenantStore'
import { useSimulatorStore } from '../store/useSimulatorStore'
import SectionCard from '../components/config/SectionCard'
import PageHeader from '../components/ui/PageHeader'

const FIELD_TYPES = ['text', 'select', 'date', 'phone', 'email', 'number']
const STEP_ICONS = ['user-check', 'award', 'phone', 'truck', 'alert-circle', 'clipboard', 'shield', 'star']

const FIELD_TYPE_COLORS = {
  text:   '#93C5FD',
  select: '#A78BFA',
  date:   '#6EE7B7',
  phone:  '#FCD34D',
  email:  '#FCA5A5',
  number: '#FB923C',
}

export default function RegistrationPage() {
  const steps = useTenantStore((s) => s.registration.steps)
  const [expandedStep, setExpandedStep] = useState(0)
  const setActiveScreen = useSimulatorStore((s) => s.setActiveScreen)

  const handleExpandStep = (idx) => {
    setExpandedStep(expandedStep === idx ? null : idx)
    setActiveScreen('onboarding')
  }

  return (
    <div>
      <PageHeader
        title="Pasos de registro"
        subtitle="Configura los campos y documentos del onboarding de mensajeros"
        icon={ClipboardList}
      />

      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          padding: '5px 10px',
          background: 'rgba(147,197,253,0.08)',
          border: '1px solid rgba(147,197,253,0.15)',
          borderRadius: 6,
          fontSize: 10,
          color: 'rgba(147,197,253,0.7)',
          fontFamily: 'Space Mono',
        }}>
          {steps.filter(s => s.enabled !== false).length} pasos activos · {steps.reduce((a, s) => a + s.fields.length, 0)} campos · {steps.reduce((a, s) => a + s.documents.length, 0)} documentos
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>
          → Cambios se reflejan en el simulador
        </div>
      </div>

      {steps.map((step, idx) => (
        <StepEditor
          key={step.id}
          step={step}
          stepIndex={idx}
          isExpanded={expandedStep === idx}
          onToggle={() => handleExpandStep(idx)}
          totalSteps={steps.length}
        />
      ))}
    </div>
  )
}

function StepEditor({ step, stepIndex, isExpanded, onToggle }) {
  const updateStep = useTenantStore((s) => s.updateRegistrationStep)
  const updateField = useTenantStore((s) => s.updateStepField)
  const addField = useTenantStore((s) => s.addStepField)
  const removeField = useTenantStore((s) => s.removeStepField)
  const isEnabled = step.enabled !== false

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stepIndex * 0.06, type: 'spring', stiffness: 380, damping: 36 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isEnabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: isEnabled ? 1 : 0.5,
        transition: 'opacity 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Step header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Number badge */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: isEnabled ? 'rgba(232,23,93,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isEnabled ? 'rgba(232,23,93,0.3)' : 'rgba(255,255,255,0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: isEnabled ? '#E8175D' : 'rgba(255,255,255,0.3)',
          fontFamily: 'Space Mono',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}>
          {stepIndex + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: isEnabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
            fontFamily: 'Sora',
            letterSpacing: '-0.3px',
          }}>
            {step.label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 1 }}>
            {step.subtitle}
          </div>
        </div>

        {/* Field/doc count pills */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <Pill color="#93C5FD" label={`${step.fields.length} campos`} />
          {step.documents.length > 0 && (
            <Pill color="#6EE7B7" label={`${step.documents.length} docs`} />
          )}
        </div>

        {/* Enable toggle */}
        <div
          onClick={(e) => { e.stopPropagation(); updateStep(stepIndex, { enabled: !isEnabled }) }}
          style={{ flexShrink: 0, padding: 4 }}
        >
          {isEnabled
            ? <Eye size={14} color="rgba(255,255,255,0.35)" />
            : <EyeOff size={14} color="rgba(255,255,255,0.2)" />
          }
        </div>

        {isExpanded
          ? <ChevronUp size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
          : <ChevronDown size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
        }
      </div>

      {/* Expanded editor */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '16px 18px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>

              {/* Step metadata */}
              <div>
                <div style={sectionLabelStyle}>Metadatos del paso</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
                  <MetaField
                    label="Etiqueta"
                    value={step.label}
                    onChange={(v) => updateStep(stepIndex, { label: v })}
                    placeholder="Nombre del paso"
                  />
                  <MetaField
                    label="Ícono (Feather)"
                    value={step.icon}
                    onChange={(v) => updateStep(stepIndex, { icon: v })}
                    placeholder="user-check"
                    mono
                  />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <MetaField
                      label="Subtítulo"
                      value={step.subtitle}
                      onChange={(v) => updateStep(stepIndex, { subtitle: v })}
                      placeholder="Descripción breve del paso"
                    />
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={sectionLabelStyle}>Campos del formulario</div>
                  <button
                    onClick={() => addField(stepIndex, { key: `campo_${Date.now()}`, label: 'Nuevo campo', type: 'text', required: false })}
                    style={addBtnStyle}
                  >
                    <Plus size={11} />
                    Agregar campo
                  </button>
                </div>

                {step.fields.length === 0 && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', padding: '8px 0' }}>
                    Sin campos configurados
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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

              {/* Documents (read-only summary) */}
              {step.documents.length > 0 && (
                <div>
                  <div style={sectionLabelStyle}>Documentos requeridos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {step.documents.map((doc) => (
                      <div key={doc.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        background: 'rgba(110,231,183,0.04)',
                        border: '1px solid rgba(110,231,183,0.12)',
                        borderRadius: 7,
                      }}>
                        <FileText size={12} color="rgba(110,231,183,0.7)" />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
                            {doc.label}
                          </span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginLeft: 6 }}>
                            {doc.ocr?.documentType}
                          </span>
                        </div>
                        <span style={{ fontSize: 9, color: doc.required ? 'rgba(255,59,48,0.7)' : 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
                          {doc.required ? 'requerido' : 'opcional'}
                        </span>
                        {doc.ocr?.autofill && (
                          <span style={{
                            fontSize: 8, padding: '2px 5px', borderRadius: 4,
                            background: 'rgba(110,231,183,0.1)', color: 'rgba(110,231,183,0.7)',
                            fontFamily: 'Space Mono',
                          }}>
                            OCR
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,0.15)', fontFamily: 'Space Mono' }}>
                    Edición avanzada de documentos/OCR disponible vía JSON export
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FieldRow({ field, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Type badge */}
        <span style={{
          fontSize: 8,
          fontFamily: 'Space Mono',
          padding: '2px 6px',
          borderRadius: 4,
          background: `${FIELD_TYPE_COLORS[field.type] ?? '#aaa'}18`,
          color: FIELD_TYPE_COLORS[field.type] ?? '#aaa',
          fontWeight: 700,
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}>
          {field.type}
        </span>

        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora', letterSpacing: '-0.2px' }}>
          {field.label}
        </span>
        <span style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.2)' }}>
          {field.key}
        </span>

        <RequiredToggle
          required={field.required}
          onChange={(v) => onChange({ required: v })}
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.4 }}
          title="Eliminar campo"
        >
          <Trash2 size={12} color="#FF3B30" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 10px 12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 12px',
            }}>
              <MetaField
                label="Etiqueta"
                value={field.label}
                onChange={(v) => onChange({ label: v })}
                placeholder="Etiqueta visible"
              />
              <div>
                <label style={{ ...sectionLabelStyle, fontSize: 9 }}>Tipo</label>
                <select
                  value={field.type}
                  onChange={(e) => onChange({ type: e.target.value })}
                  style={{ ...metaInputStyle, cursor: 'pointer' }}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <MetaField
                label="Placeholder"
                value={field.placeholder ?? ''}
                onChange={(v) => onChange({ placeholder: v })}
                placeholder="Texto de ayuda"
              />
              <MetaField
                label="Fuente de opciones (catalog)"
                value={field.optionsSource ?? ''}
                onChange={(v) => onChange({ optionsSource: v || undefined })}
                placeholder="catalog/licenseTypes"
                mono
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RequiredToggle({ required, onChange, onClick }) {
  return (
    <button
      onClick={(e) => { onClick?.(e); onChange(!required) }}
      style={{
        padding: '2px 7px',
        borderRadius: 4,
        border: `1px solid ${required ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`,
        background: required ? 'rgba(255,59,48,0.08)' : 'transparent',
        color: required ? 'rgba(255,59,48,0.8)' : 'rgba(255,255,255,0.2)',
        fontSize: 8,
        fontFamily: 'Space Mono',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
    >
      {required ? 'requerido' : 'opcional'}
    </button>
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

function Pill({ color, label }) {
  return (
    <span style={{
      fontSize: 8,
      padding: '2px 7px',
      borderRadius: 4,
      background: `${color}10`,
      border: `1px solid ${color}22`,
      color: color,
      fontFamily: 'Space Mono',
      fontWeight: 700,
    }}>
      {label}
    </span>
  )
}

const sectionLabelStyle = {
  fontSize: 9,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: 'Space Mono',
  marginBottom: 6,
}

const metaInputStyle = {
  width: '100%',
  padding: '6px 9px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  color: 'rgba(255,255,255,0.75)',
  fontSize: 11,
  fontFamily: 'Sora',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const addBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid rgba(232,23,93,0.3)',
  background: 'rgba(232,23,93,0.08)',
  color: 'rgba(232,23,93,0.8)',
  fontSize: 10,
  fontFamily: 'Sora',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}
