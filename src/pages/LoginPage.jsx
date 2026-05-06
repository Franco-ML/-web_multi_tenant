import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTenantStore } from '../store/useTenantStore'
import AnimatedBackground from '../components/background/AnimatedBackground'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

export default function LoginPage() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore((s) => s.setUser)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res  = await fetch(`${SERVER_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Credenciales inválidas')
      setUser(data)
      // Si ya tiene tenant en BD → ya pasó el onboarding/setup en algún momento.
      // Marcar setup completo localmente para que los guards de páginas lo respeten.
      if ((data.tenants?.length ?? 0) > 0) {
        useTenantStore.getState().setAdvancedField('_setupComplete', true)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#080a0f', position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 380, position: 'relative', zIndex: 1,
          background: 'rgba(13,16,23,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Top accent */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #E8175D, #ff6b9d)',
        }} />

        <div style={{ padding: '36px 36px 32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #E8175D, #E8175Daa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px #E8175D44',
            }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: 'Sora', letterSpacing: '-0.4px' }}>
                Mensajeros Config
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                Panel de configuración
              </div>
            </div>
          </div>

          {/* Título */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: 'Sora', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Iniciar sesión
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
              Accedé con tu cuenta de administrador
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                autoFocus
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
                onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 42 }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
                  onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd
                    ? <EyeOff size={15} color="rgba(255,255,255,0.3)" />
                    : <Eye    size={15} color="rgba(255,255,255,0.3)" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '9px 13px', borderRadius: 8,
                  background: 'rgba(255,59,48,0.08)',
                  border: '1px solid rgba(255,59,48,0.2)',
                  fontSize: 11, fontFamily: 'Space Mono',
                  color: 'rgba(255,59,48,0.85)', lineHeight: 1.4,
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                marginTop: 6,
                width: '100%', padding: '13px',
                borderRadius: 11, border: 'none',
                background: loading ? 'rgba(232,23,93,0.4)' : '#E8175D',
                color: '#fff', fontSize: 14,
                fontFamily: 'Sora', fontWeight: 700,
                cursor: loading ? 'default' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(232,23,93,0.35)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 36px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono',
        }}>
          ¿Sin cuenta? Contactá al administrador del sistema.
        </div>
      </motion.div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: 9,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)', fontSize: 13,
  fontFamily: 'Sora', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
}
