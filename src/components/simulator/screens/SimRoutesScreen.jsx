import { MapPin, StopCircle } from 'lucide-react'
import { useSimulatorConfig } from '../../../context/SimulatorContext'

export default function SimRoutesScreen() {
  const { i18n } = useSimulatorConfig()

  return (
    <div className="sim-app">
      <div className="sim-status-bar">
        <span>9:41</span>
        <div className="sim-status-icons" style={{ display: 'flex', gap: 3 }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="16" width="4" height="6" rx="1"/><rect x="7" y="11" width="4" height="11" rx="1"/><rect x="13" y="6" width="4" height="16" rx="1"/><rect x="19" y="1" width="4" height="21" rx="1"/></svg>
        </div>
      </div>

      <div className="sim-header">
        <span className="sim-header-title">{i18n.routesTitle}</span>
        <div style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: 'var(--sim-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.3s ease',
        }}>
          <MapIcon />
        </div>
      </div>

      <div className="sim-screen-content">
        {/* Stats summary */}
        <div className="sim-card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
          {[
            { value: '2', label: 'Rutas' },
            { value: '13', label: 'Paradas' },
            { value: '19', label: 'Paquetes' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 4px',
              borderRight: i < 2 ? '1px solid var(--sim-border-light)' : 'none',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--sim-primary)', transition: 'color 0.3s ease' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 7.5, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="sim-section-label">Rutas del día</div>

        <RouteListItem
          company="Amazon Prime"
          address="Calle 45 # 12-34"
          stops={8}
          status="En progreso"
          statusType="warning"
          time="8:00 AM"
        />
        <RouteListItem
          company="Walmart Express"
          address="Av. El Dorado # 68-11"
          stops={5}
          status="Pendiente"
          statusType="error"
          time="2:00 PM"
        />

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}

function RouteListItem({ company, address, stops, status, statusType, time }) {
  return (
    <div className="sim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="sim-route-header">
        <MapIcon />
        <span className="sim-route-header-text">{company}</span>
        <span style={{ marginLeft: 'auto', fontSize: 7.5, color: 'rgba(255,255,255,0.8)' }}>{time}</span>
      </div>
      <div style={{ padding: '6px 10px' }}>
        <div style={{ fontSize: 8.5, color: 'var(--sim-text-secondary)', marginBottom: 5, transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: 3 }}>
          <MapPin size={7} color="var(--sim-text-secondary)" style={{ flexShrink: 0 }} />{address}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 8, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: 3 }}>
              <StopCircle size={7} color="var(--sim-text-secondary)" style={{ flexShrink: 0 }} />{stops} paradas
            </span>
          </div>
          <span className={`sim-badge ${statusType}`}>{status}</span>
        </div>
      </div>
    </div>
  )
}

const MapIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
