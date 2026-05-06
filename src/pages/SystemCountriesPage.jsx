import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe2, FileText, Search, Plus, Trash2, ScanLine,
  ToggleLeft, ToggleRight, Loader, AlertCircle, ChevronLeft, X,
  CheckCircle2, CreditCard, FlipHorizontal, Car, BookOpen,
  Home, Heart, Truck, Baby, ChevronRight, ArrowLeft, MapPin, ChevronDown,
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

const DOC_TYPE_META = {
  national_id:       { Icon: CreditCard, color: '#E8175D',  bg: 'rgba(232,23,93,0.12)' },
  drivers_license:   { Icon: Car,        color: '#F6AD55',  bg: 'rgba(246,173,85,0.12)' },
  passport:          { Icon: BookOpen,   color: '#63B3ED',  bg: 'rgba(99,179,237,0.12)' },
  residence_card:    { Icon: Home,       color: '#68D391',  bg: 'rgba(104,211,145,0.12)' },
  health_card:       { Icon: Heart,      color: '#FC8181',  bg: 'rgba(252,129,129,0.12)' },
  vehicle_permit:    { Icon: Truck,      color: '#B794F4',  bg: 'rgba(183,148,244,0.12)' },
  birth_certificate: { Icon: Baby,       color: '#F6E05E',  bg: 'rgba(246,224,94,0.12)' },
}

function Spinner({ size = 14, color = 'rgba(255,255,255,0.3)' }) {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader size={size} color={color} />
    </motion.div>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 10, color: '#ff6b6b', fontFamily: FONT_MONO }}>
      <AlertCircle size={11} />{msg}
    </div>
  )
}

function DocToggle({ active, onToggle, loading }) {
  return (
    <button onClick={e => { e.stopPropagation(); onToggle() }} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', padding: 0, background: 'transparent', border: 'none',
        cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1, flexShrink: 0 }}>
      {active ? <ToggleRight size={20} color={GREEN} /> : <ToggleLeft size={20} color="rgba(255,255,255,0.2)" />}
    </button>
  )
}

// ─── Modal de confirmación de activación ──────────────────────────────────────

function DocCard({ doc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '14px 14px 12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12, position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: doc.ocr_supported
          ? 'linear-gradient(90deg, #63B3ED, #4299e1)'
          : 'linear-gradient(90deg, rgba(232,23,93,0.6), rgba(232,23,93,0.3))',
        borderRadius: '12px 12px 0 0',
      }} />
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <CreditCard size={15} color="rgba(255,255,255,0.45)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: FONT_SORA, lineHeight: 1.3, marginBottom: 5 }}>
          {doc.name}
        </div>
        <div style={{
          display: 'inline-block', fontSize: 8, padding: '2px 6px', borderRadius: 4,
          background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
          color: ACCENT, fontFamily: FONT_MONO, letterSpacing: '0.05em', fontWeight: 700,
        }}>
          {doc.code}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {doc.ocr_supported && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, fontFamily: FONT_MONO, color: '#63B3ED', padding: '2px 6px', borderRadius: 4, background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)' }}>
            <ScanLine size={8} /> OCR
          </span>
        )}
        {doc.has_back && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.35)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <FlipHorizontal size={8} /> reverso
          </span>
        )}
        {(doc.fields?.length ?? 0) > 0 && (
          <span style={{ fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {doc.fields.length} campos
          </span>
        )}
      </div>
    </motion.div>
  )
}

function ActivationModal({ country, documents, loadingDocs, confirming, onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="activation-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          style={{
            width: '100%', maxWidth: 560,
            background: '#0e1117',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FlagImage code={country.iso_2} size={44} style={{ height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)' }} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.92)' }}>
                    Activar {country.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: FONT_MONO, marginTop: 2 }}>
                    Se habilitará para todos los tenants del sistema
                  </div>
                </div>
              </div>
              <button
                onClick={onCancel}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.3)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ padding: '18px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
              Documentos base incluidos ({documents.length})
            </div>

            {loadingDocs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
                <Spinner size={18} />
              </div>
            ) : documents.length === 0 ? (
              <div style={{
                padding: '22px 16px', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
              }}>
                <FileText size={22} color="rgba(255,255,255,0.1)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_SORA }}>Sin documentos configurados</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', fontFamily: FONT_MONO, marginTop: 3 }}>
                  El país se activará sin templates de documentos
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 8,
                maxHeight: 280, overflowY: 'auto',
                paddingRight: 4,
              }}>
                {documents.map((doc, i) => (
                  <motion.div key={doc.code} transition={{ delay: i * 0.04 }}>
                    <DocCard doc={doc} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px 20px',
            display: 'flex', gap: 8, justifyContent: 'flex-end',
          }}>
            <button
              onClick={onCancel}
              disabled={confirming}
              style={{
                padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: FONT_SORA, fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={confirming}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 20px', borderRadius: 9, cursor: confirming ? 'wait' : 'pointer',
                background: GREEN, border: 'none',
                color: '#fff', fontSize: 12, fontFamily: FONT_SORA, fontWeight: 700,
                boxShadow: '0 4px 18px rgba(16,185,129,0.35)',
                opacity: confirming ? 0.7 : 1, transition: 'opacity 0.15s',
              }}
            >
              {confirming ? <Spinner size={13} color="#fff" /> : <CheckCircle2 size={14} />}
              Confirmar activación
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// ─── Modal nuevo país ─────────────────────────────────────────────────────────

function NewCountryModal({ onSave, onCancel }) {
  const [form, setForm]   = useState({ name: '', iso2: '', iso3: '', phoneCode: '', defaultLocale: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.iso2.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch(`${SERVER_URL}/system/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:          form.name.trim(),
          iso2:          form.iso2.trim().toUpperCase().slice(0, 2),
          iso3:          form.iso3.trim().toUpperCase().slice(0, 3) || undefined,
          phoneCode:     form.phoneCode.trim() || undefined,
          defaultLocale: form.defaultLocale.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      onSave(data.country)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 9, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: FONT_SORA, outline: 'none',
    transition: 'border-color 0.15s',
  }
  const labelStyle = {
    display: 'block', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        style={{
          width: 420, background: '#0D1017',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MapPin size={13} color={BLUE} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: FONT_SORA }}>
              Nuevo país
            </span>
          </div>
          <button onClick={onCancel} style={{
            width: 26, height: 26, borderRadius: 7, background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={11} color="rgba(255,255,255,0.4)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              autoFocus required value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ej: Costa Rica"
              style={fieldStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>ISO 2 * <span style={{ color: 'rgba(255,255,255,0.2)' }}>(2 letras)</span></label>
              <input
                required value={form.iso2}
                onChange={e => set('iso2', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="CR"
                style={{ ...fieldStyle, fontFamily: FONT_MONO, letterSpacing: '0.05em' }}
                maxLength={2}
                onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={labelStyle}>ISO 3 <span style={{ color: 'rgba(255,255,255,0.2)' }}>(3 letras)</span></label>
              <input
                value={form.iso3}
                onChange={e => set('iso3', e.target.value.toUpperCase().slice(0, 3))}
                placeholder="CRI"
                style={{ ...fieldStyle, fontFamily: FONT_MONO, letterSpacing: '0.05em' }}
                maxLength={3}
                onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Código telefónico</label>
              <input
                value={form.phoneCode}
                onChange={e => set('phoneCode', e.target.value.replace(/\D/g, ''))}
                placeholder="506"
                style={{ ...fieldStyle, fontFamily: FONT_MONO }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Locale por defecto</label>
              <input
                value={form.defaultLocale}
                onChange={e => set('defaultLocale', e.target.value.slice(0, 5))}
                placeholder="es-CR"
                style={{ ...fieldStyle, fontFamily: FONT_MONO }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)',
              fontSize: 10, fontFamily: FONT_MONO, color: 'rgba(255,59,48,0.8)',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: FONT_SORA,
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading || !form.name.trim() || !form.iso2.trim()} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: (!form.name.trim() || !form.iso2.trim()) ? 'rgba(99,179,237,0.3)' : BLUE,
              color: '#fff', fontSize: 12, fontFamily: FONT_SORA, fontWeight: 600,
              cursor: loading || !form.name.trim() || !form.iso2.trim() ? 'default' : 'pointer',
            }}>
              {loading ? 'Creando…' : 'Crear país'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

// ─── Vista grid — ningún país seleccionado ────────────────────────────────────

function CountryGrid({ countries, loading, error, search, onSearch, onSelect, onNewCountry }) {
  const filtered = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.iso_2?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 340,
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: '9px 14px',
        }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Buscar país…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: FONT_SORA }}
          />
          {search && (
            <button onClick={() => onSearch('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={11} color="rgba(255,255,255,0.3)" />
            </button>
          )}
        </div>
        <button
          onClick={onNewCountry}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 9, cursor: 'pointer',
            background: BLUE, border: 'none',
            color: '#fff', fontSize: 11, fontFamily: FONT_SORA, fontWeight: 700,
            boxShadow: `0 3px 14px ${BLUE}40`, flexShrink: 0,
          }}
        >
          <Plus size={13} /> Nuevo país
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={22} />
        </div>
      ) : error ? (
        <InlineError msg={error} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: FONT_MONO }}>
          Sin resultados
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {filtered.map(c => (
            <motion.button
              key={c.iso_2}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelect(c.iso_2)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 10, padding: '14px 14px 12px',
                background: PANEL_BG, border: `1px solid ${BORDER}`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                opacity: c.active ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = PANEL_BG }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: 36, height: 26, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <FlagImage code={c.iso_2} size={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <ActiveDot active={c.active} />
              </div>
              <div style={{ minWidth: 0, width: '100%' }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, fontFamily: FONT_SORA,
                  color: 'rgba(255,255,255,0.88)', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_MONO }}>{c.iso_2}</span>
                  {(c.doc_templates ?? 0) > 0 && (
                    <span style={{
                      fontSize: 8, padding: '1px 5px', borderRadius: 3,
                      background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.18)',
                      color: BLUE, fontFamily: FONT_MONO,
                    }}>
                      {c.doc_templates} docs
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Modal agregar documento (2 pasos) ────────────────────────────────────────

function AddDocumentModal({ docTypes, availFields, countryIso, onSave, onCancel }) {
  const [step,        setStep]       = useState(1)
  const [selType,     setSelType]    = useState(null)
  const [formCode,    setFormCode]   = useState('')
  const [formName,    setFormName]   = useState('')
  const [formHasBack, setFormHasBack]= useState(true)
  const [formOcr,     setFormOcr]    = useState(true)
  const [formFields,  setFormFields] = useState([])
  const [saving,      setSaving]     = useState(false)
  const [error,       setError]      = useState('')

  function pickType(t) {
    const meta = DOC_TYPE_META[t.key] ?? {}
    const suffix = countryIso ? `_${countryIso}` : ''
    setSelType(t)
    setFormCode(`${t.key.toUpperCase()}${suffix}`)
    setFormName(t.name)
    setFormFields([])
    setError('')
    setStep(2)
  }

  function toggleField(key) {
    setFormFields(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key])
  }

  async function handleSave() {
    const code = formCode.trim().toUpperCase()
    const name = formName.trim()
    if (!code) { setError('El código es obligatorio'); return }
    if (!name) { setError('El nombre es obligatorio'); return }
    setError(''); setSaving(true)
    try {
      const r = await apiFetch(`${SERVER_URL}/system/documents`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, name, countryIso, hasBack: formHasBack,
          ocrSupported: formOcr, fields: formFields,
          documentTypeKey: selType?.key ?? null,
        }),
      })
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message ?? `Error ${r.status}`) }
      onSave({ id: Date.now(), code, name, has_back: formHasBack, ocr_supported: formOcr, active: true, fields: [], doc_type_key: selType?.key })
    } catch (e) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const selMeta = selType ? (DOC_TYPE_META[selType.key] ?? {}) : {}

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        style={{
          width: '100%', maxWidth: step === 1 ? 580 : 520,
          background: '#0e1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.9)' }}>
                {step === 1 ? 'Tipo de documento' : 'Configurar documento'}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_MONO, marginTop: 1 }}>
                Paso {step} de 2 · {step === 1 ? 'Elige el tipo' : selType?.name}
              </div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6 }}>
            <X size={15} />
          </button>
        </div>

        {/* Paso 1 — selector de tipo */}
        {step === 1 && (
          <div style={{ padding: '18px 22px 22px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: FONT_MONO, marginBottom: 14, letterSpacing: '0.06em' }}>
              CATÁLOGO DE TIPOS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 8 }}>
              {docTypes.map(t => {
                const meta = DOC_TYPE_META[t.key] ?? { Icon: FileText, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' }
                const { Icon } = meta
                return (
                  <motion.button
                    key={t.key}
                    whileHover={{ y: -2 }}
                    onClick={() => pickType(t)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                      padding: '14px 14px 12px', borderRadius: 12, cursor: 'pointer',
                      background: meta.bg, border: `1px solid ${meta.color}28`,
                      textAlign: 'left', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${meta.color}55` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${meta.color}28` }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
                    }}>
                      <Icon size={16} color={meta.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                        {t.name}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.3)', marginTop: 3, lineHeight: 1.4 }}>
                          {t.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontFamily: FONT_MONO, color: meta.color, marginTop: 'auto' }}>
                      Seleccionar <ChevronRight size={9} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Paso 2 — configuración */}
        {step === 2 && selType && (
          <div style={{ padding: '18px 22px 22px' }}>
            {/* Código + Nombre */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 160px' }}>
                <label style={{ display: 'block', fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: '0.06em' }}>CÓDIGO *</label>
                <input value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())} maxLength={30}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 11px', fontSize: 12, fontFamily: FONT_MONO, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: '0.06em' }}>NOMBRE *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 11px', fontSize: 12, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.85)', outline: 'none' }} />
              </div>
            </div>

            {/* Opciones */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {[
                { key: 'hasBack', label: 'Tiene reverso',  val: formHasBack, set: setFormHasBack },
                { key: 'ocr',     label: 'OCR habilitado', val: formOcr,     set: setFormOcr },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} style={{ accentColor: ACCENT, width: 13, height: 13, cursor: 'pointer' }} />
                  <span style={{ fontSize: 11, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.65)' }}>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Campos OCR */}
            {availFields.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: '0.06em' }}>
                  DATOS A EXTRAER CON OCR ({formFields.length} seleccionados)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {availFields.map(f => {
                    const checked = formFields.includes(f.key)
                    return (
                      <label key={f.key} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
                        borderRadius: 7, cursor: 'pointer',
                        background: checked ? selMeta.bg ?? 'rgba(99,179,237,0.1)' : 'rgba(255,255,255,0.03)',
                        border: checked ? `1px solid ${selMeta.color ?? BLUE}40` : `1px solid ${BORDER}`,
                        transition: 'all 0.1s',
                      }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleField(f.key)} style={{ accentColor: selMeta.color ?? BLUE, width: 11, height: 11, cursor: 'pointer' }} />
                        <span style={{ fontSize: 10, fontFamily: FONT_SORA, color: checked ? (selMeta.color ?? BLUE) : 'rgba(255,255,255,0.5)' }}>{f.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {error && <InlineError msg={error} />}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={onCancel} disabled={saving} style={{ padding: '9px 18px', borderRadius: 9, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: FONT_SORA, fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 20px', borderRadius: 9, cursor: saving ? 'wait' : 'pointer',
                background: selMeta.color ?? ACCENT, border: 'none',
                color: '#fff', fontSize: 12, fontFamily: FONT_SORA, fontWeight: 700,
                opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
                boxShadow: `0 4px 16px ${selMeta.color ?? ACCENT}40`,
              }}>
                {saving ? <Spinner size={12} color="#fff" /> : <CheckCircle2 size={14} />}
                Guardar documento
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ─── Vista detalle — país seleccionado ────────────────────────────────────────

function CountryDetail({
  countries, selectedIso, search, onSearch, onSelect, onBack,
  onToggleCountry, toggleLoading,
  onRequestActivate,
  documents, loadingDocs, docsError,
  onToggleDoc, docToggleLoad,
  onDeleteDoc, docDeleteLoad,
  onOpenAdd,
}) {
  const filtered = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.iso_2?.toLowerCase().includes(search.toLowerCase())
  )
  const selected = countries.find(c => c.iso_2 === selectedIso)

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

      {/* Panel izquierdo — lista colapsada */}
      <div style={{
        width: 260, flexShrink: 0,
        background: PANEL_BG, border: `1px solid ${BORDER}`,
        borderRadius: 14, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}>
        <div style={{ padding: '10px 10px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: '7px 10px',
          }}>
            <Search size={11} color="rgba(255,255,255,0.3)" />
            <input
              value={search} onChange={e => onSearch(e.target.value)}
              placeholder="Filtrar…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: FONT_SORA }}
            />
            {search && (
              <button onClick={() => onSearch('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={10} color="rgba(255,255,255,0.3)" />
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.map(c => {
            const isSel = c.iso_2 === selectedIso
            return (
              <button
                key={c.iso_2}
                onClick={() => onSelect(c.iso_2)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
                  borderLeft: isSel ? `3px solid ${ACCENT}` : '3px solid transparent',
                  background: isSel ? 'rgba(232,23,93,0.06)' : 'transparent',
                  border: 'none', borderLeftWidth: 3,
                  borderLeftStyle: 'solid',
                  borderLeftColor: isSel ? ACCENT : 'transparent',
                  transition: 'background 0.12s',
                  opacity: c.active ? 1 : 0.45,
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                <FlagImage code={c.iso_2} size={16} style={{ height: 12, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: isSel ? 700 : 500, fontFamily: FONT_SORA,
                    color: isSel ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.name}
                  </div>
                </div>
                {(c.doc_templates ?? 0) > 0 && (
                  <span style={{
                    fontSize: 8, padding: '1px 4px', borderRadius: 3,
                    background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.15)',
                    color: BLUE, fontFamily: FONT_MONO, flexShrink: 0,
                  }}>
                    {c.doc_templates}
                  </span>
                )}
                <ActiveDot active={c.active} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel derecho — detalle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selected && (
          <AnimatePresence mode="wait">
            <motion.div key={selectedIso} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>

              {/* Header del país */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', marginBottom: 12,
                background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14,
              }}>
                <button
                  onClick={onBack}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 9px', borderRadius: 7, cursor: 'pointer',
                    background: 'transparent', border: `1px solid ${BORDER}`,
                    color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: FONT_SORA,
                    flexShrink: 0, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <ChevronLeft size={12} /> Países
                </button>
                <FlagImage code={selected.iso_2} size={40} style={{ height: 28, borderRadius: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.92)' }}>
                      {selected.name}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                      color: 'rgba(255,255,255,0.35)', fontFamily: FONT_MONO,
                    }}>
                      {selected.iso_2}
                    </span>
                    <span style={{
                      fontSize: 8, padding: '2px 7px', borderRadius: 4, fontFamily: FONT_MONO, fontWeight: 700,
                      background: selected.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                      border: selected.active ? '1px solid rgba(16,185,129,0.25)' : `1px solid ${BORDER}`,
                      color: selected.active ? GREEN : 'rgba(255,255,255,0.3)',
                    }}>
                      {selected.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  {(selected.iso_3 || selected.phone_code) && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: FONT_MONO, marginTop: 3 }}>
                      {selected.iso_3 && `ISO3: ${selected.iso_3}`}
                      {selected.phone_code && ` · +${selected.phone_code}`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => selected.active
                    ? onToggleCountry(selected.iso_2)
                    : onRequestActivate(selected.iso_2)
                  }
                  disabled={!!toggleLoading[selected.iso_2]}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                    background: selected.active ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
                    border: selected.active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                    color: selected.active ? 'rgba(239,68,68,0.8)' : GREEN,
                    fontSize: 11, fontFamily: FONT_SORA, fontWeight: 600,
                    opacity: toggleLoading[selected.iso_2] ? 0.5 : 1,
                  }}
                >
                  {toggleLoading[selected.iso_2] ? <Spinner size={12} color="currentColor" /> : null}
                  {selected.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>

              {/* Documentos */}
              <div style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderBottom: `1px solid ${BORDER}`,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.55)' }}>
                    Documentos base
                  </span>
                  <button
                    onClick={onOpenAdd}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
                      background: ACCENT, border: 'none',
                      color: '#fff', fontSize: 11, fontFamily: FONT_SORA, fontWeight: 700,
                      boxShadow: '0 3px 14px rgba(232,23,93,0.3)',
                    }}
                  >
                    <Plus size={13} /> Agregar documento
                  </button>
                </div>

                <div style={{ padding: '14px 18px' }}>
                  {loadingDocs ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner /></div>
                  ) : docsError ? (
                    <InlineError msg={docsError} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <AnimatePresence initial={false}>
                        {documents.length === 0 ? (
                          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                              padding: '28px 16px', textAlign: 'center',
                              background: 'rgba(255,255,255,0.02)', border: `1px dashed ${BORDER}`, borderRadius: 12,
                            }}>
                            <FileText size={20} color="rgba(255,255,255,0.1)" style={{ marginBottom: 8 }} />
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_SORA }}>Sin documentos configurados</div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: FONT_MONO, marginTop: 3 }}>Agrega el primer template para este país</div>
                          </motion.div>
                        ) : (
                          documents.map(doc => {
                            const typeMeta = doc.doc_type_key ? (DOC_TYPE_META[doc.doc_type_key] ?? {}) : {}
                            const TypeIcon = typeMeta.Icon ?? CreditCard
                            return (
                              <motion.div key={doc.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} layout
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 12,
                                  padding: '11px 14px', borderRadius: 11,
                                  background: doc.active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                                  border: doc.active ? '1px solid rgba(255,255,255,0.08)' : `1px solid rgba(255,255,255,0.04)`,
                                  opacity: doc.active ? 1 : 0.55,
                                }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: typeMeta.bg ?? 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${typeMeta.color ?? 'rgba(255,255,255,0.08)'}28`,
                                }}>
                                  <TypeIcon size={14} color={typeMeta.color ?? 'rgba(255,255,255,0.4)'} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', fontFamily: FONT_SORA }}>{doc.name}</span>
                                    <span style={{
                                      fontSize: 8, padding: '1px 5px', borderRadius: 4, flexShrink: 0,
                                      background: 'rgba(232,23,93,0.08)', border: '1px solid rgba(232,23,93,0.18)',
                                      fontFamily: FONT_MONO, letterSpacing: '0.04em', color: ACCENT, fontWeight: 700,
                                    }}>
                                      {doc.code}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    {doc.ocr_supported && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(99,179,237,0.7)', padding: '1px 5px', borderRadius: 3, background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.15)' }}>
                                        <ScanLine size={8} /> OCR
                                      </span>
                                    )}
                                    {doc.has_back && (
                                      <span style={{ fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>reverso</span>
                                    )}
                                    {(doc.fields?.length ?? 0) > 0 && (
                                      <span style={{ fontSize: 8, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.25)' }}>
                                        {doc.fields.length} campo{doc.fields.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <DocToggle active={doc.active} onToggle={() => onToggleDoc(doc.code)} loading={!!docToggleLoad[doc.code]} />
                                <button
                                  onClick={() => onDeleteDoc(doc.code)} disabled={!!docDeleteLoad[doc.code]}
                                  style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: docDeleteLoad[doc.code] ? 'wait' : 'pointer',
                                    opacity: docDeleteLoad[doc.code] ? 0.5 : 1, transition: 'all 0.1s',
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,23,93,0.1)'; e.currentTarget.style.borderColor = 'rgba(232,23,93,0.3)' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                                >
                                  {docDeleteLoad[doc.code] ? <Spinner size={11} /> : <Trash2 size={12} color="rgba(255,255,255,0.35)" />}
                                </button>
                              </motion.div>
                            )
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SystemCountriesPage() {
  const { isSystem } = useUserRole()
  if (!isSystem) return <Navigate to="/" replace />

  const [countries,     setCountries]     = useState([])
  const [loadingList,   setLoadingList]   = useState(true)
  const [listError,     setListError]     = useState('')
  const [search,        setSearch]        = useState('')
  const [selectedIso,   setSelectedIso]   = useState(null)
  const [toggleLoading, setToggleLoading] = useState({})

  const [documents,     setDocuments]     = useState([])
  const [loadingDocs,   setLoadingDocs]   = useState(false)
  const [docsError,     setDocsError]     = useState('')
  const [docToggleLoad, setDocToggleLoad] = useState({})
  const [docDeleteLoad, setDocDeleteLoad] = useState({})

  const [availFields,   setAvailFields]   = useState([])
  const [docTypes,      setDocTypes]      = useState([])
  const catalogLoadedRef = useRef(false)

  const [showAddModal,      setShowAddModal]      = useState(false)
  const [showNewCountry,    setShowNewCountry]    = useState(false)

  useEffect(() => {
    apiFetch(`${SERVER_URL}/system/countries`)
      .then(r => r.json())
      .then(d => setCountries(d.countries ?? []))
      .catch(() => setListError('No se pudo cargar la lista de países'))
      .finally(() => setLoadingList(false))
  }, [])

  useEffect(() => {
    if (!selectedIso) return
    setLoadingDocs(true); setDocsError(''); setDocuments([])
    apiFetch(`${SERVER_URL}/system/countries/${selectedIso}/documents`)
      .then(r => r.json()).then(d => setDocuments(d.documents ?? []))
      .catch(() => setDocsError('No se pudo cargar los documentos'))
      .finally(() => setLoadingDocs(false))
  }, [selectedIso])

  const loadCatalog = useCallback(() => {
    if (catalogLoadedRef.current) return
    catalogLoadedRef.current = true
    Promise.all([
      apiFetch(`${SERVER_URL}/system/document-fields`).then(r => r.json()),
      apiFetch(`${SERVER_URL}/system/document-types`).then(r => r.json()),
    ]).then(([f, t]) => {
      setAvailFields(f.fields ?? [])
      setDocTypes(t.types ?? [])
    }).catch(() => {})
  }, [])

  useEffect(() => { if (selectedIso) loadCatalog() }, [selectedIso, loadCatalog])

  function handleToggleCountry(iso2) {
    setToggleLoading(p => ({ ...p, [iso2]: true }))
    const prev = countries.find(c => c.iso_2 === iso2)
    setCountries(l => l.map(c => c.iso_2 === iso2 ? { ...c, active: !c.active } : c))
    apiFetch(`${SERVER_URL}/system/countries/${iso2}/toggle`, { method: 'PATCH' })
      .then(r => r.json()).then(d => { if (d.country) setCountries(l => l.map(c => c.iso_2 === iso2 ? { ...c, ...d.country } : c)) })
      .catch(() => setCountries(l => l.map(c => c.iso_2 === iso2 ? { ...c, active: prev?.active } : c)))
      .finally(() => setToggleLoading(p => { const n = { ...p }; delete n[iso2]; return n }))
  }

  function handleToggleDoc(code) {
    const doc = documents.find(d => d.code === code); if (!doc) return
    setDocToggleLoad(p => ({ ...p, [code]: true }))
    const next = !doc.active
    setDocuments(l => l.map(d => d.code === code ? { ...d, active: next } : d))
    apiFetch(`${SERVER_URL}/system/documents/${code}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: next }) })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => setDocuments(l => l.map(d => d.code === code ? { ...d, active: doc.active } : d)))
      .finally(() => setDocToggleLoad(p => { const n = { ...p }; delete n[code]; return n }))
  }

  function handleDeleteDoc(code) {
    setDocDeleteLoad(p => ({ ...p, [code]: true }))
    const backup = [...documents]
    setDocuments(l => l.filter(d => d.code !== code))
    apiFetch(`${SERVER_URL}/system/documents/${code}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => setDocuments(backup))
      .finally(() => setDocDeleteLoad(p => { const n = { ...p }; delete n[code]; return n }))
  }

  function handleDocSaved(newDoc) {
    setDocuments(p => [...p, newDoc])
    setCountries(l => l.map(c => c.iso_2 === selectedIso ? { ...c, doc_templates: (c.doc_templates ?? 0) + 1 } : c))
    setShowAddModal(false)
  }

  function handleCountrySaved(newCountry) {
    setCountries(p => [...p, { ...newCountry, doc_templates: 0, doc_templates_active: 0 }])
    setShowNewCountry(false)
  }

  const [confirmIso,   setConfirmIso]   = useState(null)
  const [confirming,   setConfirming]   = useState(false)

  function handleRequestActivate(iso2) {
    setConfirmIso(iso2)
  }

  async function handleConfirmActivate() {
    setConfirming(true)
    await new Promise(res => setTimeout(res, 0))
    handleToggleCountry(confirmIso)
    setConfirmIso(null)
    setConfirming(false)
  }

  return (
    <div>
      <PageHeader title="Catálogo del sistema" subtitle="Gestiona países disponibles y sus documentos base para todos los tenants." icon={Globe2} />

      {confirmIso && (() => {
        const cty = countries.find(c => c.iso_2 === confirmIso)
        return cty ? (
          <ActivationModal
            country={cty}
            documents={confirmIso === selectedIso ? documents : []}
            loadingDocs={confirmIso === selectedIso ? loadingDocs : false}
            confirming={confirming}
            onConfirm={handleConfirmActivate}
            onCancel={() => setConfirmIso(null)}
          />
        ) : null
      })()}

      {showNewCountry && (
        <AnimatePresence>
          <NewCountryModal onSave={handleCountrySaved} onCancel={() => setShowNewCountry(false)} />
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {!selectedIso ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CountryGrid
              countries={countries} loading={loadingList} error={listError}
              search={search} onSearch={setSearch} onSelect={setSelectedIso}
              onNewCountry={() => setShowNewCountry(true)}
            />
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {showAddModal && (
              <AddDocumentModal
                docTypes={docTypes}
                availFields={availFields}
                countryIso={selectedIso}
                onSave={handleDocSaved}
                onCancel={() => setShowAddModal(false)}
              />
            )}
            <CountryDetail
              countries={countries} selectedIso={selectedIso}
              search={search} onSearch={setSearch} onSelect={setSelectedIso}
              onBack={() => setSelectedIso(null)}
              onToggleCountry={handleToggleCountry} toggleLoading={toggleLoading}
              onRequestActivate={handleRequestActivate}
              documents={documents} loadingDocs={loadingDocs} docsError={docsError}
              onToggleDoc={handleToggleDoc} docToggleLoad={docToggleLoad}
              onDeleteDoc={handleDeleteDoc} docDeleteLoad={docDeleteLoad}
              onOpenAdd={() => setShowAddModal(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
