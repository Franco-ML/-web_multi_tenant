import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Image, LayoutGrid, Settings, FileText,
  ArrowUp, Layers, Sparkles, Check, ChevronDown,
  Globe2, Phone, Mail, Lock, MapPin, UserPlus,
  Server, HeadphonesIcon, AlertTriangle, FileCheck,
  Scan, Sun, Moon, ExternalLink,
} from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import FlagImage from '../components/ui/FlagImage'

// ─── Módulos consolidados ─────────────────────────────────────────────────────

const SUPER_MODULES = [
  {
    key: 'branding',
    label: 'Imagen de marca',
    Icon: Image,
    color: '#E8175D',
    storeKeys: ['branding', 'theme'],
  },
  {
    key: 'features',
    label: 'Funciones',
    Icon: LayoutGrid,
    color: '#3B82F6',
    storeKeys: ['features', 'login', 'registration'],
  },
  {
    key: 'advanced',
    label: 'Avanzado',
    Icon: Settings,
    color: '#8B5CF6',
    storeKeys: ['advanced'],
  },
  {
    key: 'documents',
    label: 'Documentos',
    Icon: FileText,
    color: '#10B981',
    storeKeys: ['idTypes', 'documents'],
  },
]

const MODES = {
  inherit: {
    label: 'Hereda todo',
    Icon: ArrowUp,
    color: 'rgba(255,255,255,0.5)',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    desc: 'Usa exactamente los valores de la fuente',
  },
  'override-base': {
    label: 'Parcial',
    Icon: Layers,
    color: '#63B3ED',
    bg: 'rgba(99,179,237,0.08)',
    border: 'rgba(99,179,237,0.25)',
    desc: 'Hereda la base pero permite ajustes por campo',
  },
  custom: {
    label: 'Propio',
    Icon: Sparkles,
    color: '#E8175D',
    bg: 'rgba(232,23,93,0.08)',
    border: 'rgba(232,23,93,0.28)',
    desc: 'Configuración completamente independiente',
  },
}

// Devuelve el modo del primer storeKey del super-módulo
function getSuperMode(country, superModKey) {
  const sm = SUPER_MODULES.find(m => m.key === superModKey)
  if (!sm) return 'inherit'
  for (const k of sm.storeKeys) {
    const m = country.moduleModes?.[k]
    if (m && m !== 'inherit') return m
  }
  return country.moduleModes?.[sm.storeKeys[0]] ?? 'inherit'
}

// ─── Preview: Imagen de marca ─────────────────────────────────────────────────

function BrandingPreview({ base, country }) {
  const custom = country.customModules?.branding ?? {}
  const customTheme = country.customModules?.theme ?? {}
  const mode = getSuperMode(country, 'branding')
  const isBase = mode === 'inherit'

  const logo    = isBase ? base.branding.logoPreviewUrl || base.branding.logoUrl : custom.logoUrl ?? base.branding.logoPreviewUrl
  const name    = isBase ? base.branding.name           : custom.name ?? base.branding.name
  const primary = isBase ? base.branding.primaryColor   : custom.primaryColor ?? base.branding.primaryColor
  const colorMode = isBase ? base.theme.colorMode : customTheme.colorMode ?? base.theme.colorMode
  const bgLight = isBase ? base.theme.light?.background : customTheme.light?.background ?? base.theme.light?.background
  const bgDark  = isBase ? base.theme.dark?.background  : customTheme.dark?.background  ?? base.theme.dark?.background

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <LabelSmall>Logo</LabelSmall>
        {logo ? (
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: base.branding.logoPosition ?? '50% 50%' }} />
          </div>
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `${primary}22`, border: `2px dashed ${primary}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Image size={18} color={`${primary}99`} />
          </div>
        )}
        {isBase && <InheritedBadge />}
      </div>

      {/* Nombre */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabelSmall>Nombre</LabelSmall>
        <div style={{ fontSize: 15, fontWeight: 700, color: name ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)', fontFamily: 'Sora' }}>
          {name || '—'}
        </div>
        {isBase && <InheritedBadge />}
      </div>

      {/* Colores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabelSmall>Color primario</LabelSmall>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: primary, boxShadow: `0 2px 8px ${primary}55`, border: '2px solid rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.5)' }}>{primary}</span>
        </div>
        {isBase && <InheritedBadge />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LabelSmall>Fondos ({colorMode === 'light' ? 'claro' : 'oscuro'})</LabelSmall>
        <div style={{ display: 'flex', gap: 6 }}>
          {bgLight && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bgLight, border: '1px solid rgba(255,255,255,0.12)' }} />
              <Sun size={9} color="rgba(255,255,255,0.3)" />
            </div>
          )}
          {bgDark && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bgDark, border: '1px solid rgba(255,255,255,0.12)' }} />
              <Moon size={9} color="rgba(255,255,255,0.3)" />
            </div>
          )}
        </div>
        {isBase && <InheritedBadge />}
      </div>
    </div>
  )
}

// ─── Preview: Funciones ───────────────────────────────────────────────────────

const FEATURE_ITEMS = [
  { icon: Phone,    label: 'Login teléfono',  get: (b) => b.login.phoneEnabled },
  { icon: Mail,     label: 'Login email',     get: (b) => b.login.emailEnabled },
  { icon: Lock,     label: 'PIN seguridad',   get: (b) => b.login.pinRequired },
  { icon: MapPin,   label: 'Módulo rutas',    get: (b) => b.features.routesEnabled },
  { icon: UserPlus, label: 'Registro',        get: (b) => (b.registration?.steps?.length ?? 0) > 0 },
  { icon: Globe2,   label: 'Google Maps',     get: (b) => b.features.googleMapsEnabled },
  { icon: Scan,     label: 'Escáner',         get: (b) => b.features.scanningEnabled },
]

function FeaturesPreview({ base, country }) {
  const custom = country.customModules ?? {}
  const mode = getSuperMode(country, 'features')
  const isBase = mode === 'inherit'

  const eff = isBase ? base : {
    login:        { ...base.login, ...(custom.login ?? {}) },
    features:     { ...base.features, ...(custom.features ?? {}) },
    registration: { ...base.registration, ...(custom.registration ?? {}) },
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {FEATURE_ITEMS.map(({ icon: Icon, label, get }) => {
        const on = !!get(eff)
        return (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 11px', borderRadius: 8,
            background: on ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
            border: on ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)',
          }}>
            <Icon size={11} color={on ? '#10B981' : 'rgba(255,255,255,0.2)'} />
            <span style={{ fontSize: 10, fontFamily: 'Sora', fontWeight: 600, color: on ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)' }}>
              {label}
            </span>
            <span style={{ fontSize: 8, fontFamily: 'Space Mono', color: on ? '#10B981' : 'rgba(255,255,255,0.2)' }}>
              {on ? 'ON' : 'OFF'}
            </span>
          </div>
        )
      })}
      {isBase && <InheritedBadge />}
    </div>
  )
}

// ─── Preview: Avanzado ────────────────────────────────────────────────────────

const ADV_ITEMS = [
  { icon: Server,          label: 'Servidor',     get: (a) => a.apiUrl },
  { icon: HeadphonesIcon,  label: 'Soporte',      get: (a) => a.supportCenterPhone },
  { icon: AlertTriangle,   label: 'Emergencias',  get: (a) => a.emergencyPhone },
]

function AdvancedPreview({ base, country }) {
  const custom = country.customModules?.advanced ?? {}
  const mode = getSuperMode(country, 'advanced')
  const isBase = mode === 'inherit'
  const eff = isBase ? base.advanced : { ...base.advanced, ...custom }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {ADV_ITEMS.map(({ icon: Icon, label, get }) => {
        const val = get(eff)
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={12} color="rgba(255,255,255,0.35)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: val ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', wordBreak: 'break-all' }}>
                {val || '— no configurado —'}
              </div>
            </div>
          </div>
        )
      })}
      {isBase && <InheritedBadge />}
    </div>
  )
}

// ─── Preview: Documentos ─────────────────────────────────────────────────────

function DocumentsPreview({ country }) {
  const navigate = useNavigate()
  const setActiveCountry = useTenantStore(s => s.setActiveCountry)
  const docs    = country.documents ?? null
  const hasOwn  = docs !== null

  const req = (docs ?? []).filter(d => d.required !== false).length
  const opt = (docs ?? []).filter(d => d.required === false).length

  function goToDocuments() {
    setActiveCountry(country.countryCode)
    navigate('/documents')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Estado actual */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 9,
        background: hasOwn ? 'rgba(232,23,93,0.06)' : 'rgba(255,255,255,0.03)',
        border: hasOwn ? '1px solid rgba(232,23,93,0.2)' : '1px solid rgba(255,255,255,0.07)',
      }}>
        {hasOwn
          ? <Sparkles size={12} color="#E8175D" />
          : <ArrowUp size={12} color="rgba(255,255,255,0.3)" />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Sora', color: hasOwn ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>
            {hasOwn ? 'Configuración propia' : 'Usando base del tenant'}
          </div>
          {hasOwn && (
            <div style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
              {req} requerido{req !== 1 ? 's' : ''} · {opt} opcional{opt !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
        {!hasOwn && <InheritedBadge />}
      </div>

      {/* Docs configurados (preview rápido) */}
      {hasOwn && docs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {docs.slice(0, 5).map(d => (
            <span key={d.templateCode ?? d.key} style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 9, fontFamily: 'Space Mono',
              background: d.required !== false ? 'rgba(16,185,129,0.1)' : 'rgba(99,179,237,0.08)',
              border: d.required !== false ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,179,237,0.15)',
              color: d.required !== false ? '#10B981' : '#63B3ED',
            }}>
              {d.templateCode ?? d.key}
            </span>
          ))}
          {docs.length > 5 && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', alignSelf: 'center' }}>
              +{docs.length - 5} más
            </span>
          )}
        </div>
      )}

      {/* Botón ir al editor */}
      <button
        onClick={goToDocuments}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'Sora', fontWeight: 600,
          transition: 'all 0.12s', width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
      >
        <FileCheck size={13} />
        {hasOwn ? 'Editar documentos' : 'Configurar documentos'}
        <ExternalLink size={11} style={{ opacity: 0.5 }} />
      </button>
    </div>
  )
}

// ─── Pequeños helpers de UI ───────────────────────────────────────────────────

function LabelSmall({ children }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {children}
    </span>
  )
}

function InheritedBadge() {
  return (
    <span style={{
      fontSize: 8, padding: '2px 6px', borderRadius: 4,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', letterSpacing: '0.05em',
    }}>
      HEREDADO
    </span>
  )
}

// ─── Dropdown de modo ─────────────────────────────────────────────────────────

function ModeDropdown({ mode, onChange }) {
  const [open, setOpen] = useState(false)
  const cfg = MODES[mode] ?? MODES.inherit
  const { Icon } = cfg

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          color: cfg.color, fontSize: 11, fontFamily: 'Sora', fontWeight: 600,
        }}
      >
        <Icon size={11} />
        {cfg.label}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 100,
              background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: 6, minWidth: 220,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {Object.entries(MODES).map(([key, m]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                  padding: '8px 10px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  background: mode === key ? m.bg : 'transparent',
                  border: mode === key ? `1px solid ${m.border}` : '1px solid transparent',
                  marginBottom: 2,
                }}
              >
                <m.Icon size={13} color={m.color} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: 'Sora' }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Sora', marginTop: 1 }}>{m.desc}</div>
                </div>
                {mode === key && <Check size={11} color={m.color} style={{ marginLeft: 'auto', marginTop: 3, flexShrink: 0 }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}
    </div>
  )
}

// ─── Tarjeta de módulo ────────────────────────────────────────────────────────

function ModuleCard({ mod, country, base, onModeChange }) {
  const mode = getSuperMode(country, mod.key)
  const cfg  = MODES[mode] ?? MODES.inherit
  const { Icon } = mod

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${mode === 'inherit' ? 'rgba(255,255,255,0.07)' : cfg.border}`,
      background: mode === 'inherit' ? 'rgba(255,255,255,0.02)' : cfg.bg,
    }}>
      {/* Header del módulo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `${mod.color}18`, border: `1px solid ${mod.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={15} color={mod.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora' }}>
            {mod.label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', marginTop: 1 }}>
            {mode === 'inherit' ? 'Usando valores de la fuente' : mode === 'override-base' ? 'Ajustes sobre la base' : 'Configuración propia'}
          </div>
        </div>
        <ModeDropdown mode={mode} onChange={(newMode) => onModeChange(mod.key, newMode)} />
      </div>

      {/* Contenido visual */}
      <div style={{ padding: '16px 18px' }}>
        {mod.key === 'branding'  && <BrandingPreview  base={base} country={country} />}
        {mod.key === 'features'  && <FeaturesPreview  base={base} country={country} />}
        {mod.key === 'advanced'  && <AdvancedPreview  base={base} country={country} />}
        {mod.key === 'documents' && <DocumentsPreview country={country} />}
      </div>
    </div>
  )
}

// ─── Selector de fuente de herencia ──────────────────────────────────────────

function SourcePicker({ country, allCountries, onChange }) {
  const [open, setOpen] = useState(false)
  const source = country.inheritsFrom

  const sourceName = source === 'base' || !source
    ? 'Configuración base del tenant'
    : allCountries.find(c => c.id === source)?.name ?? source

  return (
    <div style={{
      padding: '12px 16px', borderRadius: 12,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', gap: 12, position: 'relative',
    }}>
      <ArrowUp size={14} color="rgba(255,255,255,0.3)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
          Hereda de
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: 'Sora' }}>
          {sourceName}
        </div>
      </div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Sora', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        Cambiar fuente <ChevronDown size={10} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.13 }}
            style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 100,
              background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: 6, minWidth: 240,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Base */}
            {[{ id: 'base', name: 'Configuración base del tenant', countryCode: null },
              ...allCountries.filter(c => c.id !== country.id)
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 10px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  background: source === opt.id || (!source && opt.id === 'base') ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: '1px solid transparent',
                  marginBottom: 2,
                }}
              >
                {opt.countryCode ? (
                  <div style={{ width: 24, height: 16, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                    <FlagImage code={opt.countryCode} size={24} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <Globe2 size={14} color="rgba(255,255,255,0.35)" />
                )}
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: 'Sora' }}>
                  {opt.name}
                </span>
                {(source === opt.id || (!source && opt.id === 'base')) && <Check size={11} color="#E8175D" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </div>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function CountryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const countryConfigs        = useTenantStore(s => s.countryConfigs)
  const tenantCode            = useTenantStore(s => s.advanced.tenantCode)
  const setupComplete         = useTenantStore(s => s.advanced._setupComplete === true)
  const setCountryModuleMode  = useTenantStore(s => s.setCountryModuleMode)
  const setActiveCountry      = useTenantStore(s => s.setActiveCountry)
  const setCountryInheritance = useTenantStore(s => s.setCountryInheritance)

  // Valores base del tenant — selectores individuales para evitar loop infinito
  const baseBranding     = useTenantStore(s => s.branding)
  const baseTheme        = useTenantStore(s => s.theme)
  const baseLogin        = useTenantStore(s => s.login)
  const baseFeatures     = useTenantStore(s => s.features)
  const baseRegistration = useTenantStore(s => s.registration)
  const baseAdvanced     = useTenantStore(s => s.advanced)

  const base = { branding: baseBranding, theme: baseTheme, login: baseLogin, features: baseFeatures, registration: baseRegistration, advanced: baseAdvanced }

  if (!tenantCode)    return <Navigate to="/brand" replace />
  if (!setupComplete) return <Navigate to="/setup" replace />

  const country = countryConfigs.find(c => c.id === id)
  if (!country) return <Navigate to="/countries" replace />

  function handleModeChange(superModKey, newMode) {
    const sm = SUPER_MODULES.find(m => m.key === superModKey)
    if (!sm) return
    sm.storeKeys.forEach(k => setCountryModuleMode(id, k, newMode))
  }

  function handleSourceChange(newSource) {
    setCountryInheritance(id, newSource)
  }

  const status = country.status ?? 'active'
  const statusColor = status === 'active' ? '#10B981' : status === 'draft' ? 'rgba(255,180,0,0.9)' : 'rgba(255,255,255,0.3)'
  const statusLabel = status === 'active' ? 'Activo' : status === 'draft' ? 'Borrador' : 'Inactivo'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => { setActiveCountry(null); navigate('/countries') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Sora', fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={13} />
          Países
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 28, height: 20, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
            <FlagImage code={country.countryCode} size={28} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Sora' }}>
            {country.name ?? country.countryCode}
          </span>
          <span style={{
            fontSize: 9, padding: '2px 8px', borderRadius: 4,
            background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
            color: statusColor, fontFamily: 'Space Mono', fontWeight: 700, letterSpacing: '0.06em',
          }}>
            {statusLabel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Fuente global de herencia */}
      <div style={{ marginBottom: 20 }}>
        <SourcePicker
          country={country}
          allCountries={countryConfigs}
          onChange={handleSourceChange}
        />
      </div>

      {/* Módulos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SUPER_MODULES.map(mod => (
          <ModuleCard
            key={mod.key}
            mod={mod}
            country={country}
            base={base}
            onModeChange={handleModeChange}
          />
        ))}
      </div>

    </div>
  )
}
