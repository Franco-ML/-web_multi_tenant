import { motion } from 'framer-motion'

export default function SectionCard({ title, description, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36, delay }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '20px 22px',
        marginBottom: 16,
      }}
    >
      {(title || description) && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {Icon && (
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(232,23,93,0.12)',
              border: '1px solid rgba(232,23,93,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={16} color="#E8175D" />
            </div>
          )}
          <div>
            {title && (
              <h3 style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'Sora, sans-serif',
                letterSpacing: '-0.3px',
              }}>
                {title}
              </h3>
            )}
            {description && (
              <p style={{
                margin: '3px 0 0',
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'Space Mono, monospace',
                lineHeight: 1.5,
              }}>
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  )
}
