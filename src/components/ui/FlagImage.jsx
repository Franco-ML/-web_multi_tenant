// Mapeo de código de idioma → código de país para la bandera
const LANG_TO_COUNTRY = {
  'es':    'es',
  'en':    'us',
  'zh-CN': 'cn',
  'zh':    'cn',
  'pt':    'br',
  'pt-BR': 'br',
  'fr':    'fr',
  'de':    'de',
}

// flagcdn.com solo acepta estos anchos exactos
const VALID_WIDTHS = [20, 40, 80, 160, 320, 640]

function nearestWidth(px) {
  return VALID_WIDTHS.reduce((prev, cur) =>
    Math.abs(cur - px) < Math.abs(prev - px) ? cur : prev
  )
}

export default function FlagImage({ code = '', type = 'country', size = 40, fallback, style = {} }) {
  const isoCode = type === 'lang'
    ? (LANG_TO_COUNTRY[code] ?? code.slice(0, 2)).toLowerCase()
    : code.toLowerCase()

  const w   = nearestWidth(size)
  const w2x = nearestWidth(size * 2)
  const src   = `https://flagcdn.com/w${w}/${isoCode}.png`
  const src2x = `https://flagcdn.com/w${w2x}/${isoCode}.png`

  return (
    <img
      src={src}
      srcSet={`${src} 1x, ${src2x} 2x`}
      alt={code}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
        const abbr = fallback ?? isoCode.toUpperCase().slice(0, 2)
        const span = document.createElement('span')
        span.textContent = abbr
        span.style.cssText = `font-size:${Math.round(size * 0.3)}px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.05em;`
        e.currentTarget.parentNode?.insertBefore(span, e.currentTarget)
      }}
      style={{
        width: size,
        height: 'auto',
        borderRadius: 3,
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
