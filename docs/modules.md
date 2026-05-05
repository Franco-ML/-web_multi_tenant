# Guardado de módulos — modelo y flujo

Este documento explica cómo se almacena la configuración modular de un tenant
multi-país y cómo viaja desde el admin web hasta PostgreSQL pasando por el
backend.

---

## 1. Concepto: los 7 módulos heredables

La configuración de un tenant se divide en **7 módulos top-level**. Cada módulo
agrupa un dominio funcional cerrado y puede heredarse o personalizarse de forma
independiente por país.

| Módulo | Qué contiene |
|---|---|
| `branding` | `name`, `description`, `logoUrl`, `primaryColor` |
| `theme` | `colorMode`, paletas `light` y `dark` (tokens: primary/surface/text/border/...) |
| `features` | toggles de pantallas/funciones (`routesEnabled`, `profileEnabled`, `googleMapsEnabled`, `scanningEnabled`, `darkModeToggleEnabled`, `analyticsEnabled`, `crashReportingEnabled`) |
| `registration` | `steps[]` — pasos del flujo de registro con sus campos y documentos |
| `i18n` | `defaultLang`, `userCanChange`, `translations` (mapa por idioma) |
| `login` | `phoneEnabled`, `emailEnabled` y otros métodos |
| `advanced` | `apiUrl`, `tenantCode`, `sentryDsn`, `googleMapsApiKey`, `appEnv`, `supportWebUrl`, `supportPhone`, flags internos como `_setupComplete` |

Aparte de estos 7 módulos, existen los **`locale_fields`** (currency, language,
phonePrefix, timezone, idTypes, documents) que **NO** se heredan — siempre son
específicos por país. Ver `docs/locale-fields.md` (futuro).

---

## 2. Dónde vive cada cosa en PostgreSQL

```
tenant
  ├─ id
  ├─ code
  ├─ name
  ├─ active
  └─ base_config   JSONB    ← los 7 módulos del nivel TENANT (config base)
                              {
                                branding: {...},
                                theme: {...},
                                features: {...},
                                registration: {...},
                                i18n: {...},
                                login: {...},
                                advanced: {...}
                              }

tenant_country
  ├─ id (UUID)
  ├─ tenant_id
  ├─ country_id
  ├─ status            ('draft' | 'active' | 'inactive')
  ├─ is_primary
  ├─ inherits_from     (null=own | 'base' | <tenant_country.id>)
  ├─ module_modes      JSONB   ← por módulo: 'inherit' | 'override-base' | 'custom'
  │                              { branding: 'inherit', theme: 'custom', ... }
  ├─ custom_modules    JSONB   ← valores propios cuando module_modes[mod] === 'custom'
  │                              { theme: { colorMode: 'dark', light: {...}, dark: {...} } }
  ├─ locale_fields     JSONB   ← currency, language, phonePrefix, timezone, idTypes, documents
  ├─ draft_step
  └─ total_steps
```

**Idea clave:**

- `tenant.base_config` es la **config base del tenant** — la única fuente de
  verdad cuando un país hereda con `inherits_from = 'base'`.
- `tenant_country.module_modes` indica para CADA uno de los 7 módulos: ¿lo
  heredo del padre, lo override con la base, o tengo el mío?
- `tenant_country.custom_modules` solo guarda los módulos donde `module_modes
  [mod] === 'custom'`. Los demás campos quedan ausentes (no `null`).

---

## 3. Modos de herencia por módulo

Cada uno de los 7 módulos puede estar en uno de tres modos en cada país:

| Modo | Significado | Origen del valor |
|---|---|---|
| `inherit` | Tomar el módulo del padre tal cual | `inherits_from === 'base'` → `tenant.base_config[modulo]`. `inherits_from === <id>` → resolver recursivo del padre. |
| `override-base` | Forzar que use la base del tenant aunque su padre tenga otra cosa | `tenant.base_config[modulo]` siempre |
| `custom` | Tiene un valor propio | `tenant_country.custom_modules[modulo]` |

**Ejemplo: Honduras hereda de Costa Rica, pero quiere su propio theme**

```jsonc
// tenant_country (HN)
{
  "inherits_from": "<costa-rica-tenant_country-uuid>",
  "module_modes": {
    "branding":     "inherit",        // toma branding de CR
    "theme":        "custom",         // theme propio
    "features":     "inherit",
    "registration": "inherit",
    "i18n":         "inherit",
    "login":        "inherit",
    "advanced":     "inherit"
  },
  "custom_modules": {
    "theme": {
      "colorMode": "dark",
      "light": { "primary": "#0066cc", ... },
      "dark":  { "primary": "#3399ff", ... }
    }
    // los otros 6 módulos NO aparecen porque no son 'custom'
  }
}
```

**Ejemplo: México con `inherits_from = null` (config 100% propia)**

```jsonc
// tenant_country (MX)
{
  "inherits_from": null,                // own — no hereda de nadie
  "module_modes": {
    "branding":     "custom",
    "theme":        "custom",
    "features":     "custom",
    "registration": "custom",
    "i18n":         "custom",
    "login":        "custom",
    "advanced":     "custom"
  },
  "custom_modules": {
    "branding":     { ... },
    "theme":        { ... },
    "features":     { ... },
    "registration": { ... },
    "i18n":         { ... },
    "login":        { ... },
    "advanced":     { ... }
  },
  "status": "draft",                    // hasta completar wizard NO es usable
  "draft_step": 3,
  "total_steps": 7
}
```

---

## 4. Flujo completo: frontend → store → backend → DB

### 4.1 En el navegador (frontend)

El store de Zustand mantiene la config en forma **plana** para edición:

```js
useTenantStore = {
  branding:       { name, description, logoUrl, primaryColor },
  theme:          { colorMode, light, dark },
  features:       { ... },
  registration:   { steps: [...] },
  i18n:           { defaultLang, translations, userCanChange },
  login:          { phoneEnabled, emailEnabled },
  advanced:       { apiUrl, sentryDsn, ... },
  countryConfigs: [
    {
      id, countryCode, name, status, isPrimary,
      inheritsFrom, moduleModes, customModules,
      currency, language, phonePrefix, ...   // ← locale fields planos
    }
  ]
}
```

El usuario edita cualquier campo (input, color picker, toggle…). Cada acción
del store (`setBrandingField`, `setColor`, `addCountry`, etc.) actualiza el
estado y dispara dos efectos:

1. **Zustand persist middleware** escribe a `localStorage` (cache offline-first).
2. **`useAutoSave` hook** detecta el cambio, debounce de 1.5s, y dispara un
   `POST /admin/tenant/<code>` con el JSON completo.

### 4.2 El backend recibe el POST

`POST /admin/tenant/:tenantCode` con body que contiene:

```jsonc
{
  "branding":       { ... },
  "theme":          { ... },
  "features":       { ... },
  "registration":   { ... },
  "i18n":           { ... },
  "login":          { ... },
  "advanced":       { ... },
  "countryConfigs": [
    {
      "countryCode": "CR", "name": "Costa Rica",
      "status": "active", "isPrimary": true,
      "inheritsFrom": "base",
      "moduleModes":   { branding: "inherit", ... },
      "customModules": {},
      "currency": "CRC", "language": "es-CR", ...
    },
    ...
  ]
}
```

### 4.3 `db.js → saveTenant(tenantCode, fullConfig)`

Lo decompone en operaciones atómicas dentro de una transacción:

**A. Separa los 7 módulos para `tenant.base_config`:**

```js
const BASE_KEYS = ['branding', 'theme', 'features', 'registration',
                   'i18n', 'login', 'advanced']

const baseConfig = {}
for (const key of BASE_KEYS) {
  if (fullConfig[key] !== undefined) baseConfig[key] = fullConfig[key]
}

// UPDATE tenant SET base_config = $1 WHERE id = $tenantId
```

**B. Por cada país en `countryConfigs`:**

```js
for (const c of fullConfig.countryConfigs) {
  // 1. Mapear iso_2 → country.id (FK)
  const countryId = await getCountryIdByIso2(client, c.countryCode)

  // 2. Separar locale_fields del resto
  const localeFields = {}
  for (const k of LOCALE_KEYS) {
    if (c[k] !== undefined) localeFields[k] = c[k]
  }

  // 3. UPSERT tenant_country
  INSERT INTO tenant_country (
    tenant_id, country_id, status, is_primary,
    inherits_from, module_modes, custom_modules, locale_fields,
    draft_step, total_steps
  ) VALUES ($1..$10)
  ON CONFLICT (tenant_id, country_id)
  DO UPDATE SET
    status         = EXCLUDED.status,
    is_primary     = EXCLUDED.is_primary,
    inherits_from  = EXCLUDED.inherits_from,
    module_modes   = EXCLUDED.module_modes,
    custom_modules = EXCLUDED.custom_modules,
    locale_fields  = EXCLUDED.locale_fields,
    ...
}
```

**C. Borra países que dejaron de estar en el payload:**

```sql
DELETE FROM tenant_country
WHERE tenant_id = $1
  AND country_id NOT IN (
    SELECT id FROM country WHERE iso_2 = ANY($2::text[])
  )
```

**D. COMMIT** o ROLLBACK si algo falló.

### 4.4 `db.js → getTenant(tenantCode)`

Reconstruye el JSON original desde dos queries:

```sql
-- Query 1: tenant + base_config
SELECT id, name, base_config FROM tenant WHERE code = $1

-- Query 2: countries + locale_fields, JOIN para traer iso_2 y name
SELECT tc.id, tc.status, tc.is_primary, tc.inherits_from,
       tc.module_modes, tc.custom_modules, tc.locale_fields,
       tc.draft_step, tc.total_steps,
       c.iso_2 AS country_code, c.name AS country_name
FROM tenant_country tc
JOIN country c ON c.id = tc.country_id
WHERE tc.tenant_id = $1
ORDER BY tc.created_at
```

Y aplana cada fila al formato que el frontend espera:

```js
const countryConfigs = countriesQ.rows.map(r => ({
  id:           r.id,
  countryCode:  r.country_code,
  name:         r.country_name,
  status:       r.status,
  isPrimary:    r.is_primary,
  inheritsFrom: r.inherits_from,
  moduleModes:    r.module_modes ?? {},
  customModules:  r.custom_modules ?? {},
  draftStep:    r.draft_step,
  totalSteps:   r.total_steps,
  ...(r.locale_fields ?? {})    // ← spread del JSONB de locale al país plano
}))

return {
  ...(tenant.base_config ?? {}), // los 7 módulos del nivel base
  countryConfigs,                 // array de países reconstruido
  tenantCode
}
```

---

## 5. Resolución efectiva (mobile bootstrap)

Cuando la mobile pide config para un país específico, el backend debe
**resolver herencias recursivamente** y devolver un JSON ya mergeado.

```
GET /mobile/bootstrap?tenant=puntoentrega&country=HN
```

Pseudo-algoritmo:

```js
function resolveCountry(country, allCountries, baseConfig) {
  if (country.status !== 'active') {
    throw new Error('Country no usable (draft o inactive)')
  }

  const result = {}

  for (const mod of MODULES) {  // los 7 módulos
    const mode = country.module_modes[mod] ?? 'inherit'

    if (mode === 'custom') {
      // Valor propio del país
      result[mod] = country.custom_modules[mod]

    } else if (mode === 'override-base') {
      // Fuerza la base del tenant
      result[mod] = baseConfig[mod]

    } else { // 'inherit'
      if (country.inherits_from === null) {
        // own + inherit no tiene sentido — fallback a base
        result[mod] = baseConfig[mod]
      } else if (country.inherits_from === 'base') {
        result[mod] = baseConfig[mod]
      } else {
        // Hereda de otro país → recursivo
        const parent = allCountries.find(c => c.id === country.inherits_from)
        if (!parent) throw new Error('Padre no encontrado')
        const parentResolved = resolveCountry(parent, allCountries, baseConfig)
        result[mod] = parentResolved[mod]
      }
    }
  }

  // locale fields nunca se heredan — directo
  return {
    ...result,
    locale: country.locale_fields
  }
}
```

**Detección de ciclos:** mantener un `Set<id>` de países visitados; si se
intenta visitar uno dos veces en la misma cadena → error de config inválida.

---

## 6. Ejemplos de cadenas de herencia

### A. Tenant con un solo país que hereda base

```
tenant (Puntoentrega)
  base_config: { branding, theme, features, ... }
    │
    └── tenant_country (CR)
          inherits_from: 'base'
          module_modes: todos 'inherit'
          custom_modules: {}
```

Mobile pide CR → recibe la `base_config` tal cual + locale de CR.

### B. Tenant con 3 países, herencia en cadena

```
tenant (Puntoentrega)
  base_config: { ... }
    │
    ├── tenant_country (CR)  inherits='base', todos 'inherit'
    │     │
    │     └── tenant_country (HN)  inherits=<CR.id>
    │           module_modes:
    │             theme:    'custom'      ← HN tiene su propio tema
    │             others:   'inherit'     ← lo demás viene de CR
    │           custom_modules:
    │             theme: { colorMode: 'dark', ... }
    │
    └── tenant_country (MX)  inherits=null (own)
          module_modes: todos 'custom'
          custom_modules: { branding, theme, ... todos los 7 }
          status: 'draft', draft_step: 3
```

Mobile pide HN → resuelve theme de `custom_modules`, los otros 6 módulos vienen
recursivamente de CR (que a su vez los toma de base).

Mobile pide MX → ERROR si está en `draft`. Solo cuando `status='active'`
(después de completar el wizard) responde con su `custom_modules` plano.

---

## 7. Queries útiles

**Ver `base_config` del tenant:**

```sql
SELECT jsonb_pretty(base_config) FROM tenant WHERE code = 'puntoentrega';
```

**Ver `module_modes` y qué tiene custom cada país:**

```sql
SELECT c.iso_2,
       jsonb_pretty(tc.module_modes)   AS modes,
       jsonb_object_keys(tc.custom_modules) AS custom_keys
FROM tenant_country tc
JOIN country c       ON c.id = tc.country_id
JOIN tenant t        ON t.id = tc.tenant_id
WHERE t.code = 'puntoentrega';
```

**Países que tienen al menos un módulo en `custom`:**

```sql
SELECT c.iso_2, jsonb_object_keys(tc.custom_modules) AS module
FROM tenant_country tc
JOIN country c ON c.id = tc.country_id
WHERE tc.custom_modules != '{}'::jsonb;
```

**Cambiar el modo de un módulo específico (ej: hacer que HN use override-base
en theme, sin tocar otros módulos):**

```sql
UPDATE tenant_country
SET module_modes = module_modes || '{"theme":"override-base"}'::jsonb,
    custom_modules = custom_modules - 'theme'   -- limpiar el custom anterior
WHERE id = '<hn-uuid>';
```

**Limpiar el override de un módulo (volver a heredar):**

```sql
UPDATE tenant_country
SET module_modes = module_modes || '{"branding":"inherit"}'::jsonb,
    custom_modules = custom_modules - 'branding'
WHERE id = '<id>';
```

**Países en draft que quedaron a medias (status:'draft' por más de 7 días):**

```sql
SELECT c.iso_2, tc.draft_step, tc.total_steps, tc.updated_at
FROM tenant_country tc
JOIN country c ON c.id = tc.country_id
WHERE tc.status = 'draft'
  AND tc.updated_at < NOW() - INTERVAL '7 days';
```

---

## 8. Consistencia: invariantes que el código debe garantizar

1. **`module_modes` siempre tiene los 7 módulos.** Si falta uno, asumir
   `'inherit'`. La migración v6 setea esto por defecto.
2. **`custom_modules` SOLO contiene los módulos donde `module_modes[mod] === 'custom'`.**
   Si `module_modes.theme = 'inherit'` pero `custom_modules.theme` existe,
   limpiar el custom (se ignoraría igual, pero ensucia).
3. **`inherits_from` valido**:
   - `null` → modo own
   - `'base'` → literal
   - cualquier otra string → debe ser un `tenant_country.id` UUID válido del
     mismo `tenant_id`
4. **No ciclos**: A no puede heredar de B si B (directa o indirectamente)
   hereda de A. Validar antes de UPDATE.
5. **`status='active'` requiere config completa**: si `inherits_from=null`,
   todos los `custom_modules` deben tener valor. Si hereda, basta con que el
   padre exista y esté `active`.
6. **`is_primary` único por tenant**: solo un país puede tener `is_primary=true`.
   Forzar con UPDATE en `setPrimaryCountry`.

---

## 9. Por qué JSONB y no tablas relacionales

Tomamos la decisión de usar **JSONB consolidado** para `base_config` y
`custom_modules` en vez de tablas separadas (`identity`, `visual_tema`,
`login_module`, etc.). Razones:

| Razón | JSONB | Tablas relacionales |
|---|---|---|
| Forma flexible (agregar campos a un módulo) | ✓ sin migración | ✗ ALTER TABLE |
| Lectura en bloque para mobile bootstrap | ✓ una query | ✗ múltiples JOINs |
| Edición transaccional (commit todo el módulo a la vez) | ✓ un UPDATE | ✗ varios UPDATEs |
| Queries cross-tenant (¿qué tenants tienen color rojo?) | ✗ requiere índice GIN o expresión | ✓ trivial |
| Validación de tipos en BD | ✗ depende de app | ✓ constraints |
| Tamaño: cientos de tenants × KBs cada uno | ✓ ok hasta GBs | ✓ ok |

Como el sistema casi nunca queryea campos individuales de los módulos (siempre
los lee completos para servir a mobile), JSONB gana. Si alguna vez se necesita
una query cross-tenant frecuente, se agrega un índice GIN o se promueve ese
campo a columna.

```sql
-- Ejemplo: índice si querés buscar por color primario
CREATE INDEX idx_branding_primary
  ON tenant (((base_config->'branding'->>'primaryColor')));

-- Query usando el índice
SELECT code FROM tenant
WHERE base_config->'branding'->>'primaryColor' = '#E8175D';
```

---

## 10. Resumen de los archivos clave

| Archivo | Rol |
|---|---|
| `backend/migrations/001_tenants.sql` | DDL completo del schema (15 tablas + seeds) |
| `backend/src/db.js` | `saveTenant()`, `getTenant()`, `listTenants()` — decomposición y reconstrucción |
| `backend/src/routes/admin.js` | endpoints `/admin/tenant/:code` (POST/GET/list) |
| `backend/src/routes/mobile.js` | `GET /mobile/bootstrap` — futuro: usar `resolveCountry()` |
| `web/src/store/useTenantStore.js` | shape plano del store + persist localStorage + acciones |
| `web/src/hooks/useAutoSave.js` | debounce 1.5s + POST automático |
| `web/src/hooks/useSaveToServer.js` | publicación manual (botón explícito) |
