import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, ChevronDown, Info } from 'lucide-react'
import { useTenantStore, DEFAULT_TRANSLATIONS } from '../store/useTenantStore'
import PageHeader from '../components/ui/PageHeader'
import SectionCard from '../components/config/SectionCard'
import FlagImage from '../components/ui/FlagImage'

const LANGUAGE_META = {
  es:     { flag: '🇪🇸', label: 'Español',  sublabel: 'Spanish'  },
  en:     { flag: '🇺🇸', label: 'English',  sublabel: 'Inglés'   },
  'zh-CN':{ flag: '🇨🇳', label: '中文',     sublabel: 'Chino Mandarín' },
}

const TRANSLATION_KEYS = [
  { key: 'loginWelcome',  label: 'Bienvenida',           section: 'Login' },
  { key: 'loginSubtitle', label: 'Subtítulo de login',    section: 'Login' },
  { key: 'loginButton',   label: 'Botón de continuar',    section: 'Login' },
  { key: 'tabHome',       label: 'Tab Inicio',            section: 'Navegación' },
  { key: 'tabRoutes',     label: 'Tab Rutas',             section: 'Navegación' },
  { key: 'tabProfile',    label: 'Tab Perfil',            section: 'Navegación' },
  { key: 'swipeToStart',  label: 'Deslizar para escanear',section: 'Escáner' },
]

const SECTIONS = [...new Set(TRANSLATION_KEYS.map(k => k.section))]

function TranslationRow({ tKey, label, lang, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: '0 0 140px', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora', letterSpacing: '-0.2px' }}>
          {label}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', marginTop: 1 }}>
          {tKey}
        </div>
      </div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(tKey, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          padding: '6px 10px',
          borderRadius: 8,
          border: `1px solid ${focused ? 'rgba(232,23,93,0.4)' : 'rgba(255,255,255,0.08)'}`,
          background: focused ? 'rgba(232,23,93,0.04)' : 'rgba(255,255,255,0.03)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 11,
          fontFamily: 'Sora, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      />
    </div>
  )
}

function SectionGroup({ title, keys, translations, lang, onTranslate }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: open ? 4 : 0,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Space Mono', flex: 1, textAlign: 'left' }}>
          {title}
        </span>
        <ChevronDown size={12} color="rgba(255,255,255,0.2)" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {keys.map(({ key, label }) => (
              <TranslationRow
                key={key}
                tKey={key}
                label={label}
                lang={lang}
                value={translations?.[key]}
                onChange={onTranslate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LanguagePage() {
  const i18n         = useTenantStore((s) => s.i18n)
  const setI18nMeta  = useTenantStore((s) => s.setI18nMeta)
  const setTranslation = useTenantStore((s) => s.setTranslation)

  const [activeLang, setActiveLang] = useState(i18n?.defaultLang ?? 'es')

  const langs = Object.keys(LANGUAGE_META)
  const currentTranslations = i18n?.translations?.[activeLang] ?? {}

  const handleTranslate = (key, value) => {
    setTranslation(activeLang, key, value)
  }

  return (
    <div>
      <PageHeader
        title="Idiomas"
        subtitle="Define el idioma predeterminado y personaliza los textos de la app"
        icon={Languages}
      />

      {/* Selector idioma predeterminado */}
      <SectionCard delay={0.05}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Space Mono', marginBottom: 12 }}>
          Idioma predeterminado
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {langs.map((code) => {
            const meta = LANGUAGE_META[code]
            const active = i18n?.defaultLang === code
            return (
              <motion.button
                key={code}
                onClick={() => setI18nMeta('defaultLang', code)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 10px',
                  borderRadius: 12,
                  border: `2px solid ${active ? 'rgba(232,23,93,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(232,23,93,0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: active ? '0 0 20px rgba(232,23,93,0.1)' : 'none',
                }}
              >
                <div style={{ width: 44, height: 30, borderRadius: 6, overflow: 'hidden', boxShadow: active ? '0 2px 12px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.3)' }}>
                  <FlagImage code={code} type="lang" size={40} fallback={meta.flag} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora', color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)', letterSpacing: '-0.2px' }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: 8, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                    {meta.sublabel}
                  </div>
                </div>
                {active && (
                  <div style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(232,23,93,0.15)', border: '1px solid rgba(232,23,93,0.3)', fontSize: 8, fontFamily: 'Space Mono', color: '#E8175D' }}>
                    predeterminado
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </SectionCard>

      {/* Toggle userCanChange */}
      <SectionCard delay={0.1}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Sora', color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px' }}>
              Permitir cambio de idioma
            </div>
            <div style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
              El mensajero puede cambiar el idioma desde su perfil en la app
            </div>
          </div>
          <button
            onClick={() => setI18nMeta('userCanChange', !i18n?.userCanChange)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none',
              background: i18n?.userCanChange ? '#E8175D' : 'rgba(255,255,255,0.1)',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <motion.div
              animate={{ x: i18n?.userCanChange ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{ position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            />
          </button>
        </div>
      </SectionCard>

      {/* Editor de traducciones */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Space Mono' }}>
            Textos por idioma
          </div>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Tabs por idioma */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {langs.map((code) => {
            const meta = LANGUAGE_META[code]
            const sel = activeLang === code
            return (
              <motion.button
                key={code}
                onClick={() => setActiveLang(code)}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, border: 'none',
                  background: sel ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  outline: sel ? '1px solid rgba(232,23,93,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.15s, outline 0.15s',
                }}
              >
                <div style={{ width: 20, height: 14, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <FlagImage code={code} type="lang" size={20} fallback={meta.flag} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'Sora', color: sel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
                  {meta.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        <SectionCard delay={0.15}>
          {SECTIONS.map((section) => (
            <SectionGroup
              key={section}
              title={section}
              keys={TRANSLATION_KEYS.filter(k => k.section === section)}
              translations={currentTranslations}
              lang={activeLang}
              onTranslate={handleTranslate}
            />
          ))}
        </SectionCard>
      </div>

      {/* Nota informativa */}
      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: 'rgba(147,197,253,0.05)',
        border: '1px solid rgba(147,197,253,0.12)',
        borderRadius: 10,
        fontSize: 11,
        color: 'rgba(147,197,253,0.6)',
        fontFamily: 'Space Mono',
        lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Info size={12} color="rgba(147,197,253,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Los textos que edites aquí se aplican a la app en tiempo real en el simulador.
            {i18n?.userCanChange
              ? ' El mensajero puede cambiar el idioma desde Perfil → Configuración.'
              : ' El mensajero no puede cambiar el idioma (fijo por el tenant).'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
