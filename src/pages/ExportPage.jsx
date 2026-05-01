import { useState } from 'react'
import { FileJson, Download, Copy, Upload, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTenantStore } from '../store/useTenantStore'
import { useConfigExport } from '../hooks/useConfigExport'
import SectionCard from '../components/config/SectionCard'
import PageHeader from '../components/ui/PageHeader'

export default function ExportPage() {
  const { downloadJson, copyToClipboard, importFromFile, getJson } = useConfigExport()
  const loadFromJson = useTenantStore((s) => s.loadFromJson)
  const resetToDefaults = useTenantStore((s) => s.resetToDefaults)
  const [copied, setCopied] = useState(false)
  const [importMsg, setImportMsg] = useState(null)

  const handleCopy = async () => {
    await copyToClipboard()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImportFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const success = await importFromFile(file)
    setImportMsg(success ? 'success' : 'error')
    setTimeout(() => setImportMsg(null), 3000)
    e.target.value = ''
  }

  const json = getJson()

  return (
    <div>
      <PageHeader
        title="Exportar configuración"
        subtitle="Descarga el JSON del tenant para integrarlo con tu backend"
        icon={FileJson}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <ActionButton icon={Download} label="Descargar JSON" onClick={downloadJson} variant="primary" />
        <ActionButton
          icon={copied ? Check : Copy}
          label={copied ? '¡Copiado!' : 'Copiar JSON'}
          onClick={handleCopy}
          variant={copied ? 'success' : 'secondary'}
        />
      </div>

      {/* JSON Preview */}
      <SectionCard title="Previsualización del JSON" icon={FileJson} delay={0.05}>
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 8,
          padding: '14px',
          maxHeight: 380,
          overflow: 'auto',
          fontFamily: 'Space Mono, monospace',
          fontSize: 10,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.02em',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <JsonHighlight json={json} />
        </div>
      </SectionCard>

      {/* Import */}
      <SectionCard title="Importar configuración" delay={0.1}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px dashed rgba(255,255,255,0.12)',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
            background: 'rgba(255,255,255,0.02)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(232,23,93,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          >
            <Upload size={14} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora' }}>
              Cargar archivo tenant-config.json
            </span>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
          </label>

          <AnimatePresence>
            {importMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 7,
                  background: importMsg === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                  border: `1px solid ${importMsg === 'success' ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.3)'}`,
                  fontSize: 11,
                  color: importMsg === 'success' ? 'rgba(52,199,89,0.9)' : 'rgba(255,59,48,0.9)',
                  fontFamily: 'Space Mono',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {importMsg === 'success'
                    ? <><Check size={11} />Configuración importada correctamente</>
                    : <><X size={11} />Error al leer el archivo JSON</>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* Reset */}
      <SectionCard delay={0.15}>
        <button
          onClick={resetToDefaults}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: '1px solid rgba(255,59,48,0.2)',
            background: 'rgba(255,59,48,0.06)',
            color: 'rgba(255,59,48,0.7)',
            fontSize: 12,
            fontFamily: 'Sora',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,59,48,0.12)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,59,48,0.06)'}
        >
          Restaurar valores por defecto
        </button>
      </SectionCard>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, variant = 'secondary' }) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #E8175D, #B5104A)',
      border: '1px solid rgba(232,23,93,0.5)',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(232,23,93,0.3)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.7)',
    },
    success: {
      background: 'rgba(52,199,89,0.12)',
      border: '1px solid rgba(52,199,89,0.3)',
      color: 'rgba(52,199,89,0.9)',
    },
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '11px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontSize: 12,
        fontFamily: 'Sora',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        ...styles[variant],
      }}
    >
      <Icon size={14} />
      {label}
    </motion.button>
  )
}

function JsonHighlight({ json }) {
  const colored = json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = '#6EE7B7'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = '#93C5FD'
        } else {
          cls = '#FCA5A5'
        }
      } else if (/true|false/.test(match)) {
        cls = '#A78BFA'
      } else if (/null/.test(match)) {
        cls = '#F87171'
      }
      return `<span style="color:${cls}">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
    })

  return (
    <pre
      style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
      dangerouslySetInnerHTML={{ __html: colored }}
    />
  )
}
