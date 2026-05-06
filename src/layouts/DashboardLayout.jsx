import { useState, useCallback, useEffect } from 'react'
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle, Loader, X, Rocket, Check, Sun, Moon, CloudOff, Cloud, PanelRightClose, PanelRightOpen } from 'lucide-react'
import Sidebar from './Sidebar'
import PhoneSimulator from '../components/simulator/PhoneSimulator'
import AnimatedBackground from '../components/background/AnimatedBackground'
import OnboardingWizard from '../components/onboarding/OnboardingWizard'
import { useCssVariables } from '../hooks/useCssVariables'
import { useSaveToServer } from '../hooks/useSaveToServer'
import { useAutoSave } from '../hooks/useAutoSave'
import { useTenantStore } from '../store/useTenantStore'
import { useAuthStore } from '../store/useAuthStore'
import { useUserRole } from '../hooks/useUserRole'
import { useTenantManager } from '../hooks/useTenantManager'
import FlagImage from '../components/ui/FlagImage'

// ─── Modal de confirmación ─────────────────────────────────────────────────────

function SummaryRow({ label, value, accent }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
        {label}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: accent ?? 'rgba(255,255,255,0.85)',
        fontFamily: 'Sora, sans-serif',
        maxWidth: 220,
        textAlign: 'right',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  )
}

function ColorDot({ color }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 10, height: 10,
      borderRadius: '50%',
      background: color,
      border: '1px solid rgba(255,255,255,0.2)',
      marginRight: 5,
      verticalAlign: 'middle',
    }} />
  )
}

function PublishConfirmModal({ onConfirm, onCancel, busy }) {
  const { branding, countryConfigs: countries, theme, login, features, registration, i18n, advanced } = useTenantStore()

  const loginMethods = [
    login?.phoneEnabled && 'Teléfono',
    login?.emailEnabled && 'Correo',
  ].filter(Boolean).join(' + ')

  const enabledFeatures = Object.entries(features ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/Enabled$/, ''))
    .join(', ')

  const enabledSteps = registration.steps.filter(s => s.enabled !== false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#0f1117',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(232,23,93,0.15)',
              border: '1px solid rgba(232,23,93,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Rocket size={15} color="#E8175D" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Sora, sans-serif' }}>
                Confirmar publicación
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}>
                tenant · {advanced.tenantCode}
              </div>
            </div>
          </div>
          <button onClick={onCancel} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', padding: 4, display: 'flex',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Summary */}
        <div style={{ padding: '14px 20px', maxHeight: 380, overflowY: 'auto' }}>
          {/* Branding */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Identidad
          </div>
          <SummaryRow label="nombre" value={branding.name} />
          <SummaryRow
            label="color principal"
            value={
              <><ColorDot color={theme.light?.primary} />{theme.light?.primary}</>
            }
          />
          <SummaryRow label="logo" value={branding.logoUrl || branding.logoPreviewUrl
            ? <><Check size={9} style={{ verticalAlign: 'middle', marginRight: 3 }} />cargado</>
            : '— sin logo'} />

          {/* Países */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Países de operación
          </div>
          <SummaryRow label="total" value={`${countries?.length ?? 0} país${(countries?.length ?? 0) !== 1 ? 'es' : ''}`} />
          {(countries ?? []).map((c, i) => (
            <SummaryRow key={c.countryCode} label={i === 0 ? 'principal' : `país ${i + 1}`} value={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <FlagImage code={c.countryCode} size={18} fallback={c.flag} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                </div>
                {c.name ?? c.countryCode} · {c.currency}
              </span>
            } />
          ))}

          {/* Tema */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Tema
          </div>
          <SummaryRow label="modo" value={theme.colorMode === 'dark'
            ? <><Moon size={9} style={{ verticalAlign: 'middle', marginRight: 3 }} />oscuro</>
            : <><Sun size={9} style={{ verticalAlign: 'middle', marginRight: 3 }} />claro</>} />
          <SummaryRow label="tokens de color" value={`${Object.keys(theme.light ?? {}).length} definidos`} />

          {/* Login */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Login
          </div>
          <SummaryRow label="métodos" value={loginMethods || '— ninguno'} />

          {/* Módulos */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Módulos activos
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora, sans-serif', lineHeight: 1.6 }}>
            {enabledFeatures || '— ninguno'}
          </div>

          {/* Registro */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Pasos de registro
          </div>
          <SummaryRow label="habilitados" value={`${enabledSteps.length} de ${registration.steps.length}`} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {enabledSteps.map(s => (
              <span key={s.id} style={{
                padding: '2px 7px', borderRadius: 4,
                background: 'rgba(232,23,93,0.12)',
                border: '1px solid rgba(232,23,93,0.2)',
                fontSize: 9, color: '#E8175D',
                fontFamily: 'Space Mono, monospace',
              }}>
                {s.label}
              </span>
            ))}
          </div>

          {/* Idioma */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Idioma
          </div>
          <SummaryRow label="predeterminado" value={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <FlagImage code={i18n?.defaultLang ?? 'es'} type="lang" size={18} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
              </div>
              {i18n?.defaultLang === 'en' ? 'English' : i18n?.defaultLang === 'zh-CN' ? '中文' : 'Español'}
            </span>
          } />
          <SummaryRow label="idiomas configurados" value={`${Object.keys(i18n?.translations ?? {}).length} idiomas`} />
          <SummaryRow label="usuario puede cambiar" value={i18n?.userCanChange ? 'sí' : 'no'} />

          {/* Avanzado */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 6px' }}>
            Avanzado
          </div>
          <SummaryRow label="api" value={advanced.apiUrl} />
          <SummaryRow label="entorno" value={advanced.appEnv} accent={advanced.appEnv === 'prod' ? '#f59e0b' : '#34C759'} />
        </div>

        {/* Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          gap: 10,
        }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <motion.button
            onClick={onConfirm}
            disabled={busy}
            whileHover={!busy ? { scale: 1.02 } : {}}
            whileTap={!busy ? { scale: 0.98 } : {}}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
              background: busy ? '#9b1240' : '#E8175D',
              color: '#fff', cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              boxShadow: busy ? 'none' : '0 4px 18px rgba(232,23,93,0.35)',
              transition: 'background 0.2s',
            }}
          >
            {busy
              ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ display: 'flex' }}><Loader size={14} /></motion.span>Publicando…</>
              : <><Rocket size={14} />Publicar ahora</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Indicador de autosave ─────────────────────────────────────────────────────

function AutoSaveIndicator() {
  const { status, lastSaved, error } = useAutoSave()

  function timeAgo(date) {
    if (!date) return ''
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 5)   return 'ahora'
    if (diff < 60)  return `${diff}s`
    const m = Math.floor(diff / 60)
    if (m < 60)     return `${m}m`
    const h = Math.floor(m / 60)
    return `${h}h`
  }

  const config = {
    idle:    { Icon: Cloud,       color: 'rgba(255,255,255,0.3)',  label: lastSaved ? `guardado · ${timeAgo(lastSaved)}` : 'sin cambios' },
    saving:  { Icon: Loader,      color: 'rgba(255,255,255,0.5)',  label: 'guardando…',  spinning: true },
    saved:   { Icon: CheckCircle, color: 'rgba(52,199,89,0.85)',   label: lastSaved ? `guardado · ${timeAgo(lastSaved)}` : 'guardado' },
    error:   { Icon: AlertCircle, color: 'rgba(248,113,113,0.85)', label: error ?? 'error' },
    offline: { Icon: CloudOff,    color: 'rgba(255,180,0,0.85)',   label: 'sin servidor' },
  }
  const cfg = config[status] ?? config.idle
  const Icon = cfg.Icon

  return (
    <div
      title={error ?? cfg.label}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 9, color: cfg.color, fontFamily: 'Space Mono, monospace',
        letterSpacing: '0.04em',
        transition: 'color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {cfg.spinning ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          style={{ display: 'flex' }}
        >
          <Icon size={9} color={cfg.color} />
        </motion.span>
      ) : (
        <Icon size={9} color={cfg.color} />
      )}
      <span style={{ whiteSpace: 'nowrap' }}>{cfg.label}</span>
    </div>
  )
}

// ─── Botón Publicar ────────────────────────────────────────────────────────────

function PublishButton() {
  const { publish, status, lastSaved, error } = useSaveToServer()
  const [showModal, setShowModal] = useState(false)

  const configs = {
    idle:  { label: 'Publicar', icon: Upload,       bg: '#E8175D', shadow: 'rgba(232,23,93,0.35)' },
    saved: { label: 'Publicado', icon: CheckCircle,  bg: '#16a34a', shadow: 'rgba(22,163,74,0.4)' },
    error: { label: 'Error',     icon: AlertCircle,  bg: '#b91c1c', shadow: 'rgba(185,28,28,0.4)' },
  }

  const cfg = configs[status === 'saving' ? 'idle' : status] ?? configs.idle
  const Icon = cfg.icon
  const busy = status === 'saving'

  async function handleConfirm() {
    await publish()
    setShowModal(false)
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <motion.button
          onClick={() => setShowModal(true)}
          disabled={busy}
          whileHover={!busy ? { scale: 1.04 } : {}}
          whileTap={!busy ? { scale: 0.97 } : {}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 18px',
            borderRadius: 10,
            border: 'none',
            background: cfg.bg,
            color: '#fff',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 13,
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow: `0 4px 18px ${cfg.shadow}`,
            transition: 'background 0.25s, box-shadow 0.25s',
            letterSpacing: '0.02em',
          }}
        >
          <Icon size={14} />
          {cfg.label}
        </motion.button>

        <AnimatePresence mode="wait">
          {lastSaved && status !== 'error' && (
            <motion.span
              key="ts"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace' }}
            >
              {lastSaved.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </motion.span>
          )}
          {status === 'error' && error && (
            <motion.span
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: 10, color: '#f87171',
                fontFamily: 'Space Mono, monospace',
                maxWidth: 170, textAlign: 'center',
              }}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <PublishConfirmModal
            onConfirm={handleConfirm}
            onCancel={() => setShowModal(false)}
            busy={busy}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  useCssVariables()
  const location      = useLocation()
  const navigate      = useNavigate()
  const setupComplete   = useTenantStore((s) => s.advanced._setupComplete === true)
  const tenantCode      = useTenantStore((s) => s.advanced.tenantCode)
  const countryConfigs  = useTenantStore((s) => s.countryConfigs)
  const setActiveCountry = useTenantStore((s) => s.setActiveCountry)
  const systemSimOpen   = useTenantStore((s) => s.systemSimOpen)
  const user          = useAuthStore((s) => s.user)
  const { isSystem, isCountryAdmin, isSuperTenant, assignedCountries } = useUserRole()
  const { switchTenant } = useTenantManager()

  const showSim = !isSystem || systemSimOpen

  const [simOpen, setSimOpen] = useState(
    () => localStorage.getItem('sim-panel-open') !== 'false'
  )
  const toggleSim = useCallback(() => {
    setSimOpen(v => {
      localStorage.setItem('sim-panel-open', String(!v))
      return !v
    })
  }, [])

  // L10: si el store no tiene el tenant del usuario cargado, auto-switch al primero
  useEffect(() => {
    if (!isSuperTenant || !user) return
    const assignedCode = user.tenants?.[0]?.tenant_code
    if (!assignedCode) return
    // Si ya tiene tenant en la BD pero el flag local quedó en false (otro dispositivo,
    // localStorage limpio), marcarlo como completo para que no aparezca el wizard.
    if (!setupComplete) {
      useTenantStore.getState().setAdvancedField('_setupComplete', true)
    }
    if (tenantCode === assignedCode) return   // ya cargado
    switchTenant(assignedCode)
  }, [isSuperTenant, user?.id]) // eslint-disable-line

  // L11: fijar su país automáticamente y redirigir al detalle
  useEffect(() => {
    if (!isCountryAdmin || !setupComplete) return
    if (assignedCountries.length === 0) return
    const code = assignedCountries[0]
    const c = countryConfigs.find(x => x.countryCode === code)
    if (!c) return
    setActiveCountry(code)
    if (!location.pathname.startsWith(`/countries/${c.id}`)) {
      navigate(`/countries/${c.id}`, { replace: true })
    }
  }, [isCountryAdmin, setupComplete]) // eslint-disable-line

  // Guard: sin sesión → /login
  if (!user) return <Navigate to="/login" replace />

  // Wizard de primera configuración: se muestra cuando hay tenantCode pero no hay setup completo
  if (tenantCode && !setupComplete) {
    return <OnboardingWizard />
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#080a0f',
      position: 'relative',
    }}>
      <AnimatedBackground />
      <Sidebar />

      <main style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '32px 36px',
        position: 'relative',
        zIndex: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        {/* Sin AnimatePresence/mode="wait" — causa que las páginas queden en blanco
            tras navegar (StrictMode + key=pathname remonta el árbol). El `key` en
            el div mantiene la transición de aparición sin riesgo de unmount-loop. */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Simulator panel — colapsable; oculto para admins de sistema sin preview activa */}
      <div style={{ position: 'relative', flexShrink: 0, height: '100vh', display: showSim ? undefined : 'none' }}>

        {/* Lengüeta de toggle — siempre visible, sobresale hacia la izquierda */}
        <motion.button
          onClick={toggleSim}
          title={simOpen ? 'Ocultar preview' : 'Mostrar preview'}
          animate={{ left: simOpen ? -14 : -44 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            zIndex: 20, cursor: 'pointer',
            width: 44, height: 80,
            background: 'linear-gradient(135deg, #E8175D, #c0134d)',
            border: 'none',
            borderRadius: '10px 0 0 10px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '-4px 0 20px rgba(232,23,93,0.35)',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '-4px 0 28px rgba(232,23,93,0.55)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '-4px 0 20px rgba(232,23,93,0.35)'}
        >
          <motion.div animate={{ rotate: simOpen ? 0 : 180 }} transition={{ duration: 0.25 }}>
            {simOpen
              ? <PanelRightClose size={16} color="#fff" />
              : <PanelRightOpen  size={16} color="#fff" />}
          </motion.div>
          <span style={{
            fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Space Mono', letterSpacing: '0.06em', textTransform: 'uppercase',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          }}>
            Preview
          </span>
        </motion.button>

        {/* Panel */}
        <motion.aside
          animate={{ width: simOpen ? 360 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            height: '100vh',
            display: 'flex', flexDirection: 'column',
            background: 'rgba(13,16,23,0.8)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            flexShrink: 0, minWidth: 360,
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#E8175D', boxShadow: '0 0 8px rgba(232,23,93,0.6)',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Vista previa
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AutoSaveIndicator />
              <PublishButton />
            </div>
          </div>

          {/* Simulador */}
          <div style={{
            flex: 1, minWidth: 360,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 0',
          }}>
            <PhoneSimulator />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
