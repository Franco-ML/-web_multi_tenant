import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, X, Image, Move, Crosshair } from 'lucide-react'
import { useTenantStore } from '../../store/useTenantStore'

// ─── Tamaño del logo en la app (simulador y app real) ────────────────────────
const APP_LOGO_SIZE = 52

// ─── Parseo / serialización de object-position ───────────────────────────────
function parsePct(pos) {
  const parts = (pos || '50% 50%').split(' ')
  return { x: parseFloat(parts[0]) ?? 50, y: parseFloat(parts[1]) ?? 50 }
}
function fmtPct(x, y) { return `${x.toFixed(1)}% ${y.toFixed(1)}%` }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)) }

// ─── Círculo de logo — reutilizado en modal (grande) y thumbnail (pequeño) ───
function LogoCircle({ src, position, size, draggable, onDragStart }) {
  const pct = parsePct(position)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      border: draggable
        ? '2px solid rgba(232,23,93,0.4)'
        : '2px solid rgba(255,255,255,0.1)',
      cursor: draggable ? 'grab' : 'default',
      userSelect: 'none', position: 'relative',
      background: 'rgba(255,255,255,0.04)',
    }}
      onMouseDown={draggable ? onDragStart : undefined}
      onTouchStart={draggable ? onDragStart : undefined}
    >
      <img
        src={src}
        alt="logo"
        draggable={false}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: `${pct.x}% ${pct.y}%`,
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'block',
        }}
      />
      {draggable && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.25)',
          opacity: 0, transition: 'opacity 0.15s',
          borderRadius: '50%',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <Move size={size > 100 ? 22 : 14} color="rgba(255,255,255,0.9)" />
        </div>
      )}
    </div>
  )
}

// ─── Modal de posicionado ─────────────────────────────────────────────────────
function LogoPositionModal({ src, initialPosition, onSave, onClose }) {
  const [pos, setPos]     = useState(initialPosition)
  const dragging          = useRef(false)
  const startMouse        = useRef({ x: 0, y: 0 })
  const startPct          = useRef({ x: 50, y: 50 })
  const canvasRef         = useRef(null)
  const CANVAS_SIZE       = 220

  const pct       = parsePct(pos)
  const isCentered = Math.abs(pct.x - 50) < 0.6 && Math.abs(pct.y - 50) < 0.6

  // Convierte movimiento de mouse en delta de object-position.
  // Arrastrar → → imagen se mueve → → focal point X baja (ves más izquierda)
  function applyDelta(clientX, clientY) {
    if (!canvasRef.current) return
    const dx = (clientX - startMouse.current.x) / CANVAS_SIZE * 100
    const dy = (clientY - startMouse.current.y) / CANVAS_SIZE * 100
    const nx = clamp(startPct.current.x - dx, 0, 100)
    const ny = clamp(startPct.current.y - dy, 0, 100)
    setPos(fmtPct(nx, ny))
  }

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    dragging.current   = true
    startMouse.current = { x: e.clientX, y: e.clientY }
    startPct.current   = parsePct(pos)

    function onMove(ev) { if (dragging.current) applyDelta(ev.clientX, ev.clientY) }
    function onUp()     { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    dragging.current   = true
    startMouse.current = { x: t.clientX, y: t.clientY }
    startPct.current   = parsePct(pos)

    function onMove(ev) { if (dragging.current) applyDelta(ev.touches[0].clientX, ev.touches[0].clientY) }
    function onEnd()    { dragging.current = false; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        style={{
          background: '#0D1017',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          width: 420,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crosshair size={13} color="#E8175D" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora', letterSpacing: '-0.3px' }}>
              Ajustar posición del logo
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

        {/* Contenido */}
        <div style={{ padding: '24px 22px', display: 'flex', gap: 24, alignItems: 'center' }}>

          {/* Canvas grande — zona de arrastre */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div ref={canvasRef}>
              <LogoCircle
                src={src}
                position={pos}
                size={CANVAS_SIZE}
                draggable
                onDragStart={e => {
                  if (e.type === 'touchstart') onTouchStart(e)
                  else onMouseDown(e)
                }}
              />
            </div>
            <span style={{
              fontSize: 9, color: 'rgba(255,255,255,0.25)',
              fontFamily: 'Space Mono', letterSpacing: '0.04em', textAlign: 'center',
            }}>
              arrastrá para reposicionar
            </span>
          </div>

          {/* Panel derecho */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Preview exacta — mismo tamaño que la app */}
            <div>
              <div style={{
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Space Mono', textTransform: 'uppercase',
                letterSpacing: '0.07em', marginBottom: 10,
              }}>
                Preview real · {APP_LOGO_SIZE}px
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LogoCircle src={src} position={pos} size={APP_LOGO_SIZE} draggable={false} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', lineHeight: 1.7 }}>
                  Así se verá<br />
                  en la app
                </div>
              </div>
            </div>

            {/* Coordenadas */}
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', marginBottom: 4, letterSpacing: '0.06em' }}>
                OBJECT-POSITION
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Space Mono', letterSpacing: '0.02em' }}>
                {pct.x.toFixed(0)}%&nbsp;&nbsp;{pct.y.toFixed(0)}%
              </div>
            </div>

            {/* Centrar */}
            <button
              onClick={() => setPos('50% 50%')}
              disabled={isCentered}
              style={{
                padding: '7px 0', borderRadius: 8,
                border: `1px solid ${isCentered ? 'rgba(255,255,255,0.05)' : 'rgba(232,23,93,0.3)'}`,
                background: isCentered ? 'transparent' : 'rgba(232,23,93,0.07)',
                color: isCentered ? 'rgba(255,255,255,0.18)' : 'rgba(232,23,93,0.8)',
                fontSize: 10, fontFamily: 'Space Mono',
                cursor: isCentered ? 'default' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              <Crosshair size={9} />
              {isCentered ? 'Ya centrado' : 'Centrar'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px 18px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 8,
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Sora',
            cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={() => { onSave(pos); onClose() }} style={{
            flex: 2, padding: '10px', borderRadius: 10,
            background: '#E8175D', border: 'none',
            color: '#fff', fontSize: 12, fontFamily: 'Sora', fontWeight: 600,
            cursor: 'pointer',
          }}>
            Guardar posición
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// ─── LogoUploader ─────────────────────────────────────────────────────────────

export default function LogoUploader() {
  const logoPreviewUrl   = useTenantStore((s) => s.branding.logoPreviewUrl)
  const logoPosition     = useTenantStore((s) => s.branding.logoPosition ?? '50% 50%')
  const setLogoFile      = useTenantStore((s) => s.setLogoFile)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)

  const [isDragOver, setIsDragOver] = useState(false)
  const [urlMode,    setUrlMode]    = useState(false)
  const [urlInput,   setUrlInput]   = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (file?.type.startsWith('image/')) {
      setLogoFile(file)
      setBrandingField('logoPosition', '50% 50%')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleUrlApply() {
    if (urlInput.trim()) {
      setBrandingField('logoPreviewUrl', urlInput.trim())
      setBrandingField('logoPosition', '50% 50%')
      setUrlMode(false)
    }
  }

  function handleRemove() {
    setLogoFile(null)
    setBrandingField('logoPreviewUrl', null)
    setBrandingField('logoPosition', '50% 50%')
    setUrlInput('')
  }

  // ── Estado: logo cargado ───────────────────────────────────────────────────
  if (logoPreviewUrl) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          {/* Thumbnail circular — mismo tamaño que la app */}
          <LogoCircle
            src={logoPreviewUrl}
            position={logoPosition}
            size={APP_LOGO_SIZE}
            draggable={false}
          />

          {/* Info + acciones */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Sora', marginBottom: 6,
            }}>
              Logo cargado
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  background: 'rgba(232,23,93,0.1)',
                  border: '1px solid rgba(232,23,93,0.25)',
                  color: 'rgba(232,23,93,0.8)',
                  fontSize: 10, fontFamily: 'Sora', fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Move size={10} />
                Ajustar posición
              </button>
            </div>
          </div>

          {/* Eliminar */}
          <button onClick={handleRemove} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,59,48,0.07)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={11} color="rgba(255,59,48,0.65)" />
          </button>
        </motion.div>

        <AnimatePresence>
          {showModal && (
            <LogoPositionModal
              src={logoPreviewUrl}
              initialPosition={logoPosition}
              onSave={(pos) => setBrandingField('logoPosition', pos)}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Estado: sin logo — zona de upload ─────────────────────────────────────
  return (
    <div>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragOver ? 1.02 : 1 }}
        onClick={() => !urlMode && inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'rgba(232,23,93,0.7)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 12,
          padding: '24px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          cursor: urlMode ? 'default' : 'pointer',
          background: isDragOver ? 'rgba(232,23,93,0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(232,23,93,0.1)', border: '1px solid rgba(232,23,93,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image size={20} color="#E8175D" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
            {isDragOver ? 'Suelta para subir' : 'Arrastrá tu logo aquí'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontFamily: 'Space Mono' }}>
            PNG, SVG, JPG · recomendado 200×200px
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])} />
      </motion.div>

      <div style={{ marginTop: 10 }}>
        {!urlMode ? (
          <button
            onClick={() => setUrlMode(true)}
            style={{
              width: '100%', padding: '8px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: 'rgba(255,255,255,0.4)',
              fontSize: 11, fontFamily: 'Sora', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(232,23,93,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <Link size={12} /> Usar URL de imagen
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
              placeholder="https://ejemplo.com/logo.png"
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 7,
                border: '1px solid rgba(232,23,93,0.3)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Space Mono', outline: 'none',
              }}
            />
            <button onClick={handleUrlApply} style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: '#E8175D', color: '#fff', fontSize: 11, fontFamily: 'Sora', fontWeight: 600, cursor: 'pointer' }}>
              OK
            </button>
            <button onClick={() => setUrlMode(false)} style={{ padding: '7px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <X size={12} color="rgba(255,255,255,0.4)" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
