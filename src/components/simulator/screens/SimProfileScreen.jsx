import { Bike, CreditCard, PhoneCall } from 'lucide-react'
import { useSimulatorConfig } from '../../../context/SimulatorContext'

export default function SimProfileScreen() {
  const { branding, i18n, features, registration } = useSimulatorConfig()
  const initial = (branding.name || 'M')[0].toUpperCase()
  const vehicleEnabled  = registration?.steps?.find(s => s.id === 'vehicle')?.enabled  !== false
  const emergencyEnabled = registration?.steps?.find(s => s.id === 'emergency')?.enabled !== false

  return (
    <div className="sim-app">
      <div className="sim-status-bar">
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="16" width="4" height="6" rx="1"/><rect x="7" y="11" width="4" height="11" rx="1"/><rect x="13" y="6" width="4" height="16" rx="1"/><rect x="19" y="1" width="4" height="21" rx="1"/></svg>
        </div>
      </div>

      <div className="sim-header">
        <span className="sim-header-title">{i18n.profileTitle}</span>
      </div>

      <div className="sim-screen-content">
        {/* Profile hero */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0 8px',
          borderBottom: '1px solid var(--sim-border-light)',
          marginBottom: 4,
          transition: 'border-color 0.3s ease',
        }}>
          <div className="sim-avatar" style={{ marginBottom: 5 }}>
            {initial}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sim-text-primary)', transition: 'color 0.3s ease' }}>
            Carlos Mensajero
          </div>
          <div style={{ fontSize: 8, color: 'var(--sim-text-secondary)', marginTop: 1, transition: 'color 0.3s ease' }}>
            ID: #00234 · {branding.name}
          </div>
        </div>

        <div className="sim-section-label">Documentos</div>
        <div className="sim-card" style={{ padding: 0 }}>
          <ListItem icon={CreditCard} label="Cédula" value="• • • • 4521" />
          <ListItem icon={CreditCard} label="Licencia" value="B1 · Vig. 2026" last />
        </div>

        {vehicleEnabled && (
          <>
            <div className="sim-section-label">Vehículos</div>
            <div className="sim-vehicle-card" style={{ padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bike size={16} color="white" />
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Honda CB 150</div>
                  <div style={{ fontSize: 7.5, opacity: 0.8, color: '#fff' }}>ABC-1234</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="sim-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 7 }}>
                    Activo
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {emergencyEnabled && (
          <>
            <div className="sim-section-label">Contacto de emergencia</div>
            <div className="sim-card" style={{ padding: 0 }}>
              <ListItem icon={PhoneCall} label="María García" value="Familiar" last />
            </div>
          </>
        )}

        {features.darkModeToggleEnabled && (
          <>
            <div className="sim-section-label">Preferencias</div>
            <div className="sim-card" style={{ padding: 0 }}>
              <div className="sim-list-item">
                <div className="sim-list-icon" style={{ background: 'rgba(88,86,214,0.1)' }}>
                  <MoonIcon />
                </div>
                <span style={{ flex: 1, fontSize: 9, color: 'var(--sim-text-primary)', transition: 'color 0.3s ease' }}>
                  Modo oscuro
                </span>
                <ToggleSwitch on={false} />
              </div>
            </div>
          </>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}

function ListItem({ icon: Icon, label, value, last }) {
  return (
    <div className="sim-list-item" style={last ? { borderBottom: 'none' } : {}}>
      <div className="sim-list-icon">
        <Icon size={11} color="var(--sim-text-secondary)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color: 'var(--sim-text-primary)', fontWeight: 600, transition: 'color 0.3s ease' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 8, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease' }}>
        {value}
      </div>
      <ChevronIcon />
    </div>
  )
}

function ToggleSwitch({ on }) {
  return (
    <div style={{
      width: 24,
      height: 14,
      borderRadius: 7,
      background: on ? 'var(--sim-primary)' : 'var(--sim-border)',
      position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        background: '#fff',
        position: 'absolute',
        top: 2,
        left: on ? 12 : 2,
        transition: 'left 0.2s ease',
      }} />
    </div>
  )
}

const ChevronIcon = () => (
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="var(--sim-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1l4 4-4 4"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--sim-info)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
