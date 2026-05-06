import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Users, UserPlus, Shield, Globe2, Trash2, RefreshCw, Eye, EyeOff, X, Info, Search, ChevronDown, Ban, Check } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useTenantStore } from '../store/useTenantStore'
import { useAuthStore } from '../store/useAuthStore'
import { useUserRole } from '../hooks/useUserRole'
import { apiFetch } from '../lib/api.js'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

const LEVEL_COLORS = {
  1:  { bg: 'rgba(232,23,93,0.12)',   border: 'rgba(232,23,93,0.3)',   text: 'rgba(232,23,93,0.9)' },
  2:  { bg: 'rgba(232,23,93,0.07)',   border: 'rgba(232,23,93,0.2)',   text: 'rgba(232,23,93,0.7)' },
  10: { bg: 'rgba(10,132,255,0.1)',   border: 'rgba(10,132,255,0.25)', text: 'rgba(10,132,255,0.9)' },
  11: { bg: 'rgba(52,199,89,0.08)',   border: 'rgba(52,199,89,0.2)',   text: 'rgba(52,199,89,0.8)' },
}

const LEVEL_DESCRIPTIONS = {
  1:  'Acceso total al sistema — gestiona todos los tenants y configuraciones globales.',
  2:  'Administración del sistema — acceso a todos los tenants, sin cambios de infraestructura.',
  10: 'Administra este tenant completo en todos sus países.',
  11: 'Gestiona únicamente el país asignado dentro de este tenant.',
}

function RolBadge({ level, name }) {
  const c = LEVEL_COLORS[level] ?? LEVEL_COLORS[11]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 9, fontWeight: 700, fontFamily: 'Space Mono',
      color: c.text, letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      <Shield size={8} color={c.text} />
      L{level} · {name}
    </span>
  )
}

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen]   = useState(false)
  const [rect,  setRect]  = useState(null)
  const triggerRef        = useRef(null)

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setRect(r)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    function handleScroll() { setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  const selected   = options.find(o => String(o.value) === String(value))
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 999
  const openUp     = rect && spaceBelow < 220 && rect.top > 220

  const dropdownStyle = rect ? {
    position: 'fixed',
    left:     rect.left,
    width:    rect.width,
    zIndex:   9999,
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + 4 }
      : { top: rect.bottom + 4 }
    ),
    background: '#0D1017',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    overflow: 'hidden auto',
    maxHeight: 220,
    boxShadow: '0 10px 36px rgba(0,0,0,0.8)',
  } : null

  return (
    <div ref={triggerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          ...inputStyle,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', textAlign: 'left',
          borderColor: open ? 'rgba(232,23,93,0.5)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ color: selected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Sora' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={12} color="rgba(255,255,255,0.3)"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }} />
      </button>

      {open && dropdownStyle && createPortal(
        <div style={dropdownStyle}>
          {options.map((o, i) => {
            const isSel = String(o.value) === String(value)
            return (
              <button
                key={o.value}
                type="button"
                onMouseDown={e => { e.preventDefault(); onChange(String(o.value)); setOpen(false) }}
                style={{
                  width: '100%', padding: '9px 12px', textAlign: 'left', cursor: 'pointer',
                  background: isSel ? 'rgba(232,23,93,0.1)' : 'transparent', border: 'none',
                  borderBottom: i < options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  color: isSel ? '#E8175D' : 'rgba(255,255,255,0.75)',
                  fontSize: 12, fontFamily: 'Sora',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                {o.label}
                {isSel && <Check size={11} color="#E8175D" />}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Modal crear usuario ────────────────────────────────────────────────────

function CreateUserModal({ roles, tenantCode, countryConfigs, isSystem, allTenants, onClose, onCreated }) {
  const [form, setForm]       = useState({ username: '', email: '', password: '', rolId: '', tenantCode: '', countryCode: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedRol        = roles.find(r => r.id === Number(form.rolId))
  const isTenantLevel      = selectedRol && selectedRol.level >= 10
  const needsCountry       = selectedRol && selectedRol.level === 11
  const effectiveTenantCode = isSystem ? form.tenantCode : tenantCode

  const tenantCountries = isSystem
    ? (allTenants.find(t => t.code === form.tenantCode)?.countries ?? [])
    : countryConfigs.map(c => ({ iso_2: c.countryCode, name: c.name ?? c.countryCode }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.rolId) { setError('Seleccioná un rol'); return }
    if (isSystem && isTenantLevel && !form.tenantCode) { setError('Seleccioná un tenant'); return }
    if (needsCountry && !form.countryCode) { setError('Seleccioná un país'); return }
    setError(null)
    setLoading(true)
    try {
      const body = {
        username:    form.username.trim(),
        email:       form.email.trim(),
        password:    form.password,
        rolId:       Number(form.rolId),
        tenantCode:  isTenantLevel ? effectiveTenantCode : undefined,
        countryCode: needsCountry  ? form.countryCode : undefined,
      }
      const res = await apiFetch(`${SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear usuario')
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: 440, background: '#0D1017',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={14} color="#E8175D" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora' }}>
              Crear usuario
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={12} color="rgba(255,255,255,0.4)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nombre de usuario *">
            <input
              autoFocus required value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="ej: juan.perez"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </Field>

          <Field label="Correo electrónico *">
            <input
              required type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="correo@empresa.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </Field>

          <Field label="Contraseña *">
            <div style={{ position: 'relative' }}>
              <input
                required value={form.password}
                type={showPwd ? 'text' : 'password'}
                onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ ...inputStyle, paddingRight: 36 }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                {showPwd
                  ? <EyeOff size={13} color="rgba(255,255,255,0.3)" />
                  : <Eye     size={13} color="rgba(255,255,255,0.3)" />}
              </button>
            </div>
          </Field>

          <Field label="Rol *">
            <CustomSelect
              value={form.rolId}
              onChange={v => { set('rolId', v); set('tenantCode', ''); set('countryCode', '') }}
              placeholder="Seleccionar rol…"
              options={roles.map(r => ({ value: String(r.id), label: `L${r.level} — ${r.name}` }))}
            />
          </Field>

          {selectedRol && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: (LEVEL_COLORS[selectedRol.level] ?? LEVEL_COLORS[11]).bg,
              border: `1px solid ${(LEVEL_COLORS[selectedRol.level] ?? LEVEL_COLORS[11]).border}`,
              fontSize: 10, fontFamily: 'Space Mono', lineHeight: 1.5,
              color: 'rgba(255,255,255,0.5)',
            }}>
              {LEVEL_DESCRIPTIONS[selectedRol.level]}
            </div>
          )}

          {isSystem && isTenantLevel && (
            <Field label="Tenant *">
              <CustomSelect
                value={form.tenantCode}
                onChange={v => { set('tenantCode', v); set('countryCode', '') }}
                placeholder="Seleccionar tenant…"
                options={allTenants.map(t => ({ value: t.code, label: t.name }))}
              />
            </Field>
          )}

          {needsCountry && tenantCountries.length > 0 && (!isSystem || form.tenantCode) && (
            <Field label="País asignado *">
              <CustomSelect
                value={form.countryCode}
                onChange={v => set('countryCode', v)}
                placeholder="Seleccionar país…"
                options={tenantCountries.map(c => ({ value: c.iso_2 ?? c.countryCode, label: c.name ?? c.iso_2 ?? c.countryCode }))}
              />
            </Field>
          )}

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)',
              fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(255,59,48,0.8)',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Sora',
              cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '10px', borderRadius: 10,
              background: loading ? 'rgba(232,23,93,0.4)' : '#E8175D',
              border: 'none', color: '#fff', fontSize: 12,
              fontFamily: 'Sora', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            }}>
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.85)', fontSize: 12,
  fontFamily: 'Sora', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
}

// ── Fila de usuario ────────────────────────────────────────────────────────

function UserRow({ user, onToggleActive, isOwnUser, currentUserLevel }) {
  const initial = (user.username || user.email || '?')[0].toUpperCase()
  const canAct  = !isOwnUser && (user.rol_level > currentUserLevel)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      opacity: user.active ? 1 : 0.45,
      transition: 'opacity 0.2s',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, rgba(232,23,93,0.4), rgba(232,23,93,0.15))`,
        border: '1px solid rgba(232,23,93,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: 'rgba(232,23,93,0.9)',
        fontFamily: 'Sora',
      }}>
        {initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora' }}>
            {user.username}
          </span>
          <RolBadge level={user.rol_level} name={user.rol_name} />
          {isOwnUser && (
            <span style={{
              padding: '2px 7px', borderRadius: 20,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.3)',
            }}>
              tú
            </span>
          )}
          {user.tenant_name && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px', borderRadius: 20,
              background: 'rgba(10,132,255,0.07)',
              border: '1px solid rgba(10,132,255,0.18)',
              fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(10,132,255,0.8)',
            }}>
              {user.tenant_name}
            </span>
          )}
          {user.country_name && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px', borderRadius: 20,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.4)',
            }}>
              <Globe2 size={7} />
              {user.country_name}
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
          {user.email}
        </div>
      </div>

      <button
        onClick={() => canAct && onToggleActive(user.id, !user.active)}
        disabled={!canAct}
        title={
          isOwnUser            ? 'No podés modificar tu propio usuario' :
          !canAct              ? 'Sin permisos para modificar este usuario' :
          user.active          ? 'Desactivar usuario' : 'Reactivar usuario'
        }
        style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: !canAct
            ? 'rgba(255,255,255,0.03)'
            : user.active
              ? 'rgba(255,59,48,0.07)'
              : 'rgba(52,199,89,0.07)',
          border: `1px solid ${!canAct ? 'rgba(255,255,255,0.06)' : user.active ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)'}`,
          cursor: !canAct ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          opacity: !canAct ? 0.3 : 1,
        }}
      >
        {!canAct
          ? <Ban size={11} color="rgba(255,255,255,0.3)" />
          : <Trash2 size={11} color={user.active ? 'rgba(255,59,48,0.7)' : 'rgba(52,199,89,0.7)'} />
        }
      </button>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

function RolesInfoPopover({ roles }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Ver descripción de niveles"
        style={{
          width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
          background: open ? 'rgba(232,23,93,0.1)' : 'transparent',
          border: `1px solid ${open ? 'rgba(232,23,93,0.3)' : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <Info size={13} color={open ? '#E8175D' : 'rgba(255,255,255,0.35)'} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, zIndex: 50,
          background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Niveles de acceso
          </div>
          <div style={{ padding: '8px 0' }}>
            {roles.map(r => {
              const c = LEVEL_COLORS[r.level] ?? LEVEL_COLORS[11]
              return (
                <div key={r.id} style={{ padding: '8px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Shield size={9} color={c.text} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.text, fontFamily: 'Space Mono' }}>
                      L{r.level} — {r.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
                    {LEVEL_DESCRIPTIONS[r.level]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  const tenantCode     = useTenantStore(s => s.advanced.tenantCode)
  const countryConfigs = useTenantStore(s => s.countryConfigs ?? [])
  const currentUser    = useAuthStore(s => s.user)
  const { isSystem }   = useUserRole()

  const [users,      setUsers]      = useState([])
  const [roles,      setRoles]      = useState([])
  const [allTenants, setAllTenants] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [search,     setSearch]     = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const usersUrl = isSystem
        ? `${SERVER_URL}/users?all=true`
        : `${SERVER_URL}/users${tenantCode ? `?tenantCode=${tenantCode}` : ''}`

      const reqs = [
        apiFetch(usersUrl),
        apiFetch(`${SERVER_URL}/users/roles`),
      ]
      if (isSystem) reqs.push(apiFetch(`${SERVER_URL}/system/tenants`))

      const responses = await Promise.all(reqs)
      const [u, r, t] = await Promise.all(responses.map(r => r.json()))

      if (!responses[0].ok) throw new Error(u.error ?? 'Error al cargar usuarios')
      setUsers(u)
      setRoles(r)
      if (isSystem && t?.tenants) setAllTenants(t.tenants)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tenantCode, isSystem])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleToggleActive(id, active) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active } : u))
    try {
      const res = await apiFetch(`${SERVER_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      if (!res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !active } : u))
      }
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !active } : u))
    }
  }

  const currentUserLevel = currentUser?.rol?.level ?? 99
  const creatableRoles   = roles.filter(r => r.level > currentUserLevel)

  const q = search.trim().toLowerCase()
  const filtered = users.filter(u =>
    !q ||
    u.username?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.country_name?.toLowerCase().includes(q)
  )
  const activeUsers   = filtered.filter(u => u.active)
  const inactiveUsers = filtered.filter(u => !u.active)

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Administrá los accesos al panel y a la app según nivel de permisos"
        icon={Users}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={12} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o país…"
            style={{
              width: '100%', padding: '8px 10px 8px 30px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 9, color: 'rgba(255,255,255,0.8)', fontSize: 11,
              fontFamily: 'Sora', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(232,23,93,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
        </div>

        <div style={{ flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
          {loading ? '' : `${activeUsers.length} activo${activeUsers.length !== 1 ? 's' : ''}${q ? ` · filtrado de ${users.filter(u => u.active).length}` : ''}`}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <RolesInfoPopover roles={roles} />
          <button onClick={fetchData} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={12} color="rgba(255,255,255,0.35)" />
          </button>
          <button onClick={() => setShowModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 9,
            background: '#E8175D', border: 'none',
            color: '#fff', fontSize: 11, fontFamily: 'Sora', fontWeight: 600,
            cursor: 'pointer',
          }}>
            <UserPlus size={12} />
            Crear usuario
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {error ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 11, color: 'rgba(255,59,48,0.7)', fontFamily: 'Space Mono' }}>
            {error}
          </div>
        ) : loading ? (
          <div style={{ padding: '24px 16px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                height: 52, borderRadius: 8, marginBottom: 8,
                background: 'rgba(255,255,255,0.03)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.12}s`,
              }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <Users size={28} color="rgba(255,255,255,0.1)" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'Sora' }}>
              Sin usuarios creados
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'Space Mono', marginTop: 4 }}>
              Creá el primer usuario con el botón de arriba
            </div>
          </div>
        ) : (
          <>
            {activeUsers.map(u => (
              <UserRow
                key={u.id}
                user={u}
                onToggleActive={handleToggleActive}
                isOwnUser={u.id === currentUser?.id}
                currentUserLevel={currentUserLevel}
              />
            ))}
            {inactiveUsers.length > 0 && (
              <>
                <div style={{
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'Space Mono', letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  Inactivos ({inactiveUsers.length})
                </div>
                {inactiveUsers.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onToggleActive={handleToggleActive}
                    isOwnUser={u.id === currentUser?.id}
                    currentUserLevel={currentUserLevel}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CreateUserModal
          roles={creatableRoles}
          tenantCode={tenantCode}
          countryConfigs={countryConfigs}
          isSystem={isSystem}
          allTenants={allTenants}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}
