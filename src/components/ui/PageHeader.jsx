import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
      style={{ marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        {Icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(232,23,93,0.1)',
            border: '1px solid rgba(232,23,93,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color="#E8175D" />
          </div>
        )}
        <h1 style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.95)',
          fontFamily: 'Sora, sans-serif',
          letterSpacing: '-0.6px',
        }}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Space Mono, monospace',
          lineHeight: 1.6,
          paddingLeft: Icon ? 52 : 0,
        }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
