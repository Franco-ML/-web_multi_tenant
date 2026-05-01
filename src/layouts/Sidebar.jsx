import { useRef, useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, Settings, Languages,
  FileJson, Package, ChevronRight, Zap, Globe, LayoutGrid,
  ChevronDown, Plus, Check, Loader,
} from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import { useTenantManager } from '../hooks/useTenantManager'
import FlagImage from '../components/ui/FlagImage'

const BASE_NAV_ITEMS = [
  { to: '/branding',  label: 'Identidad',    desc: 'Logo y nombre',         Icon: Package },
  { to: '/theme',     label: 'Tema visual',  desc: 'Colores y modo',        Icon: Palette },
  { to: '/modules',   label: 'Módulos',      desc: 'Pantallas y funciones', Icon: LayoutGrid },
  { to: '/language',  label: 'Idiomas',      desc: 'Idioma predeterminado', Icon: Languages },
  { to: '/advanced',  label: 'Avanzado',     desc: 'API y credenciales',    Icon: Settings },
  { to: '/export',    label: 'Exportar',     desc: 'JSON del tenant',       Icon: FileJson },
]

const COUNTRY_NAV_ITEMS = [
  { to: '/locale',    label: 'Localización', desc: 'País y moneda',         Icon: Globe },
]

function TenantSwitcher({ primaryColor }) {
  const navigate = useNavigate()
  const companyName = useTenantStore((s) => s.branding.name)
  const activeTenantCode = useTenantStore((s) => s.advanced.tenantCode)
  const { tenants, switching, fetchTenants, switchTenant, createTenant, forkTenant } = useTenantManager()

  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [originCountry, setOriginCountry] = useState('')
  const [forkFrom, setForkFrom] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const dropdownRef = useRef(null)

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setShowCreate(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleOpen() {
    fetchTenants()
    setOpen(v => !v)
    setShowCreate(false)
    setNewId('')
    setNewName('')
    setOriginCountry('')
    setForkFrom('')
    setCountrySearch('')
  }

  async function handleSwitch(id) {
    if (id === activeTenantCode) { setOpen(false); return }
    await switchTenant(id)
    setOpen(false)
    navigate('/branding')
  }

  async function handleCreate() {
    if (!newId.trim() || !newName.trim() || !originCountry || idError) return
    if (forkFrom) {
      await forkTenant(forkFrom, { id: newId, name: newName })
    } else {
      createTenant({ id: newId, name: newName, countryCode: originCountry })
    }
    setOpen(false)
    setShowCreate(false)
    navigate('/setup')
  }

  const idError = newId && !/^[a-z0-9_-]+$/.test(newId)
  const filteredCountries = COUNTRY_CATALOG.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(countrySearch.toLowerCase())
  )

  return (
    <div ref={dropdownRef} style={{ position: 'relative', marginTop: 10 }}>
      {/* Pill botón */}
      <button
        onClick={handleOpen}
        style={{
          width: '100%',
          padding: '6px 8px',
          background: `${primaryColor}18`,
          border: `1px solid ${primaryColor}30`,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {switching ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            style={{ display: 'flex', flexShrink: 0 }}
          >
            <Loader size={8} color={primaryColor} />
          </motion.span>
        ) : (
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: primaryColor,
            boxShadow: `0 0 6px ${primaryColor}`,
            flexShrink: 0,
            transition: 'background 0.3s ease',
          }} />
        )}
        <span style={{
          flex: 1,
          fontSize: 10,
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 500,
          fontFamily: 'Sora, sans-serif',
          letterSpacing: '-0.2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left',
        }}>
          {companyName}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexShrink: 0 }}
        >
          <ChevronDown size={10} color='rgba(255,255,255,0.35)' />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.94 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              transformOrigin: 'top',
            }}
          >
            {/* Lista de tenants */}
            {tenants.length > 0 && (
              <div style={{ padding: '4px 0' }}>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSwitch(t.id)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      background: t.id === activeTenantCode ? `${t.primaryColor}14` : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${t.primaryColor}1a`}
                    onMouseLeave={e => e.currentTarget.style.background = t.id === activeTenantCode ? `${t.primaryColor}14` : 'transparent'}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: `linear-gradient(135deg, ${t.primaryColor}, ${t.primaryColor}88)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', fontFamily: 'Sora, sans-serif' }}>
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                          fontFamily: 'Sora, sans-serif', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.name}
                        </div>
                        {t.isDraft && (
                          <span style={{
                            fontSize: 7, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                            color: 'rgba(255,180,0,0.7)', background: 'rgba(255,180,0,0.1)',
                            border: '1px solid rgba(255,180,0,0.2)', borderRadius: 3,
                            padding: '1px 4px', letterSpacing: '0.05em', flexShrink: 0,
                          }}>
                            LOCAL
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        {(t.countries ?? []).slice(0, 5).map(c => (
                          <div key={c.countryCode} style={{ width: 14, height: 10, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                            <FlagImage code={c.countryCode} size={14} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                          </div>
                        ))}
                        {(t.countries ?? []).length > 5 && (
                          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>+{t.countries.length - 5}</span>
                        )}
                      </div>
                    </div>
                    {t.id === activeTenantCode && <Check size={10} color={t.primaryColor} />}
                  </button>
                ))}
              </div>
            )}

            {tenants.length > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px' }} />
            )}

            {/* Nuevo tenant */}
            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  width: '100%', padding: '8px 10px', display: 'flex', alignItems: 'center',
                  gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                <Plus size={12} />
                <span style={{ fontSize: 11, fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>Nuevo tenant</span>
              </button>
            ) : (
              <div style={{ padding: '10px 10px 12px' }}>
                {/* Código */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>Código</div>
                  <input
                    autoFocus
                    value={newId}
                    onChange={e => setNewId(e.target.value.toLowerCase())}
                    placeholder="empresa-xyz"
                    style={{
                      width: '100%', padding: '5px 8px', boxSizing: 'border-box',
                      background: idError ? 'rgba(185,28,28,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${idError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 5, color: '#fff', fontSize: 11, fontFamily: 'Space Mono, monospace', outline: 'none',
                    }}
                  />
                  {idError && <div style={{ fontSize: 9, color: '#f87171', marginTop: 2, fontFamily: 'Space Mono, monospace' }}>Solo letras, números, guiones</div>}
                </div>

                {/* Nombre */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>Nombre</div>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Empresa XYZ"
                    style={{
                      width: '100%', padding: '5px 8px', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 5, color: '#fff', fontSize: 11, fontFamily: 'Sora, sans-serif', outline: 'none',
                    }}
                  />
                </div>

                {/* País de origen */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>
                    País de origen <span style={{ color: '#E8175D' }}>*</span>
                  </div>
                  {originCountry ? (
                    <button
                      onClick={() => setOriginCountry('')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                        padding: '5px 8px', background: 'rgba(232,23,93,0.1)',
                        border: '1px solid rgba(232,23,93,0.3)', borderRadius: 5, cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 20, height: 14, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <FlagImage code={originCountry} size={20} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora', flex: 1, textAlign: 'left' }}>
                        {COUNTRY_CATALOG.find(c => c.countryCode === originCountry)?.name}
                      </span>
                      <span style={{ fontSize: 8, color: 'rgba(232,23,93,0.7)', fontFamily: 'Space Mono' }}>cambiar</span>
                    </button>
                  ) : (
                    <div>
                      <input
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Buscar país..."
                        style={{
                          width: '100%', padding: '5px 8px', marginBottom: 4, boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 5, color: '#fff', fontSize: 10, fontFamily: 'Sora, sans-serif', outline: 'none',
                        }}
                      />
                      <div style={{ maxHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {filteredCountries.slice(0, 20).map(c => (
                          <button
                            key={c.countryCode}
                            onClick={() => { setOriginCountry(c.countryCode); setCountrySearch('') }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
                              background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ width: 18, height: 12, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                              <FlagImage code={c.countryCode} size={18} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'Sora' }}>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Copiar de (opcional) */}
                {tenants.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>
                      Copiar config de (opcional)
                    </div>
                    <select
                      value={forkFrom}
                      onChange={e => setForkFrom(e.target.value)}
                      style={{
                        width: '100%', padding: '5px 8px', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 5, color: forkFrom ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                        fontSize: 10, fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="" style={{ background: '#111318' }}>— config en blanco —</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id} style={{ background: '#111318' }}>{t.name} ({t.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    onClick={() => { setShowCreate(false); setNewId(''); setNewName(''); setOriginCountry(''); setForkFrom(''); setCountrySearch('') }}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                      fontSize: 10, fontFamily: 'Sora, sans-serif',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newId.trim() || !newName.trim() || !originCountry || !!idError}
                    style={{
                      flex: 2, padding: '5px 0', borderRadius: 5, border: 'none',
                      background: (!newId.trim() || !newName.trim() || !originCountry || idError) ? 'rgba(232,23,93,0.3)' : '#E8175D',
                      color: '#fff', cursor: (!newId.trim() || !newName.trim() || !originCountry || idError) ? 'not-allowed' : 'pointer',
                      fontSize: 10, fontWeight: 700, fontFamily: 'Sora, sans-serif', transition: 'background 0.2s',
                    }}
                  >
                    {forkFrom ? 'Copiar y crear' : 'Crear'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavGroup({ label, items, primaryColor }) {
  return (
    <div>
      <div style={{
        fontSize: 8,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.18)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        padding: '10px 10px 4px',
        fontFamily: 'Space Mono, monospace',
      }}>
        {label}
      </div>
      {items.map(({ to, label: itemLabel, desc, Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 8,
            marginBottom: 2,
            textDecoration: 'none',
            background: isActive ? `${primaryColor}18` : 'transparent',
            border: isActive ? `1px solid ${primaryColor}25` : '1px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: isActive ? `${primaryColor}22` : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                <Icon
                  size={14}
                  color={isActive ? primaryColor : 'rgba(255,255,255,0.35)'}
                  style={{ transition: 'color 0.2s ease' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
                  fontFamily: 'Sora, sans-serif',
                  letterSpacing: '-0.2px',
                  transition: 'color 0.2s ease',
                }}>
                  {itemLabel}
                </div>
                <div style={{
                  fontSize: 9,
                  color: isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
                  fontFamily: 'Space Mono, monospace',
                  transition: 'color 0.2s ease',
                }}>
                  {desc}
                </div>
              </div>
              {isActive && (
                <ChevronRight
                  size={12}
                  color={primaryColor}
                  style={{ flexShrink: 0, transition: 'color 0.2s ease' }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const primaryColor = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(13,16,23,0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Logo/Brand */}
      <div style={{
        padding: '28px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 16px ${primaryColor}44`,
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            flexShrink: 0,
          }}>
            <Zap size={14} color="#fff" />
          </div>
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.3px',
              fontFamily: 'Sora, sans-serif',
            }}>
              Admin
            </div>
            <div style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 1,
              fontFamily: 'Space Mono, monospace',
              letterSpacing: '0.05em',
            }}>
              Tenant Config
            </div>
          </div>
        </div>

        <TenantSwitcher primaryColor={primaryColor} />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <NavGroup label="Config base" items={BASE_NAV_ITEMS} primaryColor={primaryColor} />
        <NavGroup label="Por país" items={COUNTRY_NAV_ITEMS} primaryColor={primaryColor} />
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#34C759',
          boxShadow: '0 0 6px #34C759',
        }} />
        <span style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          fontFamily: 'Space Mono, monospace',
          letterSpacing: '0.04em',
        }}>
          moover-admin v0.1
        </span>
      </div>
    </aside>
  )
}
