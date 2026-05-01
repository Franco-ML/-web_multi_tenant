import { Languages } from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import SectionCard from '../components/config/SectionCard'
import PageHeader from '../components/ui/PageHeader'

const FIELDS = [
  {
    group: 'Pantalla de login',
    items: [
      { key: 'loginWelcome', label: 'Título de bienvenida', placeholder: 'Bienvenido' },
      { key: 'loginSubtitle', label: 'Subtítulo', placeholder: 'Ingresa para continuar' },
      { key: 'loginButton', label: 'Texto del botón', placeholder: 'Continuar' },
    ],
  },
  {
    group: 'Tabs de navegación',
    items: [
      { key: 'tabLabelHome', label: 'Tab Inicio', placeholder: 'Inicio' },
      { key: 'tabLabelRoutes', label: 'Tab Rutas', placeholder: 'Ruta' },
      { key: 'tabLabelProfile', label: 'Tab Perfil', placeholder: 'Perfil' },
    ],
  },
  {
    group: 'Pantalla de inicio',
    items: [
      { key: 'swipeToStart', label: 'Texto del botón deslizable', placeholder: 'Desliza para Iniciar Escaneo' },
    ],
  },
]

function I18nField({ fieldKey, label, placeholder }) {
  const value = useTenantStore((s) => s.i18n[fieldKey])
  const setI18nField = useTenantStore((s) => s.setI18nField)

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: 'block',
        fontSize: 10,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Space Mono',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: 5,
      }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => setI18nField(fieldKey, e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 11px',
          borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 12,
          fontFamily: 'Sora',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  )
}

export default function I18nPage() {
  return (
    <div>
      <PageHeader
        title="Textos y mensajes"
        subtitle="Personaliza los textos clave de la app para este tenant"
        icon={Languages}
      />
      {FIELDS.map(({ group, items }, gi) => (
        <SectionCard key={group} title={group} icon={Languages} delay={gi * 0.07}>
          {items.map((item) => (
            <I18nField key={item.key} fieldKey={item.key} label={item.label} placeholder={item.placeholder} />
          ))}
        </SectionCard>
      ))}
    </div>
  )
}
