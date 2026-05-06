import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Building2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTenantStore } from '../store/useTenantStore'
import { useTenantManager } from '../hooks/useTenantManager'
import { apiFetch } from '../lib/api'
import AnimatedBackground from '../components/background/AnimatedBackground'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'
const FONT_SORA  = 'Sora, sans-serif'
const FONT_MONO  = '"Space Mono", monospace'
const ACCENT     = '#E8175D'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export default function OnboardingPage() {
  const navigate         = useNavigate()
  const user             = useAuthStore(s => s.user)
  const setupComplete    = useTenantStore(s => s.advanced._setupComplete)
  const { createTenant } = useTenantManager()

  const [companyName, setCompanyName] = useState('')
  const [tenantCode,  setTenantCode]  = useState('')
  const [codeEdited,  setCodeEdited]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => { if (setupComplete) navigate('/brand', { replace: true }) }, [setupComplete, navigate])
  useEffect(() => { if (!user)         navigate('/login', { replace: true }) }, [user, navigate])

  useEffect(() => {
    if (!codeEdited) setTenantCode(slugify(companyName))
  }, [companyName, codeEdited])

  async function handleStart(e) {
    e.preventDefault()
    const name = companyName.trim()
    const code = tenantCode.trim()
    if (!name || !code) return
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch(`${SERVER_URL}/users/init-tenant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      createTenant({ id: code, name })
      navigate('/setup', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#080a0f',
      position: 'relative', overflow: 'hidden',
    }}>
      <AnimatedBackground />

      {/* Panel izquierdo */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px 56px', width: '45%', minWidth: 360,
          position: 'relative', zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #E8175D, #E8175Daa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px #E8175D44',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontFamily: FONT_SORA, letterSpacing: '-0.3px' }}>
              Mensajeros Config
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_MONO }}>
              Panel de configuración
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
            padding: '5px 12px', borderRadius: 20,
            background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
          }}>
            <Sparkles size={11} color={ACCENT} />
            <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: ACCENT, letterSpacing: '0.06em' }}>
              PRIMERA VEZ
            </span>
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, fontFamily: FONT_SORA,
            color: 'rgba(255,255,255,0.95)', lineHeight: 1.15,
            letterSpacing: '-1px', marginBottom: 16,
          }}>
            Bienvenido,<br />
            <span style={{ color: ACCENT }}>{user?.username}</span>
          </h1>
          <p style={{ fontSize: 14, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 340 }}>
            Vas a crear y configurar la aplicación móvil de tu empresa. El proceso toma menos de 5 minutos.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { n: '01', label: 'Crear tu empresa' },
            { n: '02', label: 'Identidad de marca' },
            { n: '03', label: 'Colores y tema' },
            { n: '04', label: 'Funcionalidades' },
            { n: '05', label: 'Países y métodos de pago' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.2)', width: 20 }}>{s.n}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 11, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', position: 'relative', zIndex: 1, flexShrink: 0 }} />

      {/* Panel derecho — formulario */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px 56px', position: 'relative', zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.5px', marginBottom: 8 }}>
              Crea tu empresa
            </div>
            <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
              Estos datos identifican a tu empresa dentro del sistema.
            </div>
          </div>

          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Nombre de la empresa *</label>
              <input
                autoFocus required value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ej: Moover Logistics"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(232,23,93,0.5)' }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Identificador único (slug) *</label>
              <input
                required value={tenantCode}
                onChange={e => { setTenantCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setCodeEdited(true) }}
                placeholder="ej: moover-logistics"
                style={{ ...inputStyle, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: '0.03em' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(232,23,93,0.5)' }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
              <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.2)', marginTop: 5 }}>
                Solo letras minúsculas, números y guiones. No se puede cambiar después.
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Building2 size={13} color={ACCENT} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: FONT_SORA, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                  Super Admin Tenant
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 13px', borderRadius: 8,
                background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)',
                fontSize: 11, fontFamily: FONT_MONO, color: 'rgba(255,59,48,0.85)',
              }}>
                <AlertCircle size={12} /> {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !companyName.trim() || !tenantCode.trim()}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px', borderRadius: 12, border: 'none',
                background: (!companyName.trim() || !tenantCode.trim()) ? 'rgba(232,23,93,0.3)' : ACCENT,
                color: '#fff', fontSize: 14, fontFamily: FONT_SORA, fontWeight: 700,
                cursor: (!companyName.trim() || !tenantCode.trim() || loading) ? 'default' : 'pointer',
                boxShadow: (companyName.trim() && tenantCode.trim()) ? '0 4px 20px rgba(232,23,93,0.35)' : 'none',
                transition: 'all 0.2s', marginTop: 4,
              }}
            >
              {loading ? 'Creando empresa…' : 'Comenzar configuración'}
              {!loading && <ArrowRight size={16} />}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 9, fontWeight: 700,
  fontFamily: '"Space Mono", monospace', color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7,
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)', fontSize: 14,
  fontFamily: 'Sora, sans-serif', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}
