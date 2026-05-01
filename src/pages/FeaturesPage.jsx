import { Layers, Map, User, FileText, PhoneCall, Camera, Moon, BarChart2, Bug } from 'lucide-react'
import SectionCard from '../components/config/SectionCard'
import FeatureToggle from '../components/config/FeatureToggle'
import PageHeader from '../components/ui/PageHeader'

const NAVIGATION_FEATURES = [
  { key: 'routesEnabled', label: 'Módulo de rutas', description: 'Tab de rutas en la navegación', icon: <Map size={16} /> },
  { key: 'profileEnabled', label: 'Módulo de perfil', description: 'Tab de perfil del mensajero', icon: <User size={16} /> },
]

const PROFILE_FEATURES = [
  { key: 'vehicleDocsEnabled', label: 'Documentos de vehículo', description: 'RTV, marchamo, póliza', icon: <FileText size={16} /> },
  { key: 'emergencyContactsEnabled', label: 'Contactos de emergencia', description: 'Gestión de contactos SOS', icon: <PhoneCall size={16} /> },
  { key: 'scanningEnabled', label: 'Escáner de documentos', description: 'Cámara para escanear docs', icon: <Camera size={16} /> },
  { key: 'darkModeToggleEnabled', label: 'Toggle modo oscuro', description: 'El mensajero puede cambiar el tema', icon: <Moon size={16} /> },
]

const INTEGRATIONS_FEATURES = [
  { key: 'googleMapsEnabled', label: 'Google Maps', description: 'Mapa integrado en detalle de ruta', icon: <Map size={16} /> },
  { key: 'analyticsEnabled', label: 'Analytics', description: 'Registro de eventos de uso', icon: <BarChart2 size={16} /> },
  { key: 'crashReportingEnabled', label: 'Crash Reporting', description: 'Envío de errores al panel', icon: <Bug size={16} /> },
]

export default function FeaturesPage() {
  return (
    <div>
      <PageHeader
        title="Módulos y funciones"
        subtitle="Activa o desactiva secciones de la app. Los cambios se reflejan en el simulador."
        icon={Layers}
      />

      <SectionCard title="Navegación" description="Controla qué tabs aparecen" icon={Layers} delay={0.05}>
        {NAVIGATION_FEATURES.map((f) => (
          <FeatureToggle key={f.key} featureKey={f.key} label={f.label} description={f.description} icon={f.icon} />
        ))}
      </SectionCard>

      <SectionCard title="Funciones del perfil" delay={0.1}>
        {PROFILE_FEATURES.map((f) => (
          <FeatureToggle key={f.key} featureKey={f.key} label={f.label} description={f.description} icon={f.icon} />
        ))}
      </SectionCard>

      <SectionCard title="Integraciones" delay={0.15}>
        {INTEGRATIONS_FEATURES.map((f) => (
          <FeatureToggle key={f.key} featureKey={f.key} label={f.label} description={f.description} icon={f.icon} />
        ))}
      </SectionCard>
    </div>
  )
}
