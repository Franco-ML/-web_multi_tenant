import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Check, Minus, Circle, ArrowUp, Loader, ScanLine,
  ChevronDown, Lock, Sparkles, AlertCircle, ChevronRight,
  ToggleLeft, ToggleRight, Globe2,
} from 'lucide-react'
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

function docState(doc) {
  if (!doc) return 'off'
  return doc.required !== false ? 'required' : 'optional'
}

function cycleState(current) {
  if (!current)                   return 'optional'
  if (current.required === false) return 'required'
  return null  // → desactivar
}

// ─── Vista de un solo país ────────────────────────────────────────────────────

function SingleCountryDocs({ country, templates, baseDocs, loading }) {
  const navigate          = useNavigate()
  const setCountryDocs    = useTenantStore(s => s.setCountryDocuments)
  const setCountryIdTypes = useTenantStore(s => s.setCountryIdTypes)

  const hasOwn = country.documents !== null && country.documents !== undefined

  function activateCustom() {
    // Inicializar con los templates base como punto de partida
    const initial = templates.map(t => {
      const base = baseDocs.find(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === t.code)
      return {
        key:         t.code,
        templateCode: t.code,
        label:       t.code,
        required:    base ? base.required !== false : false,
        ocr_enabled: true,
      }
    })
    setCountryDocs(country.countryCode, initial)
  }

  function resetToBase() {
    setCountryDocs(country.countryCode, null)
  }

  function toggleDoc(templateCode) {
    const docs = [...(country.documents ?? [])]
    const idx  = docs.findIndex(d => (d.templateCode ?? d.key) === templateCode)
    const curr = idx >= 0 ? docs[idx] : null
    const next = cycleState(curr)

    if (!next) {
      setCountryDocs(country.countryCode, docs.filter((_, i) => i !== idx))
      return
    }
    const entry = { key: templateCode, templateCode, label: templateCode, required: next === 'required', ocr_enabled: curr?.ocr_enabled ?? true }
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], required: entry.required }
    } else {
      docs.push(entry)
    }
    setCountryDocs(country.countryCode, docs)
  }

  function toggleOcr(templateCode) {
    const docs = (country.documents ?? []).map(d =>
      (d.templateCode ?? d.key) === templateCode ? { ...d, ocr_enabled: !d.ocr_enabled } : d
    )
    setCountryDocs(country.countryCode, docs)
  }

  if (loading) return <LoadingState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Banner de modo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderRadius: 12,
        background: hasOwn ? 'rgba(232,23,93,0.07)' : 'rgba(255,255,255,0.03)',
        border: hasOwn ? '1px solid rgba(232,23,93,0.25)' : '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: hasOwn ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.05)',
            border: hasOwn ? '1px solid rgba(232,23,93,0.25)' : '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {hasOwn ? <Sparkles size={14} color="#E8175D" /> : <ArrowUp size={14} color="rgba(255,255,255,0.4)" />}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: hasOwn ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', fontFamily: 'Sora' }}>
              {hasOwn ? 'Configuración propia' : 'Usando configuración base'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginTop: 1 }}>
              {hasOwn
                ? `${country.documents.length} tipos de documento configurados`
                : 'Los documentos se toman de la configuración global del tenant'}
            </div>
          </div>
        </div>
        {hasOwn ? (
          <button
            onClick={resetToBase}
            style={{
              padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Sora', fontWeight: 600,
            }}
          >
            Restaurar base
          </button>
        ) : (
          <button
            onClick={activateCustom}
            style={{
              padding: '7px 14px', borderRadius: 7, cursor: 'pointer',
              background: '#E8175D', border: 'none',
              color: '#fff', fontSize: 11, fontFamily: 'Sora', fontWeight: 700,
              boxShadow: '0 3px 12px rgba(232,23,93,0.3)',
            }}
          >
            Personalizar documentos
          </button>
        )}
      </div>

      {/* Lista de templates */}
      {templates.length === 0 ? (
        <div style={{
          padding: '32px 20px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
        }}>
          <AlertCircle size={22} color="rgba(255,255,255,0.2)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora' }}>
            No hay templates de documentos disponibles
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', marginTop: 4 }}>
            El servidor OCR no devolvió templates
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {templates.map(t => {
            const baseDoc = baseDocs.find(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === t.code)
            const customDoc = hasOwn ? (country.documents ?? []).find(d => (d.templateCode ?? d.key) === t.code) : undefined
            const effectiveDoc = hasOwn ? customDoc : baseDoc
            const state = docState(effectiveDoc)
            const ocrOn = effectiveDoc?.ocr_enabled !== false

            const isCustomized = hasOwn && (
              (customDoc === undefined && baseDoc !== undefined) ||
              (customDoc !== undefined && baseDoc === undefined) ||
              (customDoc !== undefined && baseDoc !== undefined && customDoc.required !== baseDoc.required)
            )

            return (
              <div
                key={t.code}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 11,
                  background: state === 'required' ? 'rgba(16,185,129,0.05)'
                    : state === 'optional' ? 'rgba(99,179,237,0.04)'
                    : 'rgba(255,255,255,0.02)',
                  border: state === 'required' ? '1px solid rgba(16,185,129,0.18)'
                    : state === 'optional' ? '1px solid rgba(99,179,237,0.15)'
                    : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.12s',
                }}
              >
                {/* Icono estado */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: state === 'required' ? 'rgba(16,185,129,0.12)'
                    : state === 'optional' ? 'rgba(99,179,237,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  border: state === 'required' ? '1px solid rgba(16,185,129,0.25)'
                    : state === 'optional' ? '1px solid rgba(99,179,237,0.2)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}>
                  {state === 'required' && <Check size={14} color="#10B981" />}
                  {state === 'optional' && <Circle size={14} color="#63B3ED" />}
                  {state === 'off'      && <Minus  size={14} color="rgba(255,255,255,0.2)" />}
                </div>

                {/* Info del template */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora' }}>
                      {t.code}
                    </span>
                    {isCustomized && (
                      <span style={{
                        fontSize: 7, padding: '1px 5px', borderRadius: 3,
                        background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.25)',
                        color: '#E8175D', fontFamily: 'Space Mono', letterSpacing: '0.05em',
                      }}>MODIFICADO</span>
                    )}
                    {!hasOwn && baseDoc === undefined && (
                      <span style={{
                        fontSize: 7, padding: '1px 5px', borderRadius: 3,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono',
                      }}>no en base</span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginTop: 2 }}>
                    {t.fields?.length ?? 0} campo{(t.fields?.length ?? 0) !== 1 ? 's' : ''} · OCR Gemini
                    {!hasOwn && <span style={{ color: 'rgba(255,255,255,0.2)' }}> · heredado de base</span>}
                  </div>
                </div>

                {/* Estado badge */}
                <div style={{ fontSize: 9, fontFamily: 'Space Mono', fontWeight: 700, minWidth: 48, textAlign: 'center' }}>
                  {state === 'required' && <span style={{ color: '#10B981' }}>REQUERIDO</span>}
                  {state === 'optional' && <span style={{ color: '#63B3ED' }}>OPCIONAL</span>}
                  {state === 'off'      && <span style={{ color: 'rgba(255,255,255,0.2)' }}>DESACT.</span>}
                </div>

                {/* OCR toggle — solo si está activo el doc */}
                {state !== 'off' && (
                  <button
                    disabled={!hasOwn}
                    onClick={() => hasOwn && toggleOcr(t.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 9px', borderRadius: 6,
                      background: ocrOn ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                      border: ocrOn ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
                      cursor: hasOwn ? 'pointer' : 'default',
                      opacity: hasOwn ? 1 : 0.5,
                    }}
                    title={hasOwn ? (ocrOn ? 'Desactivar OCR' : 'Activar OCR') : 'Activa config propia para editar'}
                  >
                    <ScanLine size={10} color={ocrOn ? '#10B981' : 'rgba(255,255,255,0.25)'} />
                    <span style={{ fontSize: 9, fontFamily: 'Space Mono', color: ocrOn ? '#10B981' : 'rgba(255,255,255,0.25)' }}>
                      OCR
                    </span>
                    {ocrOn
                      ? <ToggleRight size={13} color="#10B981" />
                      : <ToggleLeft  size={13} color="rgba(255,255,255,0.2)" />
                    }
                  </button>
                )}

                {/* Ciclar estado — solo en config propia */}
                {hasOwn ? (
                  <button
                    onClick={() => toggleDoc(t.code)}
                    style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                    }}
                    title="Cambiar estado: requerido → opcional → desactivado"
                  >
                    <ChevronRight size={12} color="rgba(255,255,255,0.4)" />
                  </button>
                ) : (
                  <div style={{ width: 28, flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Nota OCR */}
      {templates.length > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: 9,
          background: 'rgba(99,179,237,0.04)', border: '1px solid rgba(99,179,237,0.1)',
          display: 'flex', gap: 9, alignItems: 'flex-start',
        }}>
          <ScanLine size={12} color="rgba(99,179,237,0.55)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 9, color: 'rgba(99,179,237,0.6)', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(99,179,237,0.8)' }}>OCR via Gemini 1.5 Flash.</strong>
            {' '}Actívalo por documento para que la app mobile extraiga los campos automáticamente al fotografiar el documento.
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Vista matriz (L10 sin país activo) ───────────────────────────────────────

function MatrixView({ countryConfigs, templates, baseDocs, loading }) {
  const navigate          = useNavigate()
  const setCountryDocs    = useTenantStore(s => s.setCountryDocuments)
  const regSteps          = useTenantStore(s => s.registration?.steps ?? [])

  function handleToggle(countryCode, templateCode, currentDoc) {
    const country = countryConfigs.find(c => c.countryCode === countryCode)
    if (!country || country.documents === null) return
    const docs = [...(country.documents ?? [])]
    const idx  = docs.findIndex(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === templateCode)
    const next = cycleState(currentDoc)
    if (!next) {
      setCountryDocs(countryCode, docs.filter((_, i) => i !== idx)); return
    }
    const template = templates.find(t => t.code === templateCode)
    const entry = { key: templateCode, templateCode, label: template?.code ?? templateCode, required: next === 'required', ocr_enabled: true }
    if (idx >= 0) docs[idx] = { ...docs[idx], required: entry.required }
    else docs.push(entry)
    setCountryDocs(countryCode, docs)
  }

  function handleChangeMode(countryCode, mode) {
    if (mode === 'inherit-base') {
      setCountryDocs(countryCode, null)
    } else {
      const country = countryConfigs.find(c => c.countryCode === countryCode)
      if (country?.documents !== null && country?.documents !== undefined) return
      const initial = baseDocs.map(d => ({
        key: d.templateCode ?? d.ocr?.documentType ?? d.key,
        templateCode: d.templateCode ?? d.ocr?.documentType ?? d.key,
        label: d.label ?? d.key,
        required: d.required !== false,
        ocr_enabled: d.ocr?.autofill !== false,
      }))
      setCountryDocs(countryCode, initial.length ? initial : [])
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      {/* Hint para ir al editor por país */}
      <div style={{
        marginBottom: 14, padding: '9px 14px', borderRadius: 9,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 9, fontSize: 10,
        color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono',
      }}>
        <Globe2 size={12} color="rgba(255,255,255,0.3)" />
        Selecciona un país en el menú lateral para ver y editar su configuración de documentos en detalle.
      </div>

      <div style={{
        overflowX: 'auto',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th style={thStickyStyle}><span style={thTextStyle}>País</span></th>
              {templates.map(t => (
                <th key={t.code} style={thStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <span style={thTextStyle}>{t.code}</span>
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>{t.fields?.length ?? 0}c</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countryConfigs.map(country => {
              const hasOwn = country.documents !== null && country.documents !== undefined
              return (
                <tr key={country.countryCode}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStickyStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 22, height: 16, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                          <FlagImage code={country.countryCode} size={22} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora' }}>
                            {country.name ?? country.countryCode}
                          </div>
                          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                            {country.countryCode}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/countries/${country.id}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '2px 7px', borderRadius: 4,
                          background: hasOwn ? 'rgba(232,23,93,0.1)' : 'rgba(255,255,255,0.05)',
                          border: hasOwn ? '1px solid rgba(232,23,93,0.25)' : '1px solid rgba(255,255,255,0.09)',
                          color: hasOwn ? '#E8175D' : 'rgba(255,255,255,0.4)',
                          fontSize: 8, fontFamily: 'Space Mono', cursor: 'pointer',
                        }}
                      >
                        {hasOwn ? <Lock size={7} /> : <ArrowUp size={7} />}
                        {hasOwn ? 'Propio' : 'Hereda base'}
                        <ChevronRight size={7} />
                      </button>
                    </div>
                  </td>
                  {templates.map(t => {
                    if (!hasOwn) {
                      const baseDoc = baseDocs.find(d => (d.templateCode ?? d.ocr?.documentType ?? d.key) === t.code)
                      return (
                        <td key={t.code} style={cellStyle('inherit')}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {baseDoc
                              ? <ArrowUp size={9} color="rgba(255,255,255,0.2)" />
                              : <Minus size={9} color="rgba(255,255,255,0.1)" />}
                            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>base</span>
                          </div>
                        </td>
                      )
                    }
                    const doc = (country.documents ?? []).find(d => (d.templateCode ?? d.key) === t.code)
                    const state = docState(doc)
                    return (
                      <td key={t.code} style={cellStyle(state === 'required' ? 'required' : state === 'optional' ? 'optional' : 'disabled')}>
                        <button
                          onClick={() => handleToggle(country.countryCode, t.code, doc ?? null)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 5, width: '100%' }}
                        >
                          {state === 'required' && <><Check size={10} color="rgba(52,199,89,0.9)" /><span style={{ fontSize: 7, color: 'rgba(52,199,89,0.8)', fontFamily: 'Space Mono' }}>req</span></>}
                          {state === 'optional' && <><Circle size={10} color="rgba(99,179,237,0.8)" /><span style={{ fontSize: 7, color: 'rgba(99,179,237,0.7)', fontFamily: 'Space Mono' }}>opc</span></>}
                          {state === 'off'      && <Minus size={10} color="rgba(255,255,255,0.2)" />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const tenantCode     = useTenantStore(s => s.advanced.tenantCode)
  const setupComplete  = useTenantStore(s => s.advanced._setupComplete === true)
  const countryConfigs = useTenantStore(s => s.countryConfigs)
  const activeCountry  = useTenantStore(s => s.activeCountry)
  const regSteps       = useTenantStore(s => s.registration?.steps ?? [])

  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)

  if (!tenantCode)    return <Navigate to="/brand" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  useEffect(() => {
    apiFetch(`${SERVER_URL}/ocr/templates`)
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  const baseDocs   = getBaseDocuments(regSteps)
  const activeConf = activeCountry ? countryConfigs.find(c => c.countryCode === activeCountry) : null

  // ── Título dinámico ────────────────────────────────────────────────────────

  const title    = activeConf ? `Documentos · ${activeConf.name ?? activeConf.countryCode}` : 'Documentos y validación'
  const subtitle = activeConf
    ? 'Configura qué documentos y OCR aplican a este país'
    : 'Vista general de documentos por país. Selecciona un país para editar en detalle.'

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} icon={FileText} />

      {/* Header de país activo */}
      {activeConf && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ width: 28, height: 20, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
            <FlagImage code={activeConf.countryCode} size={28} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora' }}>
              {activeConf.name ?? activeConf.countryCode}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginLeft: 8 }}>
              {activeConf.countryCode}
            </span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
            {countryConfigs.length > 1 ? `${countryConfigs.length} países en el tenant` : '1 país en el tenant'}
          </div>
        </div>
      )}

      {/* Sin países */}
      {countryConfigs.length === 0 ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
        }}>
          <FileText size={28} color="rgba(255,255,255,0.12)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora', marginBottom: 4 }}>
            Sin países configurados
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
            Configura países primero en la sección Países
          </div>
        </div>
      ) : activeConf ? (
        <SingleCountryDocs
          country={activeConf}
          templates={templates}
          baseDocs={baseDocs}
          loading={loading}
        />
      ) : (
        <MatrixView
          countryConfigs={countryConfigs}
          templates={templates}
          baseDocs={baseDocs}
          loading={loading}
        />
      )}
    </div>
  )
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function cellStyle(variant) {
  const base = {
    padding: '8px 6px', minWidth: 90, textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.1s',
  }
  if (variant === 'required') return { ...base, background: 'rgba(52,199,89,0.05)' }
  if (variant === 'optional') return { ...base, background: 'rgba(99,179,237,0.05)' }
  if (variant === 'inherit')  return { ...base, background: 'rgba(255,255,255,0.01)' }
  return { ...base, background: 'rgba(255,255,255,0.01)' }
}

const thStyle = {
  padding: '10px 8px', textAlign: 'center', minWidth: 90,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  borderRight: '1px solid rgba(255,255,255,0.04)',
}
const thStickyStyle = {
  ...thStyle, position: 'sticky', left: 0, zIndex: 2,
  minWidth: 180, textAlign: 'left',
  background: 'rgba(14,16,22,0.97)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
}
const thTextStyle = {
  fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em',
}
const tdStickyStyle = {
  padding: '10px 12px', minWidth: 180,
  position: 'sticky', left: 0, zIndex: 1,
  background: 'rgba(14,16,22,0.97)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '30px 0', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
        <Loader size={16} color="rgba(255,255,255,0.3)" />
      </motion.div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono' }}>
        Cargando templates OCR…
      </span>
    </div>
  )
}
