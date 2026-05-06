import { useState, useEffect, useRef, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe2, FileText, Search, Plus, Trash2, ScanLine,
  ToggleLeft, ToggleRight, Loader, AlertCircle, ChevronRight, X,
} from 'lucide-react'
import { useUserRole } from '../hooks/useUserRole'
import { apiFetch } from '../lib/api'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

const FONT_SORA  = 'Sora, sans-serif'
const FONT_MONO  = '"Space Mono", monospace'
const ACCENT     = '#E8175D'
const GREEN      = '#10B981'
const BLUE       = '#63B3ED'
const BORDER     = 'rgba(255,255,255,0.07)'
const PANEL_BG   = 'rgba(255,255,255,0.03)'

function Spinner({ size = 14, color = 'rgba(255,255,255,0.3)' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Loader size={size} color={color} />
    </motion.div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 14px', borderRadius: 30,
      background: PANEL_BG, border: `1px solid ${BORDER}`,
    }}>
      <span style={{
        fontSize: 18, fontWeight: 800, fontFamily: FONT_SORA,
        color: color ?? 'rgba(255,255,255,0.85)',
        lineHeight: 1,
      }}>{value}</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: FONT_MONO }}>{label}</span>
    </div>
  )
}

function ActiveBadge({ active }) {
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, fontFamily: FONT_MONO, letterSpacing: '0.06em',
      padding: '2px 7px', borderRadius: 4,
      background: active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
      border: active ? '1px solid rgba(16,185,129,0.25)' : `1px solid ${BORDER}`,
      color: active ? GREEN : 'rgba(255,255,255,0.3)',
    }}>
      {active ? 'ACTIVO' : 'INACTIVO'}
    </span>
  )
}

function ActiveDot({ active }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
      background: active ? GREEN : 'rgba(255,255,255,0.15)',
      boxShadow: active ? `0 0 6px ${GREEN}` : 'none',
    }} />
  )
}

function InlineError({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, marginTop: 6,
      fontSize: 10, color: '#ff6b6b', fontFamily: FONT_MONO,
    }}>
      <AlertCircle size={11} />
      {msg}
    </div>
  )
}

function SmallToggle({ active, onToggle, loading }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle() }}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', padding: 0,
        background: 'transparent', border: 'none', cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.5 : 1, flexShrink: 0,
      }}
      title={active ? 'Desactivar país' : 'Activar país'}
    >
      {active
        ? <ToggleRight size={20} color={GREEN} />
        : <ToggleLeft  size={20} color="rgba(255,255,255,0.2)" />
      }
    </button>
  )
}

export default function SystemCountriesPage() {
  const { isSystem } = useUserRole()
  if (!isSystem) return <Navigate to="/" replace />

  const [countries,      setCountries]      = useState([])
  const [loadingList,    setLoadingList]     = useState(true)
  const [listError,      setListError]       = useState('')
  const [search,         setSearch]          = useState('')
  const [selectedIso,    setSelectedIso]     = useState(null)
  const [toggleLoading,  setToggleLoading]   = useState({})

  const [documents,      setDocuments]       = useState([])
  const [loadingDocs,    setLoadingDocs]      = useState(false)
  const [docsError,      setDocsError]       = useState('')
  const [docToggleLoad,  setDocToggleLoad]   = useState({})
  const [docDeleteLoad,  setDocDeleteLoad]   = useState({})

  const [availFields,    setAvailFields]     = useState([])
  const fieldsLoadedRef  = useRef(false)

  const [showAddForm,    setShowAddForm]     = useState(false)
  const [formCode,       setFormCode]        = useState('')
  const [formName,       setFormName]        = useState('')
  const [formHasBack,    setFormHasBack]     = useState(true)
  const [formOcr,        setFormOcr]         = useState(true)
  const [formFields,     setFormFields]      = useState([])
  const [formSaving,     setFormSaving]      = useState(false)
  const [formError,      setFormError]       = useState('')

  useEffect(() => {
    setLoadingList(true)
    setListError('')
    apiFetch(`${SERVER_URL}/system/countries`)
      .then(r => r.json())
      .then(d => setCountries(d.countries ?? []))
      .catch(() => setListError('No se pudo cargar la lista de países'))
      .finally(() => setLoadingList(false))
  }, [])

  const selectedCountry = countries.find(c => c.iso_2 === selectedIso) ?? null

  useEffect(() => {
    if (!selectedIso) return
    setLoadingDocs(true)
    setDocsError('')
    setDocuments([])
    setShowAddForm(false)
    apiFetch(`${SERVER_URL}/system/countries/${selectedIso}/documents`)
      .then(r => r.json())
      .then(d => setDocuments(d.documents ?? []))
      .catch(() => setDocsError('No se pudo cargar los documentos'))
      .finally(() => setLoadingDocs(false))
  }, [selectedIso])

  const loadAvailFields = useCallback(() => {
    if (fieldsLoadedRef.current) return
    fieldsLoadedRef.current = true
    apiFetch(`${SERVER_URL}/system/document-fields`)
      .then(r => r.json())
      .then(d => setAvailFields(d.fields ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedIso) loadAvailFields()
  }, [selectedIso, loadAvailFields])

  function handleToggleCountry(iso2) {
    setToggleLoading(prev => ({ ...prev, [iso2]: true }))
    const prev = countries.find(c => c.iso_2 === iso2)
    setCountries(list => list.map(c => c.iso_2 === iso2 ? { ...c, active: !c.active } : c))
    apiFetch(`${SERVER_URL}/system/countries/${iso2}/toggle`, { method: 'PATCH' })
      .then(r => r.json())
      .then(d => {
        if (d.country) {
          setCountries(list => list.map(c => c.iso_2 === iso2 ? { ...c, ...d.country } : c))
        }
      })
      .catch(() => {
        setCountries(list => list.map(c => c.iso_2 === iso2 ? { ...c, active: prev?.active } : c))
      })
      .finally(() => setToggleLoading(prev => { const n = { ...prev }; delete n[iso2]; return n }))
  }

  function handleToggleDoc(code) {
    const doc = documents.find(d => d.code === code)
    if (!doc) return
    setDocToggleLoad(prev => ({ ...prev, [code]: true }))
    const nextActive = !doc.active
    setDocuments(list => list.map(d => d.code === code ? { ...d, active: nextActive } : d))
    apiFetch(`${SERVER_URL}/system/documents/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextActive }),
    })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => {
        setDocuments(list => list.map(d => d.code === code ? { ...d, active: doc.active } : d))
      })
      .finally(() => setDocToggleLoad(prev => { const n = { ...prev }; delete n[code]; return n }))
  }

  function handleDeleteDoc(code) {
    setDocDeleteLoad(prev => ({ ...prev, [code]: true }))
    const backup = [...documents]
    setDocuments(list => list.filter(d => d.code !== code))
    apiFetch(`${SERVER_URL}/system/documents/${code}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => setDocuments(backup))
      .finally(() => setDocDeleteLoad(prev => { const n = { ...prev }; delete n[code]; return n }))
  }

  function handleOpenAddForm() {
    setFormCode('')
    setFormName('')
    setFormHasBack(true)
    setFormOcr(true)
    setFormFields([])
    setFormError('')
    setShowAddForm(true)
  }

  function handleCancelAdd() {
    setShowAddForm(false)
    setFormError('')
  }

  function toggleFormField(key) {
    setFormFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleSaveDoc() {
    const code = formCode.trim().toUpperCase()
    const name = formName.trim()
    if (!code) { setFormError('El código es obligatorio'); return }
    if (!name) { setFormError('El nombre es obligatorio'); return }
    setFormError('')
    setFormSaving(true)
    try {
      const fields = availFields
        .filter(f => formFields.includes(f.key))
        .map(f => ({ key: f.key, label: f.label, required: false }))
      const r = await apiFetch(`${SERVER_URL}/system/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          countryIso: selectedIso,
          hasBack: formHasBack,
          ocrSupported: formOcr,
          fields,
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message ?? `Error ${r.status}`)
      }
      const newDoc = { id: Date.now(), code, name, has_back: formHasBack, ocr_supported: formOcr, active: true, fields }
      setDocuments(prev => [...prev, newDoc])
      setCountries(list => list.map(c =>
        c.iso_2 === selectedIso
          ? { ...c, doc_templates: (c.doc_templates ?? 0) + 1 }
          : c
      ))
      setShowAddForm(false)
    } catch (e) {
      setFormError(e.message ?? 'Error al guardar el documento')
    } finally {
      setFormSaving(false)
    }
  }

  const filtered = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.iso_2?.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive = countries.filter(c => c.active).length
  const totalDocs   = countries.reduce((s, c) => s + (c.doc_templates ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', padding: '28px 28px 60px' }}>
      <PageHeader
        title="Catálogo del sistema"
        subtitle="Gestiona países disponibles y sus documentos base para todos los tenants."
        icon={Globe2}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatPill label="países activos" value={totalActive} color={GREEN} />
        <StatPill label="templates totales" value={totalDocs} color={BLUE} />
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        <div style={{
          width: 280, flexShrink: 0,
          background: PANEL_BG, border: `1px solid ${BORDER}`,
          borderRadius: 14, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 220px)',
        }}>
          <div style={{ padding: '12px 12px 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
              borderRadius: 9, padding: '8px 12px',
            }}>
              <Search size={13} color="rgba(255,255,255,0.3)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar país…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: FONT_SORA,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={11} color="rgba(255,255,255,0.3)" />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {loadingList ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
                <Spinner />
              </div>
            ) : listError ? (
              <div style={{ padding: '16px 16px', textAlign: 'center' }}>
                <InlineError msg={listError} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                padding: '24px 16px', textAlign: 'center',
                fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: FONT_MONO,
              }}>
                Sin resultados
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map(country => {
                  const isSelected = country.iso_2 === selectedIso
                  return (
                    <motion.div
                      key={country.iso_2}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedIso(country.iso_2)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '9px 12px', cursor: 'pointer',
                        borderLeft: isSelected ? `3px solid ${ACCENT}` : '3px solid transparent',
                        background: isSelected ? 'rgba(232,23,93,0.06)' : 'transparent',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <FlagImage code={country.iso_2} size={18} style={{ height: 13, borderRadius: 2 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, fontFamily: FONT_SORA,
                          color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {country.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                          {(country.doc_templates ?? 0) > 0 && (
                            <span style={{
                              fontSize: 8, padding: '1px 5px', borderRadius: 3,
                              background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.18)',
                              color: BLUE, fontFamily: FONT_MONO,
                            }}>
                              {country.doc_templates} docs
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <ActiveDot active={country.active} />
                        <SmallToggle
                          active={country.active}
                          onToggle={() => handleToggleCountry(country.iso_2)}
                          loading={!!toggleLoading[country.iso_2]}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedCountry ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '72px 20px', gap: 14,
              background: PANEL_BG, border: `1px dashed ${BORDER}`, borderRadius: 14,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Globe2 size={22} color="rgba(255,255,255,0.2)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: FONT_SORA, marginBottom: 4 }}>
                  Selecciona un país
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: FONT_MONO }}>
                  Elige un país de la lista para ver y editar sus documentos base
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '18px 20px', borderBottom: `1px solid ${BORDER}`,
                background: 'rgba(255,255,255,0.015)',
              }}>
                <FlagImage code={selectedCountry.iso_2} size={36} style={{ height: 26, borderRadius: 4 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.92)' }}>
                      {selectedCountry.name}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
                      color: 'rgba(255,255,255,0.4)', fontFamily: FONT_MONO, letterSpacing: '0.05em',
                    }}>
                      {selectedCountry.iso_2}
                    </span>
                    <ActiveBadge active={selectedCountry.active} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_MONO, marginTop: 3 }}>
                    {selectedCountry.iso_3 && `ISO3: ${selectedCountry.iso_3}`}
                    {selectedCountry.phone_code && ` · +${selectedCountry.phone_code}`}
                  </div>
                </div>
                <SmallToggle
                  active={selectedCountry.active}
                  onToggle={() => handleToggleCountry(selectedCountry.iso_2)}
                  loading={!!toggleLoading[selectedCountry.iso_2]}
                />
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.55)' }}>
                    Documentos base
                  </span>
                  {!showAddForm && (
                    <button
                      onClick={handleOpenAddForm}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
                        background: ACCENT, border: 'none',
                        color: '#fff', fontSize: 11, fontFamily: FONT_SORA, fontWeight: 700,
                        boxShadow: '0 3px 14px rgba(232,23,93,0.3)',
                      }}
                    >
                      <Plus size={13} />
                      Agregar documento
                    </button>
                  )}
                </div>

                {loadingDocs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                    <Spinner />
                  </div>
                ) : docsError ? (
                  <InlineError msg={docsError} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnimatePresence initial={false}>
                      {documents.length === 0 && !showAddForm ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            padding: '28px 16px', textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 12,
                          }}
                        >
                          <FileText size={20} color="rgba(255,255,255,0.1)" style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_SORA }}>
                            Sin documentos configurados
                          </div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: FONT_MONO, marginTop: 3 }}>
                            Agrega el primer template para este país
                          </div>
                        </motion.div>
                      ) : (
                        documents.map(doc => (
                          <motion.div
                            key={doc.code}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            layout
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '11px 14px', borderRadius: 11,
                              background: doc.active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                              border: doc.active ? `1px solid rgba(255,255,255,0.08)` : `1px solid rgba(255,255,255,0.04)`,
                              opacity: doc.active ? 1 : 0.55,
                              transition: 'all 0.12s',
                            }}
                          >
                            <div style={{
                              padding: '3px 8px', borderRadius: 5, flexShrink: 0,
                              background: 'rgba(232,23,93,0.08)', border: '1px solid rgba(232,23,93,0.18)',
                              fontSize: 9, fontWeight: 700, fontFamily: FONT_MONO, letterSpacing: '0.05em',
                              color: '#E8175D',
                            }}>
                              {doc.code}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', fontFamily: FONT_SORA }}>
                                {doc.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                {doc.ocr_supported && (
                                  <span style={{
                                    display: 'flex', alignItems: 'center', gap: 3,
                                    fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(99,179,237,0.7)',
                                    padding: '1px 5px', borderRadius: 3,
                                    background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.15)',
                                  }}>
                                    <ScanLine size={8} /> OCR
                                  </span>
                                )}
                                {doc.has_back && (
                                  <span style={{
                                    fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.3)',
                                    padding: '1px 5px', borderRadius: 3,
                                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                                  }}>
                                    tiene reverso
                                  </span>
                                )}
                                {(doc.fields?.length ?? 0) > 0 && (
                                  <span style={{
                                    fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.25)',
                                  }}>
                                    {doc.fields.length} campo{doc.fields.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleDoc(doc.code)}
                              disabled={!!docToggleLoad[doc.code]}
                              style={{
                                display: 'flex', alignItems: 'center', padding: 0,
                                background: 'transparent', border: 'none',
                                cursor: docToggleLoad[doc.code] ? 'wait' : 'pointer',
                                opacity: docToggleLoad[doc.code] ? 0.5 : 1, flexShrink: 0,
                              }}
                              title={doc.active ? 'Desactivar documento' : 'Activar documento'}
                            >
                              {doc.active
                                ? <ToggleRight size={22} color={GREEN} />
                                : <ToggleLeft  size={22} color="rgba(255,255,255,0.2)" />
                              }
                            </button>

                            <button
                              onClick={() => handleDeleteDoc(doc.code)}
                              disabled={!!docDeleteLoad[doc.code]}
                              style={{
                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                                cursor: docDeleteLoad[doc.code] ? 'wait' : 'pointer',
                                opacity: docDeleteLoad[doc.code] ? 0.5 : 1,
                                transition: 'all 0.1s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,23,93,0.1)'; e.currentTarget.style.borderColor = 'rgba(232,23,93,0.3)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                              title="Eliminar documento"
                            >
                              {docDeleteLoad[doc.code]
                                ? <Spinner size={11} />
                                : <Trash2 size={12} color="rgba(255,255,255,0.35)" />
                              }
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showAddForm && (
                        <motion.div
                          key="add-form"
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          style={{
                            background: 'rgba(232,23,93,0.04)',
                            border: '1px solid rgba(232,23,93,0.18)',
                            borderRadius: 12, overflow: 'hidden',
                          }}
                        >
                          <div style={{ padding: '16px 16px' }}>
                            <div style={{
                              fontSize: 10, fontWeight: 700, fontFamily: FONT_SORA,
                              color: 'rgba(255,255,255,0.55)', marginBottom: 12,
                              textTransform: 'uppercase', letterSpacing: '0.07em',
                            }}>
                              Nuevo documento
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                              <div style={{ flex: '0 0 140px' }}>
                                <label style={{ display: 'block', fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                                  CÓDIGO *
                                </label>
                                <input
                                  value={formCode}
                                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                                  placeholder="Ej: DNI_CO"
                                  maxLength={20}
                                  style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                                    borderRadius: 8, padding: '8px 10px',
                                    fontSize: 12, fontFamily: FONT_MONO, letterSpacing: '0.04em',
                                    color: 'rgba(255,255,255,0.85)', outline: 'none',
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 160 }}>
                                <label style={{ display: 'block', fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                                  NOMBRE *
                                </label>
                                <input
                                  value={formName}
                                  onChange={e => setFormName(e.target.value)}
                                  placeholder="Ej: Cédula de ciudadanía"
                                  style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                                    borderRadius: 8, padding: '8px 10px',
                                    fontSize: 12, fontFamily: FONT_SORA,
                                    color: 'rgba(255,255,255,0.85)', outline: 'none',
                                  }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                              {[
                                { key: 'hasBack', label: 'Tiene reverso', value: formHasBack, set: setFormHasBack },
                                { key: 'ocr',     label: 'OCR habilitado', value: formOcr,     set: setFormOcr },
                              ].map(item => (
                                <label
                                  key={item.key}
                                  style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.value}
                                    onChange={e => item.set(e.target.checked)}
                                    style={{ accentColor: ACCENT, width: 13, height: 13, cursor: 'pointer' }}
                                  />
                                  <span style={{ fontSize: 11, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.65)' }}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>

                            {availFields.length > 0 && (
                              <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.06em' }}>
                                  CAMPOS OCR
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {availFields.map(f => {
                                    const checked = formFields.includes(f.key)
                                    return (
                                      <label
                                        key={f.key}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: 5,
                                          padding: '5px 9px', borderRadius: 6, cursor: 'pointer',
                                          background: checked ? 'rgba(99,179,237,0.1)' : 'rgba(255,255,255,0.03)',
                                          border: checked ? '1px solid rgba(99,179,237,0.25)' : `1px solid ${BORDER}`,
                                          transition: 'all 0.1s',
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleFormField(f.key)}
                                          style={{ accentColor: BLUE, width: 11, height: 11, cursor: 'pointer' }}
                                        />
                                        <span style={{
                                          fontSize: 10, fontFamily: FONT_SORA,
                                          color: checked ? BLUE : 'rgba(255,255,255,0.5)',
                                        }}>
                                          {f.label}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {formError && <InlineError msg={formError} />}

                            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                              <button
                                onClick={handleCancelAdd}
                                disabled={formSaving}
                                style={{
                                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                                  background: 'transparent', border: `1px solid ${BORDER}`,
                                  color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: FONT_SORA, fontWeight: 600,
                                }}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleSaveDoc}
                                disabled={formSaving}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 7,
                                  padding: '8px 18px', borderRadius: 8, cursor: formSaving ? 'wait' : 'pointer',
                                  background: ACCENT, border: 'none',
                                  color: '#fff', fontSize: 11, fontFamily: FONT_SORA, fontWeight: 700,
                                  boxShadow: '0 3px 12px rgba(232,23,93,0.28)',
                                  opacity: formSaving ? 0.7 : 1,
                                }}
                              >
                                {formSaving && <Spinner size={12} color="#fff" />}
                                Guardar
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
