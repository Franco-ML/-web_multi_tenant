import { useState } from 'react'
import { Image, Package, Type, AlignLeft, Palette, Sun, Moon, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTenantStore } from '../store/useTenantStore'
import SectionCard from '../components/config/SectionCard'
import LogoUploader from '../components/config/LogoUploader'
import { ColorPickerField } from '../components/config/ColorPicker'
import PageHeader from '../components/ui/PageHeader'

const BRAND_TOKENS    = ['primary', 'primaryLight', 'primaryDark']
const SEMANTIC_TOKENS = ['success', 'warning', 'error', 'info']
const BG_TOKENS       = ['background', 'backgroundSecondary', 'surface', 'surfaceElevated']
const TEXT_TOKENS     = ['textPrimary', 'textSecondary', 'textInverse']
const BORDER_TOKENS   = ['border', 'borderLight']

const BLOCK_MAP = {
  brand:      { label: 'Colores de marca',      tokens: BRAND_TOKENS,    blockName: 'brand' },
  status:     { label: 'Estados y alertas',      tokens: SEMANTIC_TOKENS, blockName: 'status' },
  background: { label: 'Fondos y superficies',   tokens: BG_TOKENS,       blockName: 'background' },
  text:       { label: 'Textos',                 tokens: TEXT_TOKENS,     blockName: 'text' },
  border:     { label: 'Bordes',                 tokens: BORDER_TOKENS,   blockName: 'border' },
}

function PalettePreview({ colors }) {
  if (!colors) return null
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 4 }}>
      {['background', 'surface', 'primary', 'textPrimary', 'border'].map((k) => (
        <div key={k} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: colors[k] ?? '#888',
          border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function ResetBlockButton({ blockName }) {
  const resetThemeBlock = useTenantStore((s) => s.resetThemeBlock)
  const [done, setDone] = useState(false)

  function handleReset() {
    resetThemeBlock(blockName)
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }

  return (
    <button
      onClick={handleReset}
      title="Restaurar colores por defecto de este bloque"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 5,
        border: done ? '1px solid rgba(52,199,89,0.4)' : '1px solid rgba(255,255,255,0.1)',
        background: done ? 'rgba(52,199,89,0.08)' : 'transparent',
        color: done ? 'rgba(52,199,89,0.8)' : 'rgba(255,255,255,0.3)',
        fontSize: 9, fontFamily: 'Space Mono', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <RotateCcw size={9} />
      {done ? 'Restaurado' : 'Restaurar'}
    </button>
  )
}

const TABS = [
  { id: 'identity', label: 'Identidad' },
  { id: 'colors',   label: 'Colores' },
]

export default function BrandPage() {
  const [tab, setTab] = useState('identity')

  const name        = useTenantStore((s) => s.branding.name)
  const description = useTenantStore((s) => s.branding.description)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)

  const colorMode    = useTenantStore((s) => s.theme.colorMode)
  const lightPalette = useTenantStore((s) => s.theme.light)
  const darkPalette  = useTenantStore((s) => s.theme.dark)
  const setColorMode = useTenantStore((s) => s.setColorMode)

  const MODES = [
    { mode: 'light', Icon: Sun,  iconColor: '#F59E0B', label: 'Modo claro',  sublabel: 'Light', palette: lightPalette, bg: 'linear-gradient(135deg, #fffbe6 0%, #fff9f0 100%)' },
    { mode: 'dark',  Icon: Moon, iconColor: '#818CF8', label: 'Modo oscuro', sublabel: 'Dark',  palette: darkPalette,  bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)' },
  ]

  return (
    <div>
      <PageHeader
        title="Imagen de marca"
        subtitle="Logo, nombre, y paleta de colores que definen la apariencia de la app"
        icon={Image}
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: 4,
      }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: tab === id ? 'rgba(232,23,93,0.15)' : 'transparent',
              color: tab === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              fontSize: 12, fontFamily: 'Sora', fontWeight: 600, letterSpacing: '-0.2px',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Pestaña Identidad ── */}
      {tab === 'identity' && (
        <>
          <SectionCard title="Logo de la empresa" description="Se muestra en la pantalla de acceso y en la app" icon={Package} delay={0.05}>
            <LogoUploader />
          </SectionCard>

          <SectionCard title="Nombre de la empresa" description="Aparece en la pantalla de bienvenida" icon={Type} delay={0.1}>
            <input
              value={name}
              onChange={(e) => setBrandingField('name', e.target.value)}
              placeholder="Nombre de la empresa"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Sora',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
              onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </SectionCard>

          <SectionCard title="Descripción" description="Texto breve que describe el propósito de la app" icon={AlignLeft} delay={0.15}>
            <textarea
              value={description}
              onChange={(e) => setBrandingField('description', e.target.value)}
              placeholder="Describe brevemente la plataforma..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'Sora',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                lineHeight: 1.6, transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
              onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </SectionCard>
        </>
      )}

      {/* ── Pestaña Colores ── */}
      {tab === 'colors' && (
        <>
          {/* Selector de modo */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'Space Mono', marginBottom: 12,
            }}>
              Paleta a editar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {MODES.map(({ mode, Icon, iconColor, label, sublabel, palette, bg }) => {
                const active = colorMode === mode
                return (
                  <motion.button
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '18px 14px', borderRadius: 14, cursor: 'pointer',
                      border: `2px solid ${active ? 'rgba(232,23,93,0.55)' : 'rgba(255,255,255,0.07)'}`,
                      background: active ? 'rgba(232,23,93,0.08)' : 'rgba(255,255,255,0.02)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'border-color 0.2s, background 0.2s',
                      boxShadow: active ? '0 0 24px rgba(232,23,93,0.12)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 56, height: 38, borderRadius: 8, background: bg,
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color={iconColor} />
                    </div>
                    <PalettePreview colors={palette} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Sora', color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)', letterSpacing: '-0.3px' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 8, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                        {sublabel}
                      </div>
                    </div>
                    {active && (
                      <div style={{
                        padding: '2px 8px', borderRadius: 5,
                        background: 'rgba(232,23,93,0.15)', border: '1px solid rgba(232,23,93,0.3)',
                        fontSize: 8, fontFamily: 'Space Mono', color: '#E8175D',
                      }}>
                        editando
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Bloques de colores con botón Restaurar */}
          {Object.values(BLOCK_MAP).map(({ label, tokens, blockName }, i) => (
            <div key={blockName} style={{ marginBottom: 12 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Palette size={13} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora', letterSpacing: '-0.2px' }}>
                      {label}
                    </span>
                  </div>
                  <ResetBlockButton blockName={blockName} />
                </div>
                <div style={{ padding: '10px 16px 14px' }}>
                  {tokens.map((token) => (
                    <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
