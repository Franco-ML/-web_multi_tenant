import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link, X, Image, Check } from 'lucide-react'
import { useTenantStore } from '../../store/useTenantStore'

export default function LogoUploader() {
  const logoPreviewUrl = useTenantStore((s) => s.branding.logoPreviewUrl)
  const setLogoFile = useTenantStore((s) => s.setLogoFile)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)
  const [isDragOver, setIsDragOver] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setBrandingField('logoPreviewUrl', urlInput.trim())
      setUrlMode(false)
    }
  }

  const handleRemove = () => {
    setLogoFile(null)
    setBrandingField('logoPreviewUrl', null)
    setUrlInput('')
  }

  return (
    <div>
      {!logoPreviewUrl ? (
        <>
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: urlMode ? 'default' : 'pointer',
              background: isDragOver ? 'rgba(232,23,93,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(232,23,93,0.1)',
              border: '1px solid rgba(232,23,93,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image size={20} color="#E8175D" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Sora' }}>
                {isDragOver ? 'Suelta para subir' : 'Arrastra tu logo aquí'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontFamily: 'Space Mono' }}>
                PNG, SVG, JPG · recomendado 200×200px
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </motion.div>

          {/* URL option */}
          <div style={{ marginTop: 10 }}>
            {!urlMode ? (
              <button
                onClick={() => setUrlMode(true)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontFamily: 'Sora',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.3)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <Link size={12} />
                Usar URL de imagen
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                  placeholder="https://ejemplo.com/logo.png"
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: '1px solid rgba(232,23,93,0.3)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 11,
                    fontFamily: 'Space Mono',
                    outline: 'none',
                  }}
                />
                <button onClick={handleUrlApply} style={{
                  padding: '7px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: '#E8175D',
                  color: '#fff',
                  fontSize: 11,
                  fontFamily: 'Sora',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  OK
                </button>
                <button onClick={() => setUrlMode(false)} style={{
                  padding: '7px',
                  borderRadius: 7,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <X size={12} color="rgba(255,255,255,0.4)" />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px',
            background: 'rgba(52,199,89,0.06)',
            border: '1px solid rgba(52,199,89,0.2)',
            borderRadius: 12,
          }}
        >
          <img
            src={logoPreviewUrl}
            alt="logo preview"
            style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }}
            onError={() => handleRemove()}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'Sora' }}>
              Logo cargado
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'rgba(52,199,89,0.8)', fontFamily: 'Space Mono', marginTop: 2 }}>
              <Check size={9} color="rgba(52,199,89,0.8)" />
              Visible en el simulador
            </div>
          </div>
          <button onClick={handleRemove} style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,59,48,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <X size={12} color="rgba(255,59,48,0.8)" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
