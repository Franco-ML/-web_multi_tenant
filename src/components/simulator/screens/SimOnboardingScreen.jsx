import { UserCheck, Award, Phone, Truck, AlertCircle, Clipboard, Shield, Star, Check } from 'lucide-react'
import { useSimulatorConfig } from '../../../context/SimulatorContext'

const STEP_ICON = {
  'user-check':   UserCheck,
  'award':        Award,
  'phone':        Phone,
  'truck':        Truck,
  'alert-circle': AlertCircle,
  'clipboard':    Clipboard,
  'shield':       Shield,
  'star':         Star,
}

export default function SimOnboardingScreen() {
  const { branding, features } = useSimulatorConfig()
  const steps = useSimulatorConfig().registration?.steps ?? []
  const activeSteps = steps.filter(s => s.enabled !== false)
  const completedCount = 0
  const totalCount = activeSteps.length
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0

  const initial = (branding.name || 'M')[0].toUpperCase()

  return (
    <div className="sim-app">
      {/* Status bar */}
      <div className="sim-status-bar">
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="16" width="4" height="6" rx="1"/><rect x="7" y="11" width="4" height="11" rx="1"/><rect x="13" y="6" width="4" height="16" rx="1"/><rect x="19" y="1" width="4" height="21" rx="1"/></svg>
        </div>
      </div>

      <div className="sim-screen-content" style={{ padding: '0 0 12px' }}>
        {/* Hero */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 14px 8px',
          gap: 4,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'var(--sim-primary)',
            opacity: 0.15,
            position: 'absolute',
          }} />
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            border: '2px solid var(--sim-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            transition: 'border-color 0.3s ease',
          }}>
            {branding.logoPreviewUrl ? (
              <img src={branding.logoPreviewUrl} alt="logo" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--sim-primary)', transition: 'color 0.3s ease' }}>
                {initial}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--sim-text-primary)', letterSpacing: '-0.4px', transition: 'color 0.3s ease' }}>
            Completa tu perfil
          </div>
          <div style={{ fontSize: 8, color: 'var(--sim-text-secondary)', textAlign: 'center', transition: 'color 0.3s ease' }}>
            Para comenzar, completa tu información
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          margin: '0 10px 8px',
          background: 'var(--sim-surface)',
          border: '1px solid var(--sim-border-light)',
          borderRadius: 8,
          padding: '7px 10px',
          transition: 'background 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 8, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease' }}>Progreso</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--sim-primary)', transition: 'color 0.3s ease' }}>
              {completedCount} de {totalCount}
            </span>
          </div>
          <div style={{
            height: 4,
            background: 'var(--sim-border-light)',
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'background 0.3s ease',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct * 100}%`,
              background: 'var(--sim-primary)',
              borderRadius: 2,
              transition: 'background 0.3s ease, width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Steps list */}
        <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {activeSteps.map((step, idx) => {
            const isDone = false
            const unlocked = idx === 0

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 8px',
                  background: 'var(--sim-surface)',
                  border: `1px solid ${isDone ? 'var(--sim-success)' : 'var(--sim-border-light)'}`,
                  borderRadius: 8,
                  opacity: unlocked ? 1 : 0.5,
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              >
                {/* Badge */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: isDone
                    ? 'var(--sim-success)'
                    : unlocked
                    ? 'rgba(232,23,93,0.12)'
                    : 'var(--sim-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  transition: 'background 0.3s ease',
                }}>
                  {isDone
                    ? <Check size={10} color="#fff" />
                    : (() => { const I = STEP_ICON[step.icon]; return I ? <I size={10} color={unlocked ? '#E8175D' : 'var(--sim-text-secondary)'} /> : <span style={{ fontSize: 8 }}>{idx + 1}</span> })()
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--sim-text-primary)',
                    letterSpacing: '-0.2px',
                    transition: 'color 0.3s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: 7.5,
                    color: 'var(--sim-text-secondary)',
                    marginTop: 1,
                    transition: 'color 0.3s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.subtitle}
                  </div>
                </div>

                {/* Field count */}
                <span style={{
                  fontSize: 7,
                  color: 'rgba(232,23,93,0.7)',
                  fontFamily: 'monospace',
                  background: 'rgba(232,23,93,0.08)',
                  padding: '1px 4px',
                  borderRadius: 3,
                  flexShrink: 0,
                  transition: 'color 0.3s ease',
                }}>
                  {step.fields.length}f
                </span>

                {/* Chevron */}
                <svg width="5" height="8" viewBox="0 0 5 8" fill="none" stroke="var(--sim-text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 1l3 3-3 3"/>
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
