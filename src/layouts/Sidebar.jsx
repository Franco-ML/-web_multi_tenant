import { useRef, useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, Settings, Languages,
  FileJson, Package, ChevronRight, Zap, Globe, Globe2, LayoutGrid,
  ChevronDown, Plus, Check, Loader, X, Layers, FileText, GitBranch,
} from 'lucide-react'
import { useTenantStore, COUNTRY_CATALOG } from '../store/useTenantStore'
import { useTenantManager } from '../hooks/useTenantManager'
import FlagImage from '../components/ui/FlagImage'

const NAV_ITEMS = [
  { to: '/branding',  label: 'Identidad',    desc: 'Logo y nombre',         Icon: Package },
  { to: '/theme',     label: 'Tema visual',  desc: 'Colores y modo',        Icon: Palette },
  { to: '/modules',   label: 'Módulos',      desc: 'Pantallas y funciones', Icon: LayoutGrid },
  { to: '/language',  label: 'Idiomas',      desc: 'Idioma predeterminado', Icon: Languages },
  { to: '/advanced',  label: 'Avanzado',     desc: 'API y credenciales',    Icon: Settings },
  { to: '/countries', label: 'Países',       desc: 'Herencias y estado',    Icon: Globe2,     requiresSetup: true },
  { to: '/documents',   label: 'Documentos',  desc: 'OCR por país',          Icon: FileText,   requiresSetup: true },
  { to: '/inheritance', label: 'Herencias',   desc: 'Módulos por país',      Icon: GitBranch,  requiresSetup: true },
  { to: '/export',    label: 'Exportar',     desc: 'JSON del tenant',       Icon: FileJson },
]

function TenantSwitcher({ primaryColor, onOpenCreateModal }) {
  const navigate = useNavigate()
  const companyName = useTenantStore((s) => s.branding.name)
  const activeTenantCode = useTenantStore((s) => s.advanced.tenantCode)
  const setActiveCountry = useTenantStore((s) => s.setActiveCountry)
  const { tenants, switching, fetchTenants, switchTenant } = useTenantManager()

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleOpen() {
    fetchTenants()
    setOpen(v => !v)
  }

  async function handleSwitch(id) {
    if (id === activeTenantCode) { setOpen(false); return }
    await switchTenant(id)
    setActiveCountry(null)  // resetear país al cambiar de tenant
    setOpen(false)
    navigate('/branding')
  }

  function handleClickCreate() {
    setOpen(false)
    onOpenCreateModal()
  }

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
          {companyName || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Sin tenant</span>}
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

            {/* Nuevo tenant — abre modal centrado */}
            <button
              onClick={handleClickCreate}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavGroup({ label, items, primaryColor }) {
  const setupComplete = useTenantStore((s) => s.advanced._setupComplete === true)
  const visible = items.filter(i => !i.requiresSetup || setupComplete)
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
      {visible.map(({ to, label: itemLabel, desc, Icon }) => (
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

// ─── Country switcher ─────────────────────────────────────────────────────────

function CountrySwitcher({ primaryColor }) {
  const navigate         = useNavigate()
  const countryConfigs   = useTenantStore((s) => s.countryConfigs)
  const activeCountry    = useTenantStore((s) => s.activeCountry)
  const setActiveCountry = useTenantStore((s) => s.setActiveCountry)
  const setupComplete    = useTenantStore((s) => s.advanced._setupComplete === true)
  const tenantCode       = useTenantStore((s) => s.advanced.tenantCode)

  const activeCountries = countryConfigs.filter(c => (c.status ?? 'active') === 'active')
  const draftCountries  = countryConfigs.filter(c => c.status === 'draft')

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const active = activeCountry
    ? countryConfigs.find(c => c.countryCode === activeCountry)
    : null

  function pickBase() {
    setActiveCountry(null)
    setOpen(false)
    navigate('/branding')
  }

  function pickCountry(code) {
    setActiveCountry(code)
    setOpen(false)
    navigate('/locale')
  }

  return (
    <div ref={ref} style={{ position: 'relative', marginTop: 8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '6px 8px',
          background: active ? `${primaryColor}10` : 'rgba(255,255,255,0.04)',
          border: active ? `1px solid ${primaryColor}30` : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        {active ? (
          <div style={{ width: 18, height: 13, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
            <FlagImage code={active.countryCode} size={18} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
          </div>
        ) : (
          <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={10} color="rgba(255,255,255,0.4)" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Sora, sans-serif', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {active ? active.name : 'Config base'}
          </div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', marginTop: 1 }}>
            {active ? `${active.countryCode} · override` : 'general · sin país'}
          </div>
        </div>
        <ChevronDown size={11} color="rgba(255,255,255,0.4)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#111318', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, overflow: 'hidden', zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {/* Base */}
            <button
              onClick={pickBase}
              style={{
                width: '100%', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7,
                background: !activeCountry ? `${primaryColor}14` : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${primaryColor}1a`}
              onMouseLeave={e => e.currentTarget.style.background = !activeCountry ? `${primaryColor}14` : 'transparent'}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={10} color="rgba(255,255,255,0.5)" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif' }}>
                  Config base
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace' }}>
                  general · heredada por todos
                </div>
              </div>
              {!activeCountry && <Check size={10} color={primaryColor} />}
            </button>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px' }} />

            {/* Países activos del tenant */}
            {activeCountries.map(c => (
              <button
                key={c.countryCode}
                onClick={() => pickCountry(c.countryCode)}
                style={{
                  width: '100%', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7,
                  background: activeCountry === c.countryCode ? `${primaryColor}14` : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${primaryColor}1a`}
                onMouseLeave={e => e.currentTarget.style.background = activeCountry === c.countryCode ? `${primaryColor}14` : 'transparent'}
              >
                <div style={{ width: 18, height: 13, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <FlagImage code={c.countryCode} size={18} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Sora, sans-serif',
                  }}>
                    {c.name ?? c.countryCode}
                    {c.isPrimary && (
                      <span style={{
                        fontSize: 6, padding: '1px 4px', borderRadius: 3,
                        background: `${primaryColor}25`, color: primaryColor,
                        fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.05em',
                      }}>
                        PRIMARIO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace' }}>
                    {c.countryCode} · {c.currency ?? '—'}
                  </div>
                </div>
                {activeCountry === c.countryCode && <Check size={10} color={primaryColor} />}
              </button>
            ))}

            {/* Países en construcción (drafts) — al click llevan al wizard */}
            {draftCountries.length > 0 && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px' }} />
                <div style={{
                  fontSize: 7, fontWeight: 700, color: 'rgba(255,180,0,0.5)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '8px 10px 4px', fontFamily: 'Space Mono, monospace',
                }}>
                  En construcción
                </div>
                {draftCountries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setOpen(false); navigate(`/countries/wizard/${c.id}`) }}
                    style={{
                      width: '100%', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,180,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 18, height: 13, borderRadius: 2, overflow: 'hidden', flexShrink: 0, opacity: 0.6 }}>
                      <FlagImage code={c.countryCode} size={18} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'Sora, sans-serif' }}>
                        {c.name ?? c.countryCode}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,180,0,0.5)', fontFamily: 'Space Mono, monospace' }}>
                        DRAFT · {c.draftStep ?? 0}/{c.totalSteps ?? 7}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Aviso: la creación de países se hace en /countries */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px' }} />
            {!tenantCode ? (
              <div style={{
                padding: '10px 12px', fontSize: 9, color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Space Mono, monospace', lineHeight: 1.5, textAlign: 'center',
              }}>
                Crea un tenant primero
              </div>
            ) : !setupComplete ? (
              <button
                onClick={() => { setOpen(false); navigate('/setup') }}
                style={{
                  width: '100%', padding: '10px 12px', display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start', gap: 3,
                  background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.15)',
                  borderRadius: 6, cursor: 'pointer', margin: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: 'rgba(255,180,0,0.8)', fontFamily: 'Sora, sans-serif' }}>
                  <Plus size={10} />
                  Termina la config base primero
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,180,0,0.5)', fontFamily: 'Space Mono, monospace', lineHeight: 1.5, textAlign: 'left' }}>
                  Para gestionar países necesitas completar identidad, tema y localización general
                </div>
              </button>
            ) : (
              <button
                onClick={() => { setOpen(false); navigate('/countries') }}
                style={{
                  width: '100%', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                <Globe2 size={11} />
                <span style={{ fontSize: 10, fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>
                  Gestionar países
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tenant create modal (centrado, full screen overlay) ──────────────────────

function TenantCreateModal({ open, onClose, primaryColor }) {
  const navigate = useNavigate()
  const { tenants, fetchTenants, createTenant, forkTenant } = useTenantManager()

  const [newId,           setNewId]           = useState('')
  const [newName,         setNewName]         = useState('')
  const [originCountries, setOriginCountries] = useState([])  // array ordenado: el primero será el principal
  const [forkFrom,        setForkFrom]        = useState('')
  const [search,          setSearch]          = useState('')

  useEffect(() => {
    if (open) {
      fetchTenants()
      setNewId(''); setNewName(''); setOriginCountries([]); setForkFrom(''); setSearch('')
    }
  }, [open, fetchTenants])

  const idError = newId && !/^[a-z0-9_-]+$/.test(newId)
  // En modo fork, los países vienen del tenant fuente — no se exigen aquí
  const needsCountry = !forkFrom
  const valid = newId.trim() && newName.trim() && !idError && (!needsCountry || originCountries.length > 0)

  const filtered = COUNTRY_CATALOG.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(search.toLowerCase())
  )

  function toggleCountry(code) {
    setOriginCountries(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    )
  }

  async function handleCreate() {
    if (!valid) return
    if (forkFrom) {
      await forkTenant(forkFrom, { id: newId, name: newName })
    } else {
      createTenant({ id: newId, name: newName, countryCodes: originCountries })
    }
    onClose()
    navigate('/setup')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(8,10,15,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520,
              background: 'rgba(20,23,32,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.3px' }}>
                  Nuevo tenant
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
                  Crear una nueva empresa cliente
                </div>
              </div>
              <button onClick={onClose} style={{
                width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={13} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Código + Nombre */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <FieldLabel>Código</FieldLabel>
                  <input
                    autoFocus
                    value={newId}
                    onChange={e => setNewId(e.target.value.toLowerCase())}
                    placeholder="empresa-xyz"
                    style={{
                      width: '100%', padding: '9px 11px', boxSizing: 'border-box',
                      background: idError ? 'rgba(185,28,28,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${idError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 7, color: '#fff', fontSize: 12, fontFamily: 'Space Mono, monospace', outline: 'none',
                    }}
                  />
                  {idError && <div style={{ fontSize: 9, color: '#f87171', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>Solo letras, números, guiones</div>}
                </div>
                <div>
                  <FieldLabel>Nombre</FieldLabel>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Empresa XYZ"
                    style={{
                      width: '100%', padding: '9px 11px', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, color: '#fff', fontSize: 12, fontFamily: 'Sora, sans-serif', outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Países de operación — multi-select. Solo si NO se está forkeando */}
              {needsCountry && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <FieldLabel>
                      Países de operación <span style={{ color: primaryColor }}>*</span>
                    </FieldLabel>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace' }}>
                      {originCountries.length === 0
                        ? 'el primero será el principal'
                        : `${originCountries.length} seleccionado${originCountries.length === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar país..."
                    style={{
                      width: '100%', padding: '7px 10px', marginBottom: 10, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, color: '#fff', fontSize: 11, fontFamily: 'Sora, sans-serif', outline: 'none',
                    }}
                  />
                  <div style={{
                    maxHeight: 180, overflowY: 'auto',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: 7,
                  }}>
                    {filtered.map(c => {
                      const idx = originCountries.indexOf(c.countryCode)
                      const selected = idx !== -1
                      const isPrimary = idx === 0
                      return (
                        <button
                          key={c.countryCode}
                          onClick={() => toggleCountry(c.countryCode)}
                          title={`${c.name}${isPrimary ? ' (principal)' : ''}`}
                          style={{
                            position: 'relative',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                            background: selected ? `${primaryColor}18` : 'rgba(255,255,255,0.03)',
                            border: selected
                              ? `1px solid ${isPrimary ? primaryColor : `${primaryColor}55`}`
                              : '1px solid rgba(255,255,255,0.07)',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {selected && (
                            <div style={{
                              position: 'absolute', top: 4, right: 4,
                              minWidth: 14, height: 14, borderRadius: '50%',
                              background: primaryColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '0 4px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                              fontSize: 8, fontWeight: 700, color: '#fff',
                              fontFamily: 'Space Mono, monospace',
                            }}>
                              {idx + 1}
                            </div>
                          )}
                          <div style={{ width: 40, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                            <FlagImage code={c.countryCode} size={40} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                          </div>
                          <div style={{
                            fontSize: 8, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                            color: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                            letterSpacing: '0.05em',
                          }}>
                            {c.countryCode}
                          </div>
                          {isPrimary && (
                            <div style={{
                              fontSize: 6, color: primaryColor, fontFamily: 'Space Mono, monospace',
                              fontWeight: 700, letterSpacing: '0.06em',
                            }}>
                              PRINCIPAL
                            </div>
                          )}
                        </button>
                      )
                    })}
                    {filtered.length === 0 && (
                      <div style={{ gridColumn: '1/-1', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', padding: '8px 0', textAlign: 'center' }}>
                        Sin resultados
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aviso en modo fork: los países vienen del tenant fuente */}
              {!needsCountry && (
                <div style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: `${primaryColor}10`, border: `1px solid ${primaryColor}25`,
                  fontSize: 11, color: `${primaryColor}cc`, fontFamily: 'Space Mono, monospace', lineHeight: 1.5,
                }}>
                  Los países y la configuración se copiarán del tenant <strong>{forkFrom}</strong>. Podrás añadir o quitar países después.
                </div>
              )}

              {/* Copiar de */}
              {tenants.length > 0 && (
                <div>
                  <FieldLabel>Copiar config de (opcional)</FieldLabel>
                  <select
                    value={forkFrom}
                    onChange={e => setForkFrom(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 11px', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, color: forkFrom ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                      fontSize: 11, fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="" style={{ background: '#111318' }}>— config en blanco —</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id} style={{ background: '#111318' }}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 8, justifyContent: 'flex-end',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 18px', borderRadius: 7,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: 'rgba(255,255,255,0.5)',
                  fontSize: 11, fontFamily: 'Sora, sans-serif', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!valid}
                style={{
                  padding: '9px 22px', borderRadius: 7, border: 'none',
                  background: valid ? primaryColor : `${primaryColor}40`,
                  color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                  cursor: valid ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {forkFrom ? 'Copiar y crear' : 'Crear tenant'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700,
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'Space Mono, monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

export default function Sidebar() {
  const primaryColor = useTenantStore((s) => s.theme.light?.primary ?? '#E8175D')
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
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

        <TenantSwitcher primaryColor={primaryColor} onOpenCreateModal={() => setCreateOpen(true)} />
        <CountrySwitcher primaryColor={primaryColor} />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <NavGroup label="Configuración" items={NAV_ITEMS} primaryColor={primaryColor} />
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
          tenant-admin v0.1
        </span>
      </div>
    </aside>

    <TenantCreateModal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      primaryColor={primaryColor}
    />
    </>
  )
}
