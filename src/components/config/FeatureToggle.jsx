import { motion } from 'framer-motion'
import { useTenantStore } from '../../store/useTenantStore'

export default function FeatureToggle({ featureKey, label, description, icon }) {
  const value = useTenantStore((s) => s.features[featureKey])
  const setFeature = useTenantStore((s) => s.setFeature)
  const primaryColor = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: value ? `${primaryColor}15` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value ? `${primaryColor}25` : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
          fontFamily: 'Sora',
          letterSpacing: '-0.2px',
          transition: 'color 0.2s ease',
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'Space Mono',
            marginTop: 2,
            transition: 'color 0.2s ease',
          }}>
            {description}
          </div>
        )}
      </div>

      {/* Toggle switch */}
      <motion.button
        onClick={() => setFeature(featureKey, !value)}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          background: value ? primaryColor : 'rgba(255,255,255,0.1)',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.2s ease',
          boxShadow: value ? `0 0 12px ${primaryColor}44` : 'none',
        }}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
      </motion.button>
    </div>
  )
}
