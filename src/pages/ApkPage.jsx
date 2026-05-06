import { Smartphone, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useTenantStore } from '../store/useTenantStore'

const STATUS = {
  none:    { icon: AlertCircle, color: 'rgba(255,255,255,0.2)',  label: 'Sin APK generada',    desc: 'Aún no se ha solicitado una compilación para este tenant.' },
  pending: { icon: Clock,       color: 'rgba(255,149,0,0.8)',    label: 'APK en proceso',       desc: 'La compilación está en cola. Esto puede tardar entre 10 y 30 minutos.' },
  ready:   { icon: CheckCircle, color: 'rgba(52,199,89,0.8)',    label: 'APK lista',            desc: 'La última versión compilada está disponible para descargar.' },
}

export default function ApkPage() {
  const tenantName = useTenantStore((s) => s.branding.name)
  const status = 'none'
  const { icon: StatusIcon, color: statusColor, label: statusLabel, desc: statusDesc } = STATUS[status]

  return (
    <div>
      <PageHeader
        title="App móvil"
        subtitle="Estado de compilación y descarga de la APK para este tenant"
        icon={Smartphone}
      />

      {/* Estado actual */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '28px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        marginBottom: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: `${statusColor}12`,
          border: `1px solid ${statusColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <StatusIcon size={28} color={statusColor} />
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora', letterSpacing: '-0.3px', marginBottom: 6 }}>
            {statusLabel}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', lineHeight: 1.6, maxWidth: 360 }}>
            {statusDesc}
          </div>
        </div>

        <button
          disabled
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.2)',
            fontSize: 12, fontFamily: 'Sora', fontWeight: 600, cursor: 'not-allowed',
          }}
        >
          <Download size={14} />
          Descargar APK
        </button>
      </div>

      {/* Info tenant */}
      {tenantName && (
        <div style={{
          display: 'flex', gap: 10, padding: '12px 14px',
          background: 'rgba(232,23,93,0.05)', border: '1px solid rgba(232,23,93,0.15)',
          borderRadius: 10, marginBottom: 16,
        }}>
          <Smartphone size={14} color="rgba(232,23,93,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
            La APK será compilada para <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{tenantName}</strong> con la configuración guardada actualmente.
          </div>
        </div>
      )}

      {/* Historial — placeholder */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Sora', letterSpacing: '-0.2px',
        }}>
          Historial de compilaciones
        </div>
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              height: 36, borderRadius: 8, marginBottom: 8,
              background: 'rgba(255,255,255,0.03)',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
          <div style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>
            Próximamente — historial de versiones compiladas
          </div>
        </div>
      </div>
    </div>
  )
}
