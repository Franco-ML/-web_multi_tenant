import { Settings, AlertTriangle } from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import SectionCard from '../components/config/SectionCard'
import PageHeader from '../components/ui/PageHeader'

function AdvancedField({ label, description, fieldKey, placeholder, type = 'text' }) {
  const value = useTenantStore((s) => s.advanced[fieldKey])
  const setAdvancedField = useTenantStore((s) => s.setAdvancedField)

  return (
    <div style={{ marginBottom: 14 }}>
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
      {description && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', marginBottom: 5 }}>
          {description}
        </div>
      )}
      <input
        value={value}
        onChange={(e) => setAdvancedField(fieldKey, e.target.value)}
        placeholder={placeholder}
        type={type}
        style={{
          width: '100%',
          padding: '8px 11px',
          borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 12,
          fontFamily: 'Space Mono',
          outline: 'none',
          boxSizing: 'border-box',
          letterSpacing: '0.03em',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  )
}

export default function AdvancedPage() {
  const appEnv = useTenantStore((s) => s.advanced.appEnv)
  const setAdvancedField = useTenantStore((s) => s.setAdvancedField)

  return (
    <div>
      <PageHeader
        title="Configuración avanzada"
        subtitle="Credenciales y conexiones de servicios externos. Solo visible para el equipo técnico."
        icon={Settings}
      />

      {/* Warning */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '12px 14px',
        background: 'rgba(255,149,0,0.08)',
        border: '1px solid rgba(255,149,0,0.2)',
        borderRadius: 10,
        marginBottom: 16,
      }}>
        <AlertTriangle size={16} color="rgba(255,149,0,0.8)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 11, color: 'rgba(255,149,0,0.8)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
          Esta información es de uso técnico. No la compartas con personas fuera del equipo de integración.
        </div>
      </div>

      <SectionCard title="Conexión al servidor" icon={Settings} delay={0.05}>
        <AdvancedField
          fieldKey="apiUrl"
          label="URL del servidor"
          description="Dirección principal del servidor de la app"
          placeholder="https://api.mi-empresa.com"
        />

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
            Entorno de operación
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['dev', 'stag', 'prod'].map((env) => (
              <button
                key={env}
                onClick={() => setAdvancedField('appEnv', env)}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: 7,
                  border: appEnv === env ? '1px solid rgba(232,23,93,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: appEnv === env ? 'rgba(232,23,93,0.12)' : 'transparent',
                  color: appEnv === env ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  fontSize: 11,
                  fontFamily: 'Space Mono',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Integraciones técnicas" delay={0.1}>
        <AdvancedField fieldKey="sentryDsn" label="Monitoreo de errores (Sentry DSN)" placeholder="https://xxx@sentry.io/xxx" />
        <AdvancedField fieldKey="googleMapsApiKey" label="Clave de Google Maps" placeholder="AIzaSy..." />
      </SectionCard>

      <SectionCard title="Contacto y soporte" delay={0.15}>
        <AdvancedField
          fieldKey="supportWebUrl"
          label="Sitio web de soporte"
          description="Enlace de ayuda que aparece en la app"
          placeholder="https://soporte.mi-empresa.com"
          type="url"
        />
        <AdvancedField
          fieldKey="supportCenterPhone"
          label="Teléfono del centro de soporte"
          description="Número al que el mensajero llama para consultas o problemas generales"
          placeholder="+506 0000-0000"
          type="tel"
        />
        <AdvancedField
          fieldKey="emergencyPhone"
          label="Teléfono de emergencias"
          description="Número de contacto urgente cuando el mensajero está en ruta (accidente, incidente de seguridad)"
          placeholder="+506 0000-0000"
          type="tel"
        />
      </SectionCard>
    </div>
  )
}
