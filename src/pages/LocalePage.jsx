import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Plus, X, ChevronDown, Star, Info, Layers, Check } from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import PageHeader from '../components/ui/PageHeader'
import SectionCard from '../components/config/SectionCard'
import FlagImage from '../components/ui/FlagImage'

// ─── Campos editables por país ─────────────────────────────────────────────────

const COUNTRY_FIELDS = [
  { key: 'currency',       label: 'Moneda (código)', placeholder: 'CRC' },
  { key: 'currencySymbol', label: 'Símbolo',         placeholder: '₡' },
  { key: 'language',       label: 'Idioma (locale)', placeholder: 'es-CR' },
  { key: 'phonePrefix',    label: 'Prefijo tel.',    placeholder: '+506' },
  { key: 'timezone',       label: 'Zona horaria',    placeholder: 'America/Costa_Rica' },
]

// ─── Editor de documentos por país ────────────────────────────────────────────

function CountryDocEditor({ country, globalRegistration, onSetIdTypes, onSetDocuments }) {
  const globalStep = globalRegistration?.steps?.[0]
  const globalIdField = globalStep?.fields?.find(f => f.key === 'identificationTypeId')
  const globalDocs = globalStep?.documents ?? []

  const idTypes   = country.idTypes   ?? globalIdField?.options ?? []
  const documents = country.documents ?? globalDocs

  const hasIdOverride  = country.idTypes   !== null && country.idTypes   !== undefined
  const hasDocOverride = country.documents !== null && country.documents !== undefined

  function addIdType() {
    onSetIdTypes(country.countryCode, [...idTypes, { value: '', label: '' }])
  }
  function updateIdType(idx, patch) {
    onSetIdTypes(country.countryCode, idTypes.map((t, i) => i === idx ? { ...t, ...patch } : t))
  }
  function removeIdType(idx) {
    const next = idTypes.filter((_, i) => i !== idx)
    onSetIdTypes(country.countryCode, next.length ? next : null)
  }
  function toggleDocRequired(key) {
    if (!hasDocOverride) {
      onSetDocuments(country.countryCode, globalDocs.map(d => d.key === key ? { ...d, required: !d.required } : d))
    } else {
      onSetDocuments(country.countryCode, documents.map(d => d.key === key ? { ...d, required: !d.required } : d))
    }
  }

  const inputStyle = {
    flex: 1, padding: '4px 7px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
    color: '#fff', fontSize: 10, fontFamily: 'Space Mono, monospace', outline: 'none',
  }

  return (
    <div>
      {/* Tipos de ID */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Tipos de ID
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {hasIdOverride && (
              <button onClick={() => onSetIdTypes(country.countryCode, null)}
                style={{ fontSize: 8, color: 'rgba(255,100,100,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono' }}>
                Usar global
              </button>
            )}
            <button onClick={addIdType}
              style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'rgba(232,23,93,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora' }}>
              <Plus size={9} />Agregar
            </button>
          </div>
        </div>
        {idTypes.map((t, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 5, marginBottom: 4, alignItems: 'center' }}>
            <input value={t.value} onChange={e => updateIdType(idx, { value: e.target.value })}
              placeholder="cedula" style={{ ...inputStyle, flex: '0 0 80px' }} />
            <input value={t.label} onChange={e => updateIdType(idx, { label: e.target.value })}
              placeholder="Cédula" style={inputStyle} />
            <button onClick={() => removeIdType(idx)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={10} color="rgba(255,80,80,0.7)" />
            </button>
          </div>
        ))}
        {!hasIdOverride && idTypes.length === 0 && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>Sin tipos definidos en la config global</div>
        )}
      </div>

      {/* Documentos */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Documentos requeridos
          </span>
          {hasDocOverride && (
            <button onClick={() => onSetDocuments(country.countryCode, null)}
              style={{ fontSize: 8, color: 'rgba(255,100,100,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono' }}>
              Usar global
            </button>
          )}
        </div>
        {documents.map((doc) => (
          <div key={doc.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'Sora' }}>{doc.label}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>{doc.key}</div>
            </div>
            <button
              onClick={() => toggleDocRequired(doc.key)}
              style={{
                padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                fontFamily: 'Space Mono', fontWeight: 700,
                background: doc.required ? 'rgba(232,23,93,0.15)' : 'rgba(255,255,255,0.06)',
                color: doc.required ? '#E8175D' : 'rgba(255,255,255,0.3)',
              }}
            >
              {doc.required ? 'Requerido' : 'Opcional'}
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>Sin documentos en la config global</div>
        )}
      </div>
    </div>
  )
}

// ─── Componente tarjeta de país ────────────────────────────────────────────────

function CountryCard({ country, isPrimary, onRemove, onSetPrimary, onUpdate, globalRegistration, onSetIdTypes, onSetDocuments, forceExpanded = false }) {
  const [expanded, setExpanded] = useState(forceExpanded)
  const [showDocs, setShowDocs] = useState(false)

  useEffect(() => {
    if (forceExpanded) setExpanded(true)
  }, [forceExpanded, country.countryCode])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: 14,
        border: isPrimary
          ? '2px solid rgba(232,23,93,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        background: isPrimary
          ? 'rgba(232,23,93,0.05)'
          : 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        {/* Bandera grande */}
        <div style={{
          width: 54, height: 38, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <FlagImage code={country.countryCode} size={54} style={{ borderRadius: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
            fontFamily: 'Sora', letterSpacing: '-0.3px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {country.name ?? country.countryCode}
            {isPrimary && (
              <span style={{
                fontSize: 8, fontFamily: 'Space Mono', padding: '2px 6px',
                borderRadius: 4, background: 'rgba(232,23,93,0.2)',
                border: '1px solid rgba(232,23,93,0.4)', color: '#E8175D',
                fontWeight: 700, letterSpacing: '0.05em',
              }}>
                PRINCIPAL
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {country.countryCode} · {country.currency} {country.currencySymbol} · {country.phonePrefix}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!isPrimary && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onSetPrimary(country.countryCode) }}
              title="Hacer país principal"
              style={{
                width: 22, height: 22, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              <Star size={10} color="rgba(255,200,80,0.7)" />
            </motion.button>
          )}
          {!isPrimary && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onRemove(country.countryCode) }}
              title="Quitar país"
              style={{
                width: 22, height: 22, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.15)',
                cursor: 'pointer',
              }}
            >
              <X size={10} color="rgba(255,80,80,0.8)" />
            </motion.button>
          )}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex' }}
          >
            <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
          </motion.span>
        </div>
      </button>

      {/* Campos expandibles */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              {/* Locale fields */}
              <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                {COUNTRY_FIELDS.map(({ key, label, placeholder }) => (
                  <CountryFieldInput
                    key={key}
                    label={label}
                    value={country[key] ?? ''}
                    placeholder={placeholder}
                    onChange={(val) => onUpdate(country.countryCode, { [key]: val })}
                  />
                ))}
              </div>

              {/* Documentos por país */}
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Documentos de identidad
                  </span>
                  <button
                    onClick={() => setShowDocs(v => !v)}
                    style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      fontFamily: 'Space Mono', fontWeight: 700,
                      background: showDocs ? 'rgba(232,23,93,0.15)' : 'rgba(255,255,255,0.06)',
                      color: showDocs ? '#E8175D' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {showDocs ? 'Ocultar' : 'Configurar'}
                  </button>
                </div>
                {!showDocs && (
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
                    {(country.idTypes || country.documents)
                      ? 'Config personalizada para este país'
                      : 'Usando configuración global'}
                  </div>
                )}
                {showDocs && (
                  <CountryDocEditor
                    country={country}
                    globalRegistration={globalRegistration}
                    onSetIdTypes={onSetIdTypes}
                    onSetDocuments={onSetDocuments}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CountryFieldInput({ label, value, placeholder, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '6px 9px', borderRadius: 7, boxSizing: 'border-box',
          border: `1px solid ${focused ? 'rgba(232,23,93,0.4)' : 'rgba(255,255,255,0.08)'}`,
          background: focused ? 'rgba(232,23,93,0.04)' : 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.8)', fontSize: 11,
          fontFamily: 'Space Mono, monospace', outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
    </div>
  )
}

// ─── Picker de país ────────────────────────────────────────────────────────────

function AddCountryPicker({ existingCodes, onAddMany, onClose }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [inheritBase, setInheritBase] = useState(true)

  const filtered = COUNTRY_CATALOG.filter(c =>
    !existingCodes.includes(c.countryCode) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.countryCode.toLowerCase().includes(search.toLowerCase()))
  )

  function toggle(code) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  function handleConfirm() {
    if (selected.size === 0) return
    const cats = COUNTRY_CATALOG.filter(c => selected.has(c.countryCode))
    onAddMany(cats, { inheritBase })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      style={{
        background: '#111318',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Buscador */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora, sans-serif' }}>
            Agregar países
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
            {selected.size > 0 ? `${selected.size} seleccionado${selected.size === 1 ? '' : 's'}` : 'click para seleccionar'}
          </div>
        </div>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar país..."
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 8, boxSizing: 'border-box',
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Sora', outline: 'none',
          }}
        />
      </div>

      {/* Grid de banderas — toggleables */}
      <div style={{ padding: '12px 14px', maxHeight: 230, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', textAlign: 'center', padding: '16px 0' }}>
            Sin resultados
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
            {filtered.map(c => {
              const isSelected = selected.has(c.countryCode)
              return (
                <button
                  key={c.countryCode}
                  onClick={() => toggle(c.countryCode)}
                  title={`${c.name} (${c.countryCode})`}
                  style={{
                    position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '8px 6px', borderRadius: 9, cursor: 'pointer',
                    background: isSelected ? 'rgba(232,23,93,0.18)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid rgba(232,23,93,0.6)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(232,23,93,0.08)'; e.currentTarget.style.borderColor = 'rgba(232,23,93,0.25)' } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' } }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#E8175D',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    }}>
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ width: 44, height: 30, borderRadius: 5, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                    <FlagImage
                      code={c.countryCode}
                      size={44}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                    />
                  </div>
                  <div style={{
                    fontSize: 8, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                    color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                    textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.02em',
                    transition: 'color 0.12s ease',
                  }}>
                    {c.countryCode}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Toggle: heredar config base */}
      <div style={{
        padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <button
          onClick={() => setInheritBase(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: inheritBase ? 'rgba(232,23,93,0.06)' : 'rgba(255,255,255,0.03)',
            border: inheritBase ? '1px solid rgba(232,23,93,0.25)' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
            background: inheritBase ? '#E8175D' : 'transparent',
            border: inheritBase ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}>
            {inheritBase && <Check size={11} color="#fff" strokeWidth={3} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>
              Heredar configuración base
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
              {inheritBase
                ? 'Tipos de ID y documentos se toman del registro global'
                : 'Empezarás con copia editable de los tipos de ID y documentos globales'}
            </div>
          </div>
        </button>
      </div>

      {/* Acciones */}
      <div style={{ padding: '10px 14px 12px', display: 'flex', gap: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '8px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 10, fontFamily: 'Sora, sans-serif', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={selected.size === 0}
          style={{
            flex: 2, padding: '8px', borderRadius: 8, border: 'none',
            background: selected.size === 0 ? 'rgba(232,23,93,0.3)' : '#E8175D',
            color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Sora, sans-serif',
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {selected.size === 0
            ? 'Selecciona países'
            : `Agregar ${selected.size} país${selected.size === 1 ? '' : 'es'}`}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function LocalePage() {
  const countries         = useTenantStore((s) => s.countryConfigs)
  const registration      = useTenantStore((s) => s.registration)
  const activeCountry     = useTenantStore((s) => s.activeCountry)
  const setActiveCountry  = useTenantStore((s) => s.setActiveCountry)
  const addCountry        = useTenantStore((s) => s.addCountry)
  const removeCountry     = useTenantStore((s) => s.removeCountry)
  const updateCountry     = useTenantStore((s) => s.updateCountry)
  const setPrimary        = useTenantStore((s) => s.setPrimaryCountry)
  const setCountryIdTypes = useTenantStore((s) => s.setCountryIdTypes)
  const setCountryDocs    = useTenantStore((s) => s.setCountryDocuments)
  const setupComplete     = useTenantStore((s) => s.advanced._setupComplete === true)
  const tenantCode        = useTenantStore((s) => s.advanced.tenantCode)

  const [searchParams, setSearchParams] = useSearchParams()
  const wantsAdd = searchParams.get('add') === '1'
  const [showPicker, setShowPicker] = useState(wantsAdd)

  // Si vienes con ?add=1 desde el sidebar, abre el picker y limpia la URL
  useEffect(() => {
    if (wantsAdd) {
      setShowPicker(true)
      setSearchParams({}, { replace: true })
    }
  }, [wantsAdd, setSearchParams])

  // Bloqueo (después de todos los hooks): si no hay tenant o setup base no está completo
  if (!tenantCode) return <Navigate to="/branding" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  const existingCodes = countries.map(c => c.countryCode)
  const country = activeCountry
    ? countries.find(c => c.countryCode === activeCountry)
    : null

  // Cuando se elimina el país activo, resetear a base
  function handleRemove(code) {
    removeCountry(code)
    if (code === activeCountry) setActiveCountry(null)
  }

  // Cuando se agregan países, selecciona el primero como activo
  function handleAddMany(cats, { inheritBase }) {
    // Si NO hereda base → copiar idTypes/documents del registro global como override
    const globalStep = registration?.steps?.[0]
    const globalIdTypes  = globalStep?.fields?.find(f => f.key === 'identificationTypeId')?.options ?? []
    const globalDocs     = globalStep?.documents ?? []

    cats.forEach(cat => {
      const init = inheritBase
        ? { ...cat, idTypes: null, documents: null }
        : {
            ...cat,
            idTypes:   globalIdTypes.map(t => ({ ...t })),
            documents: globalDocs.map(d => ({ ...d })),
          }
      addCountry(init)
    })

    if (cats.length > 0) setActiveCountry(cats[0].countryCode)
    setShowPicker(false)
  }

  return (
    <div>
      <PageHeader
        title={country ? `Configuración — ${country.name}` : 'Localización'}
        subtitle={country
          ? `Override de ${country.countryCode}. Hereda la config base, ajusta solo lo que cambia para este país.`
          : 'Selecciona un país desde el selector lateral para configurarlo, o agrega uno nuevo.'
        }
        icon={Globe}
      />

      {/* Estado: hay un país activo → editor del país */}
      {country && (
        <div style={{ marginBottom: 16 }}>
          <CountryCard
            country={country}
            isPrimary={country.isPrimary === true}
            globalRegistration={registration}
            onRemove={handleRemove}
            onSetPrimary={setPrimary}
            onUpdate={updateCountry}
            onSetIdTypes={(cc, types) => setCountryIdTypes(cc, types)}
            onSetDocuments={(cc, docs) => setCountryDocs(cc, docs)}
            forceExpanded
          />
        </div>
      )}

      {/* Estado: sin país activo → vista panorámica */}
      {!country && countries.length > 0 && (
        <div style={{
          padding: '20px 22px', borderRadius: 14,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Países configurados ({countries.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {countries.map(c => (
              <button
                key={c.countryCode}
                onClick={() => setActiveCountry(c.countryCode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 11px', borderRadius: 8,
                  border: c.isPrimary ? '1px solid rgba(232,23,93,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: c.isPrimary ? 'rgba(232,23,93,0.08)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = c.isPrimary ? 'rgba(232,23,93,0.08)' : 'rgba(255,255,255,0.03)'}
              >
                <div style={{ width: 22, height: 16, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <FlagImage code={c.countryCode} size={22} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora, sans-serif' }}>
                  {c.name}
                </span>
                {c.isPrimary && (
                  <span style={{
                    fontSize: 7, padding: '1px 4px', borderRadius: 3,
                    background: 'rgba(232,23,93,0.2)', color: '#E8175D',
                    fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.05em',
                  }}>
                    PRIMARIO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botón agregar + picker */}
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPicker(v => !v)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            border: '1px dashed rgba(232,23,93,0.3)',
            background: showPicker ? 'rgba(232,23,93,0.06)' : 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'background 0.2s',
            marginBottom: showPicker ? 10 : 0,
          }}
        >
          <Plus size={14} color="rgba(232,23,93,0.7)" />
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Sora', color: 'rgba(232,23,93,0.7)' }}>
            Agregar país de operación
          </span>
        </motion.button>

        <AnimatePresence>
          {showPicker && (
            <AddCountryPicker
              existingCodes={existingCodes}
              onAddMany={handleAddMany}
              onClose={() => setShowPicker(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nota informativa */}
      <div style={{
        marginTop: 20, padding: '12px 16px',
        background: 'rgba(147,197,253,0.05)',
        border: '1px solid rgba(147,197,253,0.12)',
        borderRadius: 10, fontSize: 11,
        color: 'rgba(147,197,253,0.6)', fontFamily: 'Space Mono', lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Info size={12} color="rgba(147,197,253,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Cada país <strong style={{ color: 'rgba(147,197,253,0.8)' }}>hereda la config base</strong>
            (identidad, tema, módulos, idiomas) y solo personaliza moneda, idioma local, documentos y tipos de ID.
            Cambia el país desde el selector lateral.
          </span>
        </div>
      </div>
    </div>
  )
}
