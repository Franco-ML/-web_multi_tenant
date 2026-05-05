import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, Check, Minus, Circle, ArrowUp, Loader, Lock, ScanLine } from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import { apiFetch } from '../lib/api'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBaseDocuments(registrationSteps) {
  const docs = []
  const seen = new Set()
  for (const step of registrationSteps ?? []) {
    for (const doc of step.documents ?? []) {
      const key = doc.templateCode ?? doc.ocr?.documentType ?? doc.key
      if (key && !seen.has(key)) { seen.add(key); docs.push(doc) }
    }
  }
  return docs
}

function isDocEnabled(docs, templateCode) {
  if (!docs) return null  // inherited
  return docs.find(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === templateCode) ?? null
}

function cycleState(current) {
  if (!current)                    return 'optional'
  if (current.required === false)  return 'required'
  return null  // disabled
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

function DocCell({ doc, templateCode, editable, onToggle, onToggleOcr }) {
  if (!editable) {
    // inherited
    return (
      <td style={cellStyle('inherit')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <ArrowUp size={10} color="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace' }}>base</span>
        </div>
      </td>
    )
  }

  if (!doc) {
    return (
      <td style={cellStyle('disabled')}>
        <button onClick={() => onToggle(templateCode, null)} style={cellBtnStyle}>
          <Minus size={11} color="rgba(255,255,255,0.2)" />
        </button>
      </td>
    )
  }

  const isRequired = doc.required !== false
  const ocrOn      = doc.ocr_enabled !== false

  return (
    <td style={cellStyle(isRequired ? 'required' : 'optional')}>
      <button onClick={() => onToggle(templateCode, doc)} style={cellBtnStyle}>
        {isRequired
          ? <Check size={11} color="rgba(52,199,89,0.9)" />
          : <Circle size={11} color="rgba(99,179,237,0.8)" />
        }
        <span style={{
          fontSize: 8,
          color: isRequired ? 'rgba(52,199,89,0.8)' : 'rgba(99,179,237,0.7)',
          fontFamily: 'Space Mono, monospace',
        }}>
          {isRequired ? 'req' : 'opc'}
        </span>
      </button>
      <button
        onClick={e => { e.stopPropagation(); onToggleOcr(templateCode, doc, ocrOn) }}
        title={ocrOn ? 'OCR activo' : 'OCR desactivado'}
        style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '2px 5px', borderRadius: 4, border: 'none',
          background: 'transparent', cursor: 'pointer', marginTop: 2,
        }}
      >
        <ScanLine size={8} color={ocrOn ? 'rgba(52,199,89,0.7)' : 'rgba(255,255,255,0.2)'} />
        <span style={{
          fontSize: 7, color: ocrOn ? 'rgba(52,199,89,0.7)' : 'rgba(255,255,255,0.2)',
          fontFamily: 'Space Mono, monospace',
        }}>
          OCR
        </span>
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: ocrOn ? 'rgba(52,199,89,0.8)' : 'rgba(255,255,255,0.15)',
        }} />
      </button>
    </td>
  )
}

const cellBtnStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px',
  borderRadius: 5, width: '100%',
}

function cellStyle(variant) {
  const base = {
    padding: '8px 6px', minWidth: 90, textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.12s ease',
  }
  if (variant === 'required') return { ...base, background: 'rgba(52,199,89,0.05)' }
  if (variant === 'optional') return { ...base, background: 'rgba(99,179,237,0.05)' }
  if (variant === 'inherit')  return { ...base, background: 'rgba(255,255,255,0.01)' }
  return { ...base, background: 'rgba(255,255,255,0.01)' }
}

// ─── InheritancePicker ────────────────────────────────────────────────────────

function InheritancePicker({ country, allCountries, onChangeMode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasOwn = country.documents !== null && country.documents !== undefined
  const label = hasOwn ? 'Config propia' : 'Hereda base'

  const others = allCountries.filter(c => c.countryCode !== country.countryCode && c.status === 'active')

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 7px', borderRadius: 5,
          background: hasOwn ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.06)',
          border: hasOwn ? '1px solid rgba(232,23,93,0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: hasOwn ? 'rgba(232,23,93,0.9)' : 'rgba(255,255,255,0.5)',
          fontSize: 8, fontFamily: 'Space Mono, monospace', cursor: 'pointer',
        }}
      >
        {hasOwn ? <Lock size={7} /> : <ArrowUp size={7} />}
        {label}
        <ChevronDown size={7} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 200,
              background: 'rgba(18,21,30,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, minWidth: 170,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            <PickerOption label="Hereda base" sub="sin override" active={!hasOwn} onClick={() => { onChangeMode('inherit-base'); setOpen(false) }} />
            {others.map(o => (
              <PickerOption
                key={o.countryCode}
                label={`Hereda de ${o.name ?? o.countryCode}`}
                sub={o.countryCode}
                active={false}
                onClick={() => { onChangeMode('inherit-from', o); setOpen(false) }}
                flag={o.countryCode}
              />
            ))}
            <PickerOption label="Config propia" sub="override por documento" active={hasOwn} onClick={() => { onChangeMode('own'); setOpen(false) }} accent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PickerOption({ label, sub, active, onClick, accent, flag }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 12px', border: 'none',
        background: active ? 'rgba(232,23,93,0.1)' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = active ? 'rgba(232,23,93,0.15)' : 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = active ? 'rgba(232,23,93,0.1)' : 'transparent'}
    >
      {flag && (
        <div style={{ width: 16, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
          <FlagImage code={flag} size={16} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: accent ? '#E8175D' : 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
          {label}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>{sub}</div>
      </div>
      {active && <Check size={10} color="#E8175D" style={{ marginLeft: 'auto' }} />}
    </button>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const tenantCode       = useTenantStore(s => s.advanced.tenantCode)
  const setupComplete    = useTenantStore(s => s.advanced._setupComplete === true)
  const countryConfigs   = useTenantStore(s => s.countryConfigs)
  const regSteps         = useTenantStore(s => s.registration?.steps ?? [])
  const setCountryDocs   = useTenantStore(s => s.setCountryDocuments)

  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)

  if (!tenantCode)    return <Navigate to="/branding" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  useEffect(() => {
    apiFetch(`${SERVER_URL}/ocr/templates`)
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  const baseDocs   = getBaseDocuments(regSteps)
  const withOwn    = countryConfigs.filter(c => c.documents !== null && c.documents !== undefined).length
  const inheriting = countryConfigs.length - withOwn

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleToggle(countryCode, templateCode, currentDoc) {
    const country = countryConfigs.find(c => c.countryCode === countryCode)
    if (!country || country.documents === null) return

    const docs    = [...(country.documents ?? [])]
    const idx     = docs.findIndex(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === templateCode)
    const nextState = cycleState(currentDoc)

    if (!nextState) {
      // disabled → remove
      const updated = docs.filter((_, i) => i !== idx)
      setCountryDocs(countryCode, updated)
      return
    }

    const template = templates.find(t => t.code === templateCode)
    const entry = {
      key:          templateCode,
      templateCode,
      label:        template?.code ?? templateCode,
      required:     nextState === 'required',
      ocr_enabled:  true,
    }

    if (idx >= 0) {
      docs[idx] = { ...docs[idx], required: entry.required }
    } else {
      docs.push(entry)
    }
    setCountryDocs(countryCode, docs)
  }

  function handleToggleOcr(countryCode, templateCode, currentDoc, ocrOn) {
    const country = countryConfigs.find(c => c.countryCode === countryCode)
    if (!country || country.documents === null) return
    const docs = (country.documents ?? []).map(d =>
      (d.templateCode ?? d.ocr?.documentType ?? d.key) === templateCode
        ? { ...d, ocr_enabled: !ocrOn }
        : d
    )
    setCountryDocs(countryCode, docs)
  }

  function handleChangeMode(countryCode, mode, sourceCountry) {
    if (mode === 'inherit-base' || mode === 'inherit-from') {
      setCountryDocs(countryCode, null)
    } else {
      // own: copiar docs base como punto de partida
      const country = countryConfigs.find(c => c.countryCode === countryCode)
      const existing = country?.documents
      if (existing !== null && existing !== undefined) return  // ya tiene
      const initial = baseDocs.map(d => ({
        key:          d.templateCode ?? d.ocr?.documentType ?? d.key,
        templateCode: d.templateCode ?? d.ocr?.documentType ?? d.key,
        label:        d.label ?? d.key,
        required:     d.required !== false,
        ocr_enabled:  d.ocr?.autofill !== false,
      }))
      setCountryDocs(countryCode, initial.length ? initial : [])
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Documentos y OCR"
        subtitle="Configura qué documentos requiere cada país y qué campos extrae el OCR."
        icon={FileText}
      />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <Stat label="Templates OCR" value={loading ? '…' : templates.length} />
        <Stat label="Países con config propia" value={withOwn} accent="#E8175D" />
        <Stat label="Heredando base" value={inheriting} />
      </div>

      {countryConfigs.length === 0 ? (
        <Empty />
      ) : loading ? (
        <LoadingState />
      ) : (
        <div style={{
          overflowX: 'auto',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
        }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {/* Columna país */}
                <th style={thStickyStyle}>
                  <span style={thTextStyle}>País</span>
                </th>
                {templates.map(t => (
                  <th key={t.code} style={thStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={thTextStyle}>{t.code}</span>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono, monospace' }}>
                        {t.fields.length} campos
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
                      padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.08)',
                      fontSize: 8, fontFamily: 'Space Mono, monospace',
                      fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.06em',
                    }}>
                      BASE
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'Sora, sans-serif' }}>
                      Config del tenant
                    </span>
                  </div>
                </td>
                {templates.map(t => {
                  const doc = isDocEnabled(baseDocs, t.code)
                  return (
                    <td key={t.code} style={cellStyle(doc ? (doc.required !== false ? 'required' : 'optional') : 'disabled')}>
                      {doc ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          {doc.required !== false
                            ? <Check size={11} color="rgba(52,199,89,0.7)" />
                            : <Circle size={11} color="rgba(99,179,237,0.6)" />
                          }
                          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace' }}>
                            {doc.required !== false ? 'req' : 'opc'}
                          </span>
                        </div>
                      ) : (
                        <Minus size={10} color="rgba(255,255,255,0.15)" />
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Filas de países */}
              {countryConfigs.map(country => {
                const hasOwn = country.documents !== null && country.documents !== undefined
                return (
                  <tr key={country.countryCode} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
                              {country.countryCode}
                            </div>
                          </div>
                        </div>
                        <InheritancePicker
                          country={country}
                          allCountries={countryConfigs}
                          onChangeMode={(mode, src) => handleChangeMode(country.countryCode, mode, src)}
                        />
                      </div>
                    </td>

                    {/* Celdas de documentos */}
                    {templates.map(t => {
                      if (!hasOwn) {
                        return (
                          <td key={t.code} style={cellStyle('inherit')}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <ArrowUp size={10} color="rgba(255,255,255,0.15)" />
                              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace' }}>base</span>
                            </div>
                          </td>
                        )
                      }
                      const doc = isDocEnabled(country.documents, t.code)
                      return (
                        <DocCell
                          key={t.code}
                          doc={doc}
                          templateCode={t.code}
                          editable={true}
                          onToggle={(code, currentDoc) => handleToggle(country.countryCode, code, currentDoc)}
                          onToggleOcr={(code, currentDoc, ocrOn) => handleToggleOcr(country.countryCode, code, currentDoc, ocrOn)}
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

      {/* Nota OCR */}
      <div style={{
        marginTop: 18, padding: '11px 14px',
        background: 'rgba(99,179,237,0.04)',
        border: '1px solid rgba(99,179,237,0.1)',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <ScanLine size={13} color="rgba(99,179,237,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 10, color: 'rgba(99,179,237,0.65)', fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(99,179,237,0.85)' }}>OCR vía Gemini 1.5 Flash.</strong>
          {' '}Cuando OCR está activo en un documento, la app mobile envía la foto a{' '}
          <code style={{ background: 'rgba(99,179,237,0.08)', padding: '1px 4px', borderRadius: 3 }}>POST /ocr/extract</code>
          {' '}y los campos extraídos se rellenan automáticamente en el formulario de registro.
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

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
      <FileText size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
        Sin países configurados
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>
        Configura países en la sección Países antes de gestionar documentos
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '30px 0', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
        <Loader size={16} color="rgba(255,255,255,0.3)" />
      </motion.div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
        Cargando templates OCR…
      </span>
    </div>
  )
}

const thStyle = {
  padding: '10px 8px', textAlign: 'center', minWidth: 90,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  borderRight: '1px solid rgba(255,255,255,0.04)',
}

const thStickyStyle = {
  ...thStyle,
  position: 'sticky', left: 0, zIndex: 2,
  minWidth: 190, textAlign: 'left',
  background: 'rgba(14,16,22,0.97)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
}

const thTextStyle = {
  fontSize: 8, fontWeight: 700,
  color: 'rgba(255,255,255,0.45)',
  fontFamily: 'Space Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
}

const tdStickyStyle = {
  padding: '10px 12px',
  position: 'sticky', left: 0, zIndex: 1,
  background: 'rgba(14,16,22,0.97)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  minWidth: 190,
}
