import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // En producción (GitHub Pages) el repo se llama -web_multi_tenant
  const base = mode === 'production' ? '/-web_multi_tenant/' : '/'
  return {
    plugins: [react()],
    base,
  }
})
