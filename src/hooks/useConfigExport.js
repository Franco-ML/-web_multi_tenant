import { useTenantStore } from '../store/useTenantStore'

export function useConfigExport() {
  const exportToJson = useTenantStore((s) => s.exportToJson)
  const loadFromJson = useTenantStore((s) => s.loadFromJson)

  const downloadJson = () => {
    const json = exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tenant-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    const json = exportToJson()
    await navigator.clipboard.writeText(json)
  }

  const importFromFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const success = loadFromJson(e.target.result)
        resolve(success)
      }
      reader.readAsText(file)
    })
  }

  return { downloadJson, copyToClipboard, importFromFile, getJson: exportToJson }
}
