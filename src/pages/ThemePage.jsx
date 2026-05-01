import { Palette, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTenantStore } from '../store/useTenantStore'
import SectionCard from '../components/config/SectionCard'
import { ColorPickerField } from '../components/config/ColorPicker'
import PageHeader from '../components/ui/PageHeader'

const BRAND_TOKENS = ['primary', 'primaryLight', 'primaryDark']
const SEMANTIC_TOKENS = ['success', 'warning', 'error', 'info']
const BG_TOKENS = ['background', 'backgroundSecondary', 'surface', 'surfaceElevated']
const TEXT_TOKENS = ['textPrimary', 'textSecondary', 'textInverse']
const BORDER_TOKENS = ['border', 'borderLight']

function PalettePreview({ colors }) {
  if (!colors) return null
  return (
    <div style={{
      display: 'flex', gap: 3, justifyContent: 'center', marginTop: 4,
    }}>
      {['background', 'surface', 'primary', 'textPrimary', 'border'].map((k) => (
        <div key={k} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: colors[k] ?? '#888',
          border: '1px solid rgba(255,255,255,0.15)',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

export default function ThemePage() {
  const colorMode = useTenantStore((s) => s.theme.colorMode)
  const lightPalette = useTenantStore((s) => s.theme.light)
  const darkPalette  = useTenantStore((s) => s.theme.dark)
  const setColorMode = useTenantStore((s) => s.setColorMode)

  const MODES = [
    {
      mode: 'light',
      Icon: Sun,
      iconColor: '#F59E0B',
      label: 'Modo claro',
      sublabel: 'Light',
      palette: lightPalette,
      bg: 'linear-gradient(135deg, #fffbe6 0%, #fff9f0 100%)',
    },
    {
      mode: 'dark',
      Icon: Moon,
      iconColor: '#818CF8',
      label: 'Modo oscuro',
      sublabel: 'Dark',
      palette: darkPalette,
      bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tema visual"
        subtitle="Personaliza los colores de la app del mensajero en tiempo real"
        icon={Palette}
      />

      {/* Mode picker — tarjetas tipo bandera */}
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
                  padding: '18px 14px',
                  borderRadius: 14,
                  border: `2px solid ${active ? 'rgba(232,23,93,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(232,23,93,0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: active ? '0 0 24px rgba(232,23,93,0.12)' : 'none',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Mini pantalla de preview */}
                <div style={{
                  width: 56, height: 38,
                  borderRadius: 8,
                  background: bg,
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? `0 4px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,200,80,0.3)'}` : 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  <Icon size={22} color={iconColor} />
                </div>

                <PalettePreview colors={palette} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, fontFamily: 'Sora',
                    color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    letterSpacing: '-0.3px',
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 8, fontFamily: 'Space Mono',
                    color: 'rgba(255,255,255,0.2)', marginTop: 1,
                  }}>
                    {sublabel}
                  </div>
                </div>

                {active && (
                  <div style={{
                    padding: '2px 8px', borderRadius: 5,
                    background: 'rgba(232,23,93,0.15)',
                    border: '1px solid rgba(232,23,93,0.3)',
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

      <SectionCard title="Colores de marca" icon={Palette} delay={0.1}>
        {BRAND_TOKENS.map((token) => (
          <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
        ))}
      </SectionCard>

      <SectionCard title="Colores semánticos" delay={0.15}>
        {SEMANTIC_TOKENS.map((token) => (
          <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
        ))}
      </SectionCard>

      <SectionCard title="Fondos y superficies" delay={0.2}>
        {BG_TOKENS.map((token) => (
          <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
        ))}
      </SectionCard>

      <SectionCard title="Texto" delay={0.25}>
        {TEXT_TOKENS.map((token) => (
          <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
        ))}
      </SectionCard>

      <SectionCard title="Bordes" delay={0.3}>
        {BORDER_TOKENS.map((token) => (
          <ColorPickerField key={token} tokenKey={token} palette={colorMode} />
        ))}
      </SectionCard>
    </div>
  )
}
