import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Globe2, Palette, LogIn, Rocket, Moon, Sun,
  ChevronRight, ChevronLeft, Check, Phone, Mail, KeyRound,
} from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../../store/useTenantStore'
import PhoneSimulator from '../simulator/PhoneSimulator'
import LogoUploader from '../config/LogoUploader'
import FlagImage from '../ui/FlagImage'
import AnimatedBackground from '../background/AnimatedBackground'
import { useCssVariables } from '../../hooks/useCssVariables'

// ─── Pasos del wizard ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'identity',   label: 'Empresa',   Icon: Building2 },
  { id: 'country',    label: 'País',      Icon: Globe2    },
  { id: 'colors',     label: 'Colores',   Icon: Palette   },
  { id: 'background', label: 'Fondo',     Icon: Moon      },
  { id: 'login',      label: 'Acceso',    Icon: LogIn     },
  { id: 'done',       label: 'Listo',     Icon: Rocket    },
]

// ─── Paso 1 — Identidad ───────────────────────────────────────────────────────

function StepIdentity() {
  const name        = useTenantStore((s) => s.branding.name)
  const description = useTenantStore((s) => s.branding.description)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeader
        title="¿Cómo se llama tu empresa?"
        subtitle="Esta información aparecerá en la pantalla de acceso de la app."
      />

      <div>
        <FieldLabel>Nombre de la empresa *</FieldLabel>
        <input
          autoFocus
          value={name}
          onChange={(e) => setBrandingField('name', e.target.value)}
          placeholder="Ej: Mensajeros Express"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
          onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      <div>
        <FieldLabel>Logo (opcional)</FieldLabel>
        <LogoUploader />
      </div>

      <div>
        <FieldLabel>Descripción breve (opcional)</FieldLabel>
        <input
          value={description}
          onChange={(e) => setBrandingField('description', e.target.value)}
          placeholder="Ej: Plataforma de mensajería para Costa Rica"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
          onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>
    </div>
  )
}

// ─── Paso 2 — País ────────────────────────────────────────────────────────────

function StepCountry({ selectedCountry, onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = COUNTRY_CATALOG.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StepHeader
        title="¿En qué país opera la empresa?"
        subtitle="Este será el país principal. Podrás añadir más países después desde el panel."
      />

      <input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar país…"
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
        onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: 8, maxHeight: 300, overflowY: 'auto',
        paddingRight: 4,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        {filtered.map(c => {
          const active = selectedCountry?.countryCode === c.countryCode
          return (
            <motion.button
              key={c.countryCode}
              onClick={() => onSelect(c)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                background: active ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? 'rgba(232,23,93,0.45)' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.12s',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#E8175D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={8} color="#fff" />
                </div>
              )}
              <div style={{ width: 42, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                <FlagImage code={c.countryCode} size={42} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
              </div>
              <div style={{
                fontSize: 8, fontFamily: 'Space Mono', fontWeight: 700, letterSpacing: '0.04em',
                color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
              }}>
                {c.countryCode}
              </div>
              <div style={{
                fontSize: 8, fontFamily: 'Sora', textAlign: 'center', lineHeight: 1.2,
                color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                maxWidth: 80, overflow: 'hidden',
              }}>
                {c.name}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Paso 3 — Colores ─────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#E8175D', '#FF6B35', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4',
  '#EF4444', '#14B8A6', '#6366F1', '#84CC16',
]

function StepColors() {
  const primary    = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')
  const setColor   = useTenantStore((s) => s.setColor)
  const [hex, setHex] = useState(primary)
  const debounceRef   = useRef(null)

  function applyColor(val) {
    setHex(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        setColor('light', 'primary', val)
        setColor('light', 'primaryDark', shadeColor(val, -20))
        setColor('light', 'primaryLight', shadeColor(val, 30))
        setColor('light', 'borderFocus', val)
        setColor('dark',  'primary', val)
        setColor('dark',  'primaryDark', shadeColor(val, -20))
        setColor('dark',  'primaryLight', shadeColor(val, 30))
        setColor('dark',  'borderFocus', val)
      }
    }, 60)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeader
        title="¿De qué color es tu marca?"
        subtitle="Este color aparecerá en botones, íconos activos y acentos de la app."
      />

      {/* Presets */}
      <div>
        <FieldLabel>Colores sugeridos</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {PRESET_COLORS.map(c => (
            <motion.button
              key={c}
              onClick={() => applyColor(c)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: c,
                boxShadow: primary === c ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${c}` : '0 2px 6px rgba(0,0,0,0.4)',
                transition: 'box-shadow 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <FieldLabel>O ingresa un color personalizado</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: primary, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <input type="color" value={primary}
                onChange={(e) => applyColor(e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
            </div>
          </div>
          <input
            value={hex}
            onChange={(e) => applyColor(e.target.value)}
            placeholder="#E8175D"
            style={{ ...inputStyle, flex: 1, fontFamily: 'Space Mono', letterSpacing: '0.05em' }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
            onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      {/* Preview de cómo se ve el color */}
      <div style={{
        padding: '14px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: primary,
          boxShadow: `0 4px 16px ${primary}55`,
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
            Vista previa
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', marginTop: 2 }}>
            botones, íconos activos y acentos
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '8px 18px', borderRadius: 8,
          background: primary, color: '#fff',
          fontSize: 11, fontFamily: 'Sora', fontWeight: 700,
          boxShadow: `0 4px 12px ${primary}55`,
        }}>
          Continuar
        </div>
      </div>
    </div>
  )
}

// ─── Paso 4 — Fondo ───────────────────────────────────────────────────────────

const BG_LIGHT_PRESETS = ['#FFFFFF', '#F5F5F5', '#F0EDE8', '#EEF2FF', '#FFF0F5', '#F0FFF4']
const BG_DARK_PRESETS  = ['#0D0D0D', '#111827', '#0F172A', '#1A1A2E', '#0D1B2A', '#1A0A0D']

function StepBackground() {
  const colorMode    = useTenantStore((s) => s.theme.colorMode)
  const bgLight      = useTenantStore((s) => s.theme.light?.background ?? '#FFFFFF')
  const bgDark       = useTenantStore((s) => s.theme.dark?.background  ?? '#0D0D0D')
  const setColorMode = useTenantStore((s) => s.setColorMode)
  const setColor     = useTenantStore((s) => s.setColor)
  const primary      = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')

  const isDark    = colorMode === 'dark'
  const currentBg = isDark ? bgDark : bgLight
  const presets   = isDark ? BG_DARK_PRESETS : BG_LIGHT_PRESETS

  function applyBg(hex) {
    const palette = isDark ? 'dark' : 'light'
    setColor(palette, 'background', hex)
    // backgroundSecondary ligeramente más oscuro/claro
    setColor(palette, 'backgroundSecondary', shadeColor(hex, isDark ? 8 : -4))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeader
        title="¿Cómo es el fondo de la app?"
        subtitle="Elegí el modo y el color base. Esto afecta todas las pantallas de la app."
      />

      {/* Selector modo claro / oscuro */}
      <div>
        <FieldLabel>Modo de la app</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          {[
            { mode: 'light', Icon: Sun,  label: 'Modo claro',  bg: '#FFFFFF', text: '#111' },
            { mode: 'dark',  Icon: Moon, label: 'Modo oscuro', bg: '#0D0D0D', text: '#fff' },
          ].map(({ mode, Icon, label, bg, text }) => {
            const active = colorMode === mode
            return (
              <motion.button
                key={mode}
                onClick={() => setColorMode(mode)}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '18px 12px', borderRadius: 14, cursor: 'pointer',
                  background: active ? `${primary}12` : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${active ? primary : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.15s',
                  boxShadow: active ? `0 0 20px ${primary}20` : 'none',
                }}
              >
                {/* Mini pantalla */}
                <div style={{
                  width: 64, height: 44, borderRadius: 8, overflow: 'hidden',
                  background: bg,
                  border: '1px solid rgba(0,0,0,0.15)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-start',
                  padding: '5px 6px', gap: 4,
                }}>
                  <div style={{ width: '70%', height: 4, borderRadius: 2, background: primary, opacity: 0.8 }} />
                  <div style={{ width: '90%', height: 3, borderRadius: 2, background: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
                  <div style={{ width: '60%', height: 3, borderRadius: 2, background: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' }} />
                  <div style={{ marginTop: 'auto', width: '80%', height: 5, borderRadius: 3, background: primary }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} color={active ? primary : 'rgba(255,255,255,0.4)'} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontFamily: 'Sora' }}>
                    {label}
                  </span>
                </div>
                {active && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 16, height: 16, borderRadius: '50%',
                    background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={8} color="#fff" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Color de fondo */}
      <div>
        <FieldLabel>Color de fondo — {isDark ? 'modo oscuro' : 'modo claro'}</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 10 }}>
          {presets.map(c => (
            <motion.button
              key={c}
              onClick={() => applyBg(c)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: c,
                boxShadow: currentBg === c
                  ? `0 0 0 3px rgba(255,255,255,0.7), 0 0 0 5px ${primary}`
                  : '0 2px 6px rgba(0,0,0,0.5)',
                transition: 'box-shadow 0.15s',
                outline: 'none',
              }}
            />
          ))}
          {/* Custom */}
          <div style={{ position: 'relative', width: 32, height: 32 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}>
              <input
                type="color" value={currentBg}
                onChange={(e) => applyBg(e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Preview fondo */}
        <div style={{
          height: 56, borderRadius: 12,
          background: currentBg,
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: primary, opacity: 0.8 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ width: 80, height: 6, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }} />
            <div style={{ width: 56, height: 4, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
          </div>
          <div style={{ marginLeft: 8, padding: '5px 12px', borderRadius: 8, background: primary, fontSize: 9, color: '#fff', fontFamily: 'Sora', fontWeight: 700 }}>
            OK
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Paso 5 — Acceso ──────────────────────────────────────────────────────────

function StepLogin() {
  const login        = useTenantStore((s) => s.login)
  const setLoginField = useTenantStore((s) => s.setLoginField)
  const primary      = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')

  function toggle(field) {
    const next = !login[field]
    if (!next && (field === 'phoneEnabled' ? !login.emailEnabled : !login.phoneEnabled)) return
    setLoginField(field, next)
  }

  const METHODS = [
    {
      field: 'phoneEnabled',
      Icon: Phone,
      label: 'Número de teléfono',
      desc: 'El mensajero recibe un código por SMS para entrar',
    },
    {
      field: 'emailEnabled',
      Icon: Mail,
      label: 'Correo electrónico',
      desc: 'El mensajero entra con su email y contraseña',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StepHeader
        title="¿Cómo entran los mensajeros?"
        subtitle="Elige cómo se identificarán los mensajeros al abrir la app. Puedes habilitar uno o ambos métodos."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {METHODS.map(({ field, Icon, label, desc }) => {
          const on = login[field] ?? true
          const isLast = !on && (field === 'phoneEnabled' ? !login.emailEnabled : !login.phoneEnabled)
          return (
            <motion.button
              key={field}
              onClick={() => toggle(field)}
              whileTap={{ scale: 0.99 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 12, cursor: isLast ? 'not-allowed' : 'pointer',
                background: on ? `${primary}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${on ? `${primary}35` : 'rgba(255,255,255,0.07)'}`,
                textAlign: 'left', transition: 'all 0.2s',
                opacity: isLast ? 0.4 : 1,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: on ? `${primary}18` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Icon size={18} color={on ? primary : 'rgba(255,255,255,0.3)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontFamily: 'Sora', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', lineHeight: 1.4 }}>
                  {desc}
                </div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: on ? primary : 'rgba(255,255,255,0.08)',
                border: `2px solid ${on ? primary : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {on && <Check size={10} color="#fff" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* PIN */}
      <div style={{
        padding: '14px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <KeyRound size={16} color="rgba(88,86,214,0.8)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
            PIN de 4 dígitos activado
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', marginTop: 2 }}>
            Se pedirá al mensajero al abrir la app · configurable en Funciones
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Paso 5 — Listo ───────────────────────────────────────────────────────────

function StepDone({ selectedCountry }) {
  const name       = useTenantStore((s) => s.branding.name)
  const primary    = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')
  const colorMode  = useTenantStore((s) => s.theme.colorMode)
  const bgLight    = useTenantStore((s) => s.theme.light?.background ?? '#FFFFFF')
  const bgDark     = useTenantStore((s) => s.theme.dark?.background  ?? '#0D0D0D')
  const login      = useTenantStore((s) => s.login)

  const bg      = colorMode === 'dark' ? bgDark : bgLight
  const methods = [login.phoneEnabled && 'Teléfono', login.emailEnabled && 'Correo'].filter(Boolean)

  const SUMMARY = [
    { label: 'Empresa',   value: name || '—' },
    { label: 'País',      value: selectedCountry ? `${selectedCountry.name} (${selectedCountry.countryCode})` : '—' },
    { label: 'Color',     value: primary, isColor: true },
    { label: 'Fondo',     value: `${colorMode === 'dark' ? 'Oscuro' : 'Claro'} · ${bg}`, isColor: true, colorVal: bg },
    { label: 'Acceso',    value: methods.join(' + ') || '—' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
            background: `${primary}18`,
            border: `2px solid ${primary}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 40px ${primary}30`,
          }}
        >
          <Rocket size={30} color={primary} />
        </motion.div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: 'Sora', letterSpacing: '-0.5px' }}>
          ¡Todo listo!
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', marginTop: 6, lineHeight: 1.5 }}>
          Revisá el resumen antes de entrar al panel.
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {SUMMARY.map(({ label, value, isColor, colorVal }, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < SUMMARY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 7 }}>
              {isColor && <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: colorVal ?? value, border: '1px solid rgba(255,255,255,0.2)', verticalAlign: 'middle' }} />}
              {value}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', lineHeight: 1.6, textAlign: 'center' }}>
        Podés modificar todo esto en cualquier momento desde el panel de configuración.
      </div>
    </div>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function StepHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: 'Sora', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', marginTop: 7, lineHeight: 1.6 }}>
        {subtitle}
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
      fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7,
    }}>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: 9,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.9)', fontSize: 14,
  fontFamily: 'Sora', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

function shadeColor(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(2.55 * pct)))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(2.55 * pct)))
  const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(2.55 * pct)))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  useCssVariables()
  const [step, setStep] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState(null)

  const primary        = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')
  const name           = useTenantStore((s) => s.branding.name)
  const createCountry  = useTenantStore((s) => s.createCountry)
  const setAdvancedField = useTenantStore((s) => s.setAdvancedField)

  const progress = (step / (STEPS.length - 1)) * 100

  function canNext() {
    if (step === 0) return name.trim().length > 0
    if (step === 1) return !!selectedCountry
    return true
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  function handleFinish() {
    if (selectedCountry) {
      createCountry(selectedCountry, { mode: 'inherit-base' })
    }
    setAdvancedField('_setupComplete', true)
  }

  const isFinalStep = step === STEPS.length - 1

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#080a0f', position: 'relative',
    }}>
      <AnimatedBackground />

      {/* ── Panel izquierdo: wizard ── */}
      <div style={{
        flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}>
        {/* Header con pasos */}
        <div style={{
          padding: '28px 48px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(8,10,15,0.85)', backdropFilter: 'blur(16px)',
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${primary}, ${primary}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px ${primary}44`,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Configuración inicial
            </span>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {/* Línea de progreso */}
            <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
            <motion.div
              style={{ position: 'absolute', top: 14, left: 14, height: 2, background: primary, zIndex: 0, boxShadow: `0 0 8px ${primary}60` }}
              animate={{ width: `calc(${progress}% - 28px * ${progress / 100})` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />

            {STEPS.map((s, i) => {
              const done    = i < step
              const current = i === step
              const { Icon } = s
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, position: 'relative', zIndex: 1 }}>
                  <motion.div
                    animate={{
                      background: done ? primary : current ? `${primary}22` : 'rgba(255,255,255,0.04)',
                      borderColor: done || current ? primary : 'rgba(255,255,255,0.1)',
                    }}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '2px solid',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {done
                      ? <Check size={12} color="#fff" />
                      : <Icon size={12} color={current ? primary : 'rgba(255,255,255,0.25)'} />
                    }
                  </motion.div>
                  <span style={{
                    fontSize: 9, fontFamily: 'Space Mono', fontWeight: 600, letterSpacing: '0.04em',
                    color: current ? 'rgba(255,255,255,0.8)' : done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.2s',
                  }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contenido del paso */}
        <div style={{ flex: 1, padding: '40px 48px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            >
              {step === 0 && <StepIdentity />}
              {step === 1 && <StepCountry selectedCountry={selectedCountry} onSelect={setSelectedCountry} />}
              {step === 2 && <StepColors />}
              {step === 3 && <StepBackground />}
              {step === 4 && <StepLogin />}
              {step === 5 && <StepDone selectedCountry={selectedCountry} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer con navegación */}
        <div style={{
          padding: '20px 48px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(8,10,15,0.7)', backdropFilter: 'blur(12px)',
        }}>
          <button
            onClick={handleBack}
            disabled={step === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', cursor: step === 0 ? 'not-allowed' : 'pointer',
              color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)',
              fontSize: 13, fontFamily: 'Sora', fontWeight: 600, transition: 'all 0.15s',
            }}
          >
            <ChevronLeft size={14} /> Atrás
          </button>

          <div style={{ flex: 1 }} />

          {/* Dots de progreso */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                background: i === step ? primary : i < step ? `${primary}60` : 'rgba(255,255,255,0.1)',
                transition: 'all 0.25s',
              }} />
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <motion.button
            onClick={isFinalStep ? handleFinish : handleNext}
            disabled={!canNext()}
            whileHover={canNext() ? { scale: 1.02 } : {}}
            whileTap={canNext() ? { scale: 0.98 } : {}}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: canNext() ? primary : `${primary}30`,
              color: '#fff', fontSize: 13, fontFamily: 'Sora', fontWeight: 700,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              boxShadow: canNext() ? `0 4px 18px ${primary}40` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isFinalStep ? (
              <><Rocket size={14} /> Comenzar</>
            ) : (
              <>Siguiente <ChevronRight size={14} /></>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Panel derecho: simulador ── */}
      <div style={{
        width: 340, flexShrink: 0, height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,16,23,0.8)', backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: primary, boxShadow: `0 0 7px ${primary}80` }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Vista previa en vivo
          </span>
        </div>
        <div style={{ paddingTop: 50 }}>
          <PhoneSimulator />
        </div>
      </div>
    </div>
  )
}
