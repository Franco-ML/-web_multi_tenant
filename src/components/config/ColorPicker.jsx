import { useState, useRef, useEffect } from 'react'
import { useTenantStore } from '../../store/useTenantStore'

const COLOR_TOKEN_LABELS = {
  primary: 'Color primario',
  primaryLight: 'Primario claro',
  primaryDark: 'Primario oscuro',
  success: 'Éxito',
  warning: 'Advertencia',
  error: 'Error',
  info: 'Información',
  background: 'Fondo principal',
  backgroundSecondary: 'Fondo secundario',
  surface: 'Superficie',
  surfaceElevated: 'Superficie elevada',
  textPrimary: 'Texto principal',
  textSecondary: 'Texto secundario',
  textInverse: 'Texto inverso',
  border: 'Borde',
  borderLight: 'Borde suave',
}

export function ColorPickerField({ tokenKey, palette = 'light' }) {
  const value = useTenantStore((s) => s.theme[palette]?.[tokenKey]) ?? '#000000'
  const setColor = useTenantStore((s) => s.setColor)
  const [hexInput, setHexInput] = useState(value)
  const debounceRef = useRef(null)
  const label = COLOR_TOKEN_LABELS[tokenKey] ?? tokenKey

  useEffect(() => { setHexInput(value) }, [value])

  const handleColorChange = (newVal) => {
    setHexInput(newVal)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (/^#[0-9A-Fa-f]{6}$/.test(newVal)) {
        setColor(palette, tokenKey, newVal)
      }
    }, 50)
  }

  const handleHexInput = (e) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setColor(palette, tokenKey, val)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Color swatch button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: value,
          border: '2px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          boxShadow: `0 0 12px ${value}44`,
          transition: 'box-shadow 0.2s ease',
          overflow: 'hidden',
        }}>
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              opacity: 0,
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.75)',
          fontFamily: 'Sora, sans-serif',
          letterSpacing: '-0.2px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          fontFamily: 'Space Mono, monospace',
          marginTop: 1,
        }}>
          {tokenKey}
        </div>
      </div>

      {/* Hex input */}
      <input
        value={hexInput}
        onChange={handleHexInput}
        spellCheck={false}
        style={{
          width: 78,
          padding: '5px 8px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10,
          fontFamily: 'Space Mono, monospace',
          letterSpacing: '0.05em',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          flexShrink: 0,
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  )
}
