import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Globe2, Users, Check, X, ChevronRight,
  MapPin, Shield, Crown, Search, ToggleLeft, ToggleRight,
  Calendar, AlertCircle,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useUserRole } from '../hooks/useUserRole'
import { useTenantStore } from '../store/useTenantStore'
import { useTenantManager } from '../hooks/useTenantManager'
import PageHeader from '../components/ui/PageHeader'
import FlagImage from '../components/ui/FlagImage'

const SERVER_URL = import.meta.env.VITE_TENANT_API_URL ?? 'http://localhost:3001'

const STATUS_CFG = {
  active: { label: 'Activo',   color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  draft:  { label: 'Borrador', color: 'rgba(255,180,0,0.85)', bg: 'rgba(255,180,0,0.08)', border: 'rgba(255,180,0,0.2)' },
  inactive: { label: 'Inactivo', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
}

const LEVEL_CFG = {
  10: { label: 'Super Admin', color: '#E8175D', icon: Crown },
  11: { label: 'Admin País',  color: '#63B3ED', icon: MapPin },
}

export default function SystemTenantsPage() {
  const { isSystem } = useUserRole()
  const setSystemSimOpen = useTenantStore(s => s.setSystemSimOpen)
  const systemSimOpen    = useTenantStore(s => s.systemSimOpen)
  const { switchTenant, switching } = useTenantManager()

  const [tenants,       setTenants]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [selected,      setSelected]      = useState(null)
  const [previewCode,   setPreviewCode]   = useState(null)

  if (!isSystem) return <Navigate to="/" replace />

  async function handlePreviewCountry(tenantCode) {
    setPreviewCode(tenantCode)
    setSystemSimOpen(true)
    await switchTenant(tenantCode)
  }

  function handleClosePreview() {
    setPreviewCode(null)
    setSystemSimOpen(false)
  }

  useEffect(() => {
    apiFetch(`${SERVER_URL}/system/tenants`)
      .then(r => r.json())
      .then(d => setTenants(d.tenants ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(e, code) {
    e.stopPropagation()
    const prev = tenants
    setTenants(ts => ts.map(t => t.code === code ? { ...t, active: !t.active } : t))
    if (selected?.code === code) setSelected(s => ({ ...s, active: !s.active }))
    try {
      const res = await apiFetch(`${SERVER_URL}/system/tenants/${code}/toggle`, { method: 'PATCH' })
      const data = await res.json()
      setTenants(ts => ts.map(t => t.code === code ? { ...t, active: data.active } : t))
      if (selected?.code === code) setSelected(s => ({ ...s, active: data.active }))
    } catch {
      setTenants(prev)
    }
  }

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive     = tenants.filter(t => t.active).length
  const totalCountries  = tenants.reduce((sum, t) => sum + (t.countries?.length ?? 0), 0)
  const totalAdmins     = tenants.reduce((sum, t) => sum + (t.admins?.length ?? 0), 0)

  const sel = selected ? tenants.find(t => t.code === selected.code) ?? selected : null

  return (
    <div>
      <PageHeader
        title="Tenants registrados"
        subtitle="Empresas operando en el sistema, sus países y administradores asignados."
        icon={Building2}
      />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tenants activos',  value: loading ? '…' : totalActive,    color: '#10B981' },
          { label: 'Total de tenants', value: loading ? '…' : tenants.length,  color: 'rgba(255,255,255,0.7)' },
          { label: 'Países en total',  value: loading ? '…' : totalCountries,  color: '#63B3ED' },
          { label: 'Admins asignados', value: loading ? '…' : totalAdmins,     color: '#E8175D' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '8px 14px', borderRadius: 9,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: 'Sora' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Layout dos paneles */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

        {/* Panel izquierdo — lista */}
        <div style={{
          width: 290, flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {/* Búsqueda */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={11} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tenant…"
                style={{
                  width: '100%', padding: '7px 10px 7px 28px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 7, color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Sora', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
                Cargando…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono' }}>
                Sin resultados
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map(t => {
                  const isSel = sel?.code === t.code
                  const countryCount = t.countries?.length ?? 0
                  const activeCountries = (t.countries ?? []).filter(c => c.status === 'active').length
                  return (
                    <motion.button
                      key={t.code}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelected(t)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                        background: isSel ? 'rgba(232,23,93,0.07)' : 'transparent',
                        border: 'none',
                        borderLeft: isSel ? '3px solid #E8175D' : '3px solid transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Avatar inicial */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: t.active ? 'rgba(232,23,93,0.15)' : 'rgba(255,255,255,0.05)',
                        border: t.active ? '1px solid rgba(232,23,93,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: t.active ? '#E8175D' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'Sora',
                      }}>
                        {t.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 700, fontFamily: 'Sora',
                          color: t.active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.35)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'Space Mono', marginTop: 1 }}>
                          {t.code} · {activeCountries}/{countryCount} países
                        </div>
                      </div>

                      {/* Toggle activo */}
                      <button
                        onClick={e => handleToggle(e, t.code)}
                        title={t.active ? 'Desactivar tenant' : 'Activar tenant'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                      >
                        {t.active
                          ? <ToggleRight size={18} color="#10B981" />
                          : <ToggleLeft  size={18} color="rgba(255,255,255,0.2)" />
                        }
                      </button>

                      {isSel && <ChevronRight size={11} color="#E8175D" style={{ flexShrink: 0 }} />}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Panel derecho — detalle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {!sel ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  padding: '52px 24px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}
              >
                <Building2 size={28} color="rgba(255,255,255,0.1)" />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontFamily: 'Sora' }}>
                  Selecciona un tenant
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'Space Mono' }}>
                  Ver sus países y administradores
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={sel.code}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Banner preview activa */}
                {systemSimOpen && previewCode === sel.code && (
                  <div style={{
                    padding: '9px 14px', borderRadius: 10,
                    background: 'rgba(232,23,93,0.08)', border: '1px solid rgba(232,23,93,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8175D', boxShadow: '0 0 6px rgba(232,23,93,0.7)', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora', fontWeight: 600 }}>
                      Preview activa — mostrando config de este tenant en el simulador
                    </span>
                    <button
                      onClick={handleClosePreview}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Sora',
                      }}
                    >
                      <X size={10} /> Cerrar preview
                    </button>
                  </div>
                )}

                {/* Header tenant */}
                <div style={{
                  padding: '18px 20px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                    background: sel.active ? 'rgba(232,23,93,0.12)' : 'rgba(255,255,255,0.05)',
                    border: sel.active ? '1px solid rgba(232,23,93,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, color: sel.active ? '#E8175D' : 'rgba(255,255,255,0.2)',
                    fontFamily: 'Sora',
                  }}>
                    {sel.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.92)', fontFamily: 'Sora' }}>
                        {sel.name}
                      </span>
                      <span style={{
                        fontSize: 8, padding: '2px 7px', borderRadius: 4, fontFamily: 'Space Mono', fontWeight: 700,
                        background: sel.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                        border: sel.active ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        color: sel.active ? '#10B981' : 'rgba(255,255,255,0.3)',
                      }}>
                        {sel.active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                      {sel.code}
                      {sel.created_at && (
                        <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.2)' }}>
                          · registrado {new Date(sel.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => handleToggle(e, sel.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
                      background: sel.active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                      border: sel.active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                      color: sel.active ? 'rgba(239,68,68,0.8)' : '#10B981',
                      fontSize: 11, fontFamily: 'Sora', fontWeight: 600,
                    }}
                  >
                    {sel.active ? <><X size={12} /> Desactivar</> : <><Check size={12} /> Activar</>}
                  </button>
                </div>

                {/* Países */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Globe2 size={13} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
                      Países donde opera
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono',
                    }}>
                      {(sel.countries ?? []).length} país{(sel.countries ?? []).length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  {(sel.countries ?? []).length === 0 ? (
                    <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                      <AlertCircle size={18} color="rgba(255,255,255,0.1)" style={{ marginBottom: 7 }} />
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Sora' }}>
                        Sin países configurados
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(sel.countries ?? [])
                        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                        .map(c => {
                          const st = STATUS_CFG[c.status] ?? STATUS_CFG.inactive
                          const isPreviewing = systemSimOpen && previewCode === sel.code
                          return (
                            <button
                              key={c.iso_2}
                              onClick={() => isPreviewing ? handleClosePreview() : handlePreviewCountry(sel.code)}
                              title={isPreviewing ? 'Cerrar preview' : 'Ver preview de la app para este país'}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                                background: isPreviewing
                                  ? 'rgba(232,23,93,0.1)'
                                  : c.is_primary ? 'rgba(232,23,93,0.07)' : 'rgba(255,255,255,0.03)',
                                border: isPreviewing
                                  ? '1px solid rgba(232,23,93,0.35)'
                                  : c.is_primary ? '1px solid rgba(232,23,93,0.2)' : '1px solid rgba(255,255,255,0.07)',
                                minWidth: 150, textAlign: 'left',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { if (!isPreviewing) e.currentTarget.style.borderColor = 'rgba(232,23,93,0.3)' }}
                              onMouseLeave={e => { if (!isPreviewing) e.currentTarget.style.borderColor = c.is_primary ? 'rgba(232,23,93,0.2)' : 'rgba(255,255,255,0.07)' }}
                            >
                              <div style={{ width: 24, height: 17, borderRadius: 3, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <FlagImage code={c.iso_2} size={24} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
                                    {c.name}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: 8, color: st.color, fontFamily: 'Space Mono' }}>{st.label}</span>
                                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono' }}>· {c.iso_2}</span>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* Administradores */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Users size={13} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
                      Administradores asignados
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono',
                    }}>
                      {(sel.admins ?? []).length}
                    </span>
                  </div>

                  {(sel.admins ?? []).length === 0 ? (
                    <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                      <Shield size={18} color="rgba(255,255,255,0.1)" style={{ marginBottom: 7 }} />
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Sora' }}>
                        Sin administradores asignados
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {(sel.admins ?? []).map(a => {
                        const lvl = LEVEL_CFG[a.level] ?? LEVEL_CFG[10]
                        const LvlIcon = lvl.icon
                        return (
                          <div key={a.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', borderRadius: 9,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                              background: `${lvl.color}18`, border: `1px solid ${lvl.color}33`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: lvl.color, fontFamily: 'Sora',
                            }}>
                              {(a.username || a.email)[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
                                {a.username}
                              </div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {a.email}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <LvlIcon size={10} color={lvl.color} />
                              <span style={{ fontSize: 9, color: lvl.color, fontFamily: 'Space Mono', fontWeight: 700 }}>
                                L{a.level}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
