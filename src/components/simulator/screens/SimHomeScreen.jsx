import { Bike, MapPin, Camera, Check, AlertTriangle } from 'lucide-react'
import { useSimulatorConfig } from '../../../context/SimulatorContext'

export default function SimHomeScreen() {
  const { branding, i18n, features } = useSimulatorConfig()

  return (
    <div className="sim-app">
      {/* Status bar */}
      <div className="sim-status-bar">
        <span>9:41</span>
        <div className="sim-status-icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* Header */}
      <div className="sim-header">
        <span className="sim-header-title">{i18n.homeTitle}</span>
        <div className="sim-header-signal">
          <span style={{ height: 4 }} />
          <span style={{ height: 6 }} />
          <span style={{ height: 9 }} />
          <span style={{ height: 12 }} />
        </div>
      </div>

      <div className="sim-screen-content">
        {/* Vehicle card */}
        <div className="sim-vehicle-card">
          <div style={{ fontSize: 8, fontWeight: 600, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Vehículo activo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bike size={18} color="white" />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>Honda CB 150</div>
              <div style={{ fontSize: 8, opacity: 0.8, color: '#fff' }}>ABC-1234 · Activo</div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="sim-card">
          <div className="sim-card-title">Permisos del sistema</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PermissionRow icon={MapPin} label="Ubicación" status="success" />
            <PermissionRow icon={Camera} label="Cámara" status="warning" />
          </div>
        </div>

        {/* Routes */}
        {features.routesEnabled && (
          <>
            <div className="sim-section-label">Rutas de hoy</div>
            <RouteCard
              title="Amazon Prime"
              stops={8}
              packages={12}
              status="En progreso"
              statusType="warning"
            />
            <RouteCard
              title="Walmart Express"
              stops={5}
              packages={7}
              status="Pendiente"
              statusType="error"
            />
          </>
        )}

        <div style={{ height: 16 }} />
      </div>

      {/* Swipe to start */}
      {features.routesEnabled && (
        <div className="sim-swipe-btn">
          <span className="sim-swipe-btn-text">{i18n.swipeToStart}</span>
        </div>
      )}
    </div>
  )
}

function PermissionRow({ icon: Icon, label, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9 }}>
        <Icon size={9} color="var(--sim-text-secondary)" />
        <span style={{ color: 'var(--sim-text-primary)', transition: 'color 0.3s ease' }}>{label}</span>
      </div>
      <span className={`sim-badge ${status}`} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {status === 'success'
          ? <><Check size={7} />OK</>
          : <><AlertTriangle size={7} />Revisar</>}
      </span>
    </div>
  )
}

function RouteCard({ title, stops, packages, status, statusType }) {
  return (
    <div className="sim-route-card">
      <div className="sim-route-header">
        <RouteIcon />
        <span className="sim-route-header-text">{title}</span>
        <span className={`sim-badge ${statusType}`} style={{ marginLeft: 'auto', fontSize: 7 }}>
          {status}
        </span>
      </div>
      <div style={{ padding: '5px 10px 6px', fontSize: 9, color: 'var(--sim-text-secondary)', transition: 'color 0.3s ease' }}>
        Calle 45 # 12-34, Bogotá
      </div>
      <div className="sim-route-stats">
        <div className="sim-route-stat">
          <div className="sim-route-stat-value">{stops}</div>
          <div className="sim-route-stat-label">Paradas</div>
        </div>
        <div className="sim-route-stat">
          <div className="sim-route-stat-value">{packages}</div>
          <div className="sim-route-stat-label">Paquetes</div>
        </div>
        <div className="sim-route-stat">
          <div className="sim-route-stat-value" style={{ color: 'var(--sim-warning)', transition: 'color 0.3s ease' }}>
            {statusType === 'warning' ? '65%' : '0%'}
          </div>
          <div className="sim-route-stat-label">Completado</div>
        </div>
      </div>
    </div>
  )
}

const RouteIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
  </svg>
)

const SignalIcon = () => (
  <svg width="10" height="8" viewBox="0 0 24 24" fill="currentColor">
    <rect x="1" y="16" width="4" height="6" rx="1"/>
    <rect x="7" y="11" width="4" height="11" rx="1"/>
    <rect x="13" y="6" width="4" height="16" rx="1"/>
    <rect x="19" y="1" width="4" height="21" rx="1"/>
  </svg>
)

const WifiIcon = () => (
  <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12.55a11 11 0 0114.08 0"/>
    <path d="M1.42 9a16 16 0 0121.16 0"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
)

const BatteryIcon = () => (
  <svg width="14" height="8" viewBox="0 0 24 12">
    <rect x="1" y="1" width="18" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="19" y="4" width="4" height="4" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="2.5" y="2.5" width="12" height="7" rx="1" fill="currentColor"/>
  </svg>
)
