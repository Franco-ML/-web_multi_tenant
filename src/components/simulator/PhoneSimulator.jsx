import { useMouseTilt } from '../../hooks/useMouseTilt'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { SimulatorConfigProvider } from '../../context/SimulatorContext'
import PhoneFrame from './PhoneFrame'
import PhoneScreen from './PhoneScreen'

const SCREENS = [
  { id: 'login',      label: 'Login' },
  { id: 'home',       label: 'Inicio' },
  { id: 'routes',     label: 'Rutas' },
  { id: 'onboarding', label: 'Registro' },
  { id: 'profile',    label: 'Perfil' },
]

export default function PhoneSimulator() {
  const { containerRef, transform, handlers } = useMouseTilt({ maxTiltX: 15, maxTiltY: 10 })
  const activeScreen = useSimulatorStore((s) => s.activeScreen)
  const setActiveScreen = useSimulatorStore((s) => s.setActiveScreen)

  return (
    <SimulatorConfigProvider>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Screen selector */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(255,255,255,0.04)',
          padding: '4px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {SCREENS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveScreen(id)}
              style={{
                padding: '5px 10px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Sora, sans-serif',
                transition: 'all 0.2s ease',
                background: activeScreen === id
                  ? 'rgba(232, 23, 93, 0.9)'
                  : 'transparent',
                color: activeScreen === id ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Phone wrapper with 3D perspective */}
        <div
          ref={containerRef}
          {...handlers}
          style={{
            perspective: '1000px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `
                perspective(1000px)
                rotateX(${transform.rotateX}deg)
                rotateY(${transform.rotateY}deg)
                translateZ(20px)
                translateY(${transform.translateY}px)
              `,
              transition: transform.isHovered ? 'none' : 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(232, 23, 93, 0.15))',
            }}
          >
            <PhoneFrame>
              <PhoneScreen />
            </PhoneFrame>
          </div>

          {/* Glow shadow beneath */}
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: `translateX(-50%) rotateX(${transform.rotateX * 0.5}deg)`,
              width: 200,
              height: 30,
              background: 'radial-gradient(ellipse, rgba(232,23,93,0.25) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
              transition: 'all 0.1s ease-out',
            }}
          />
        </div>

        {/* Live indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'Space Mono, monospace',
          letterSpacing: '0.05em',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#34C759',
            boxShadow: '0 0 8px #34C759',
            animation: 'pulse 2s infinite',
          }} />
          vista previa en vivo
        </div>
      </div>
    </SimulatorConfigProvider>
  )
}
