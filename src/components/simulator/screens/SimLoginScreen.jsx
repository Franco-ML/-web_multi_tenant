import { useState } from 'react'
import { useSimulatorConfig } from '../../../context/SimulatorContext'

export default function SimLoginScreen() {
  const { branding, i18n, login } = useSimulatorConfig()
  const initial    = (branding.name || 'M')[0].toUpperCase()
  const showPhone  = login?.phoneEnabled ?? true
  const showEmail  = login?.emailEnabled ?? true
  const both       = showPhone && showEmail
  const showPin    = login?.pinRequired ?? true
  const [tab, setTab] = useState('phone')  // solo importa cuando both === true

  const placeholder = both
    ? (tab === 'phone' ? 'Número de teléfono' : 'correo@ejemplo.com')
    : showPhone ? 'Número de teléfono' : 'correo@ejemplo.com'

  return (
    <div className="sim-app" style={{ justifyContent: 'flex-start' }}>
      <div style={{ height: 50 }} />

      {/* Logo */}
      <div className="sim-logo">
        {branding.logoPreviewUrl ? (
          <img
            src={branding.logoPreviewUrl}
            alt="logo"
            style={{ objectFit: 'cover', objectPosition: branding.logoPosition ?? '50% 50%' }}
          />
        ) : (
          <div className="sim-logo-placeholder">{initial}</div>
        )}
      </div>

      {/* Nombre empresa */}
      <div style={{ textAlign: 'center', padding: '4px 20px 16px' }}>
        <div style={{
          fontSize: 14, fontWeight: 800,
          color: 'var(--sim-text-primary)',
          letterSpacing: '-0.5px', transition: 'color 0.3s ease',
        }}>
          {branding.name}
        </div>
        <div style={{ fontSize: 9, color: 'var(--sim-text-secondary)', marginTop: 2, transition: 'color 0.3s ease' }}>
          {i18n.loginSubtitle}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>

        {/* Tab switcher — solo cuando ambos están activos */}
        {both && (
          <div style={{
            display: 'flex', borderRadius: 7, overflow: 'hidden',
            border: '1px solid var(--sim-border)',
            marginBottom: 2,
          }}>
            {[['phone', 'Teléfono'], ['email', 'Correo']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '5px 0', border: 'none', cursor: 'pointer',
                  fontSize: 8, fontWeight: 600,
                  background: tab === key ? 'var(--sim-primary)' : 'transparent',
                  color: tab === key ? '#fff' : 'var(--sim-text-secondary)',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Un solo input */}
        {(showPhone || showEmail) && (
          <input className="sim-input" placeholder={placeholder} readOnly />
        )}

        <div className="sim-btn-primary">{i18n.loginButton}</div>

        {/* Campo de PIN — solo si pinRequired */}
        {showPin && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {Array.from({ length: login?.pinLength ?? 4 }).map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--sim-border)',
                  border: '1px solid var(--sim-border)',
                }} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 4, fontSize: 7, color: 'var(--sim-text-secondary)' }}>
              PIN de seguridad
            </div>
          </div>
        )}
      </div>

      {both && (
        <>
          <div className="sim-divider" style={{ marginTop: 10 }}>o</div>
          <div style={{ padding: '0 14px' }}>
            <div style={{
              border: '1px solid var(--sim-border)', borderRadius: 8,
              padding: '7px 12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, transition: 'border-color 0.3s ease',
            }}>
              <GoogleIcon />
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--sim-text-primary)', transition: 'color 0.3s ease' }}>
                Continuar con Google
              </span>
            </div>
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 8, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease' }}>
        ¿Olvidaste tu cuenta?{' '}
        <span style={{ color: 'var(--sim-primary)', fontWeight: 600, transition: 'color 0.3s ease' }}>
          Recuperar
        </span>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
    </svg>
  )
}
