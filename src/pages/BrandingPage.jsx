import { Package, Type, AlignLeft } from 'lucide-react'
import { useTenantStore } from '../store/useTenantStore'
import SectionCard from '../components/config/SectionCard'
import LogoUploader from '../components/config/LogoUploader'
import PageHeader from '../components/ui/PageHeader'

export default function BrandingPage() {
  const name = useTenantStore((s) => s.branding.name)
  const description = useTenantStore((s) => s.branding.description)
  const setBrandingField = useTenantStore((s) => s.setBrandingField)

  return (
    <div>
      <PageHeader
        title="Identidad de marca"
        subtitle="Logo, nombre de empresa y descripción que aparecen en la app"
        icon={Package}
      />

      <SectionCard
        title="Logo de la empresa"
        description="Se mostrará en la pantalla de login y otros puntos de la app"
        icon={Package}
        delay={0.05}
      >
        <LogoUploader />
      </SectionCard>

      <SectionCard
        title="Nombre de la empresa"
        description="Aparece en la pantalla de bienvenida y el perfil del mensajero"
        icon={Type}
        delay={0.1}
      >
        <input
          value={name}
          onChange={(e) => setBrandingField('name', e.target.value)}
          placeholder="Nombre de la empresa"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            fontFamily: 'Sora, sans-serif',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </SectionCard>

      <SectionCard
        title="Descripción"
        description="Texto breve que describe el propósito de la app para este tenant"
        icon={AlignLeft}
        delay={0.15}
      >
        <textarea
          value={description}
          onChange={(e) => setBrandingField('description', e.target.value)}
          placeholder="Describe brevemente la plataforma..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            fontFamily: 'Sora, sans-serif',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            lineHeight: 1.6,
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(232,23,93,0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </SectionCard>
    </div>
  )
}
