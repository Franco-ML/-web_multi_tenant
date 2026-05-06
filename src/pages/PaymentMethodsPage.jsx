import { CreditCard, Banknote, Wallet, ArrowLeftRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useTenantStore } from '../store/useTenantStore'

const FONT_SORA = 'Sora, sans-serif'
const FONT_MONO = '"Space Mono", monospace'

const METHODS = [
  { key: 'cash',     label: 'Efectivo',         desc: 'Pago en mano al recibir el envío',          Icon: Banknote,        color: '#10B981' },
  { key: 'card',     label: 'Tarjeta',          desc: 'Crédito o débito con pasarela integrada',   Icon: CreditCard,      color: '#63B3ED' },
  { key: 'wallet',   label: 'Billetera digital',desc: 'Apple Pay, Google Pay y similares',         Icon: Wallet,          color: '#B794F4' },
  { key: 'transfer', label: 'Transferencia',    desc: 'SPEI, SINPE, PSE u otra transferencia',     Icon: ArrowLeftRight,  color: '#F6AD55' },
]

export default function PaymentMethodsPage() {
  const paymentMethods    = useTenantStore(s => s.paymentMethods)
  const setPaymentMethod  = useTenantStore(s => s.setPaymentMethod)

  function toggle(key) {
    const current = paymentMethods?.[key]?.enabled ?? false
    setPaymentMethod(key, !current)
  }

  return (
    <div>
      <PageHeader
        title="Métodos de pago"
        subtitle="Definí cómo pueden pagar tus clientes en la app"
        icon={CreditCard}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
        {METHODS.map(m => {
          const enabled = paymentMethods?.[m.key]?.enabled ?? false
          return (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                background: enabled ? `${m.color}10` : 'rgba(255,255,255,0.03)',
                border: enabled ? `1px solid ${m.color}40` : '1px solid rgba(255,255,255,0.07)',
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: enabled ? `${m.color}1A` : 'rgba(255,255,255,0.04)',
                border: enabled ? `1px solid ${m.color}40` : '1px solid rgba(255,255,255,0.08)',
              }}>
                <m.Icon size={16} color={enabled ? m.color : 'rgba(255,255,255,0.35)'} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, fontFamily: FONT_SORA,
                  color: enabled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>

              <div style={{
                width: 38, height: 22, borderRadius: 11, flexShrink: 0, position: 'relative',
                background: enabled ? m.color : 'rgba(255,255,255,0.1)', transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: 3,
                  left: enabled ? 19 : 3, transition: 'left 0.15s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
