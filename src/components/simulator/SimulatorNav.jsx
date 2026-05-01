import { useSimulatorStore } from '../../store/useSimulatorStore'
import { useSimulatorConfig } from '../../context/SimulatorContext'

export default function SimulatorNav() {
  const activeScreen = useSimulatorStore((s) => s.activeScreen)
  const setActiveScreen = useSimulatorStore((s) => s.setActiveScreen)
  const { i18n, features } = useSimulatorConfig()

  const tabs = [
    { id: 'home', label: i18n.tabLabelHome, Icon: HomeIcon },
    features.routesEnabled && { id: 'routes', label: i18n.tabLabelRoutes, Icon: MapIcon },
    features.profileEnabled && { id: 'profile', label: i18n.tabLabelProfile, Icon: UserIcon },
  ].filter(Boolean)

  return (
    <div className="sim-tab-bar">
      {tabs.map(({ id, label, Icon }) => (
        <div
          key={id}
          className={`sim-tab-item${activeScreen === id ? ' active' : ''}`}
          onClick={() => setActiveScreen(id)}
        >
          <Icon active={activeScreen === id} />
          <span className="sim-tab-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

function HomeIcon({ active }) {
  const color = active ? 'var(--sim-primary)' : 'var(--sim-text-secondary)'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s ease, fill 0.15s ease' }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function MapIcon({ active }) {
  const color = active ? 'var(--sim-primary)' : 'var(--sim-text-secondary)'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s ease' }}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  )
}

function UserIcon({ active }) {
  const color = active ? 'var(--sim-primary)' : 'var(--sim-text-secondary)'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s ease, fill 0.15s ease' }}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
