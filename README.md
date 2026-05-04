# Multi-Tenant Admin Web

Panel de configuración multi-tenant con simulador 3D de teléfono en tiempo real.
Frontend hosteado en GitHub Pages, backend local en PostgreSQL expuesto vía Ngrok.

URL de producción: <https://franco-ml.github.io/-web_multi_tenant/>

---

## Arquitectura

```
GitHub Pages (frontend estático)
        │
        ▼
   Ngrok HTTPS
        │
        ▼
Backend Express (PC local)
        │
        ▼
PostgreSQL en Docker
```

- **Frontend** (`/home/franco019/Mensajeros/web`) — React + Vite + Zustand
- **Backend** (`/home/franco019/Mensajeros/backend`) — Express + pg
- **Mobile** consume `GET /mobile/bootstrap?tenant=<code>&country=<CC>`

---

## Inicio rápido — cada vez que enciendes la PC

### 1. Levantar PostgreSQL

```bash
cd ~/Mensajeros/backend
docker compose up -d
```

### 2. Levantar el backend

```bash
cd ~/Mensajeros/backend
npm start
```

Verifica que responde:
```bash
curl http://localhost:3001/health
# → {"ok":true,"port":3001}
```

### 3. Exponer con Ngrok

```bash
ngrok http 3001
```

Copia la URL HTTPS que aparece (ej. `https://xxxxx.ngrok-free.dev`).

### 4. (Solo si la URL de Ngrok cambió) actualizar GitHub

1. Ve a <https://github.com/Franco-ML/-web_multi_tenant/settings/secrets/actions>
2. Update el secret `VITE_TENANT_API_URL` con la nueva URL de Ngrok
3. Ve a <https://github.com/Franco-ML/-web_multi_tenant/actions> → último run → **Re-run all jobs**

### 5. Desarrollo local del frontend (opcional)

```bash
cd ~/Mensajeros/web
npm run dev
```

Abre <http://localhost:5173>.

---

## Flujo de despliegue

### Cambios al frontend

```bash
cd ~/Mensajeros/web
git add -A
git commit -m "feat: descripción"
git push
```

El workflow `.github/workflows/deploy.yml` se dispara solo y publica a Pages en ~1 min.

### Cambios al backend

```bash
# Ctrl+C en la terminal del backend
npm start  # vuelve a arrancar
```

Ngrok no necesita reiniciarse.

---

## Variables de entorno

### Frontend (`web/.env`)
```env
VITE_TENANT_API_URL=https://xxxxx.ngrok-free.dev
```

En producción, este valor se inyecta desde el secret `VITE_TENANT_API_URL` de GitHub durante el workflow.

### Backend (`backend/.env`)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mensajeros_db
DB_USER=admin
DB_PASSWORD=changeme
CORS_ORIGIN=http://localhost:5173,https://franco-ml.github.io
```

`CORS_ORIGIN` admite múltiples dominios separados por coma.

---

## Estructura de datos

### Config de un tenant (JSON)

```jsonc
{
  "branding":      { "name": "...", "primaryColor": "...", "logoUrl": "..." },
  "theme":         { "colorMode": "light", "light": {...}, "dark": {...} },
  "features":      { "routesEnabled": true, ... },
  "registration":  { "steps": [...] },
  "i18n":          { "defaultLang": "es", "translations": {...} },
  "advanced":      { "apiUrl": "...", "supportWebUrl": "...", "supportPhone": "..." },
  "login":         { "phoneEnabled": true, "emailEnabled": true },
  "countryConfigs": [
    {
      "countryCode": "CR",
      "isPrimary": true,
      "currency": "CRC",
      "language": "es-CR",
      "phonePrefix": "+506",
      "idTypes":   null,    // null → hereda global
      "documents": null
    }
  ]
}
```

- **Config base** (todo menos `countryConfigs`) — heredada por todos los países.
- **Por país** (`countryConfigs[]`) — overrides específicos: locale, idTypes, documents.

### Almacenamiento

| Dónde                                  | Qué                              |
|----------------------------------------|----------------------------------|
| `localStorage['moover-tenant-config']` | Config del tenant activo         |
| `localStorage['moover-draft-{code}']`  | Draft local de cada tenant       |
| PostgreSQL `tenants` table             | Configs publicadas (`config` JSONB) |

Los tenants en localStorage aparecen con badge **LOCAL** en el switcher hasta que se publiquen al backend (botón Exportar → Publicar).

---

## Endpoints del backend

| Método | Ruta                                      | Uso                              |
|--------|-------------------------------------------|----------------------------------|
| GET    | `/health`                                 | Healthcheck                      |
| GET    | `/admin/tenants`                          | Lista de tenants publicados      |
| POST   | `/admin/tenant/:tenantCode`               | Publicar/actualizar config       |
| GET    | `/public/tenant/config?tenantCode=<code>` | Leer config completa             |
| GET    | `/mobile/bootstrap?tenant=<code>&country=<CC>` | Config con merge por país |

---

## Troubleshooting

**El frontend desplegado tira 404 en `/src/main.jsx`**
GitHub Pages está sirviendo el repo en lugar del workflow. Ve a Settings → Pages → Source y elige **GitHub Actions**.

**Recarga en `/branding` da 404**
Asegúrate que el script `build` de `package.json` copia `index.html` a `404.html`. El SPA fallback necesita ese archivo.

**CORS bloquea requests desde GitHub Pages**
Verifica que `CORS_ORIGIN` en `backend/.env` incluye `https://franco-ml.github.io` y reinicia el backend.

**El tenant nuevo desaparece al cambiar a otro**
Es lo esperado mientras no lo publiques al backend. Aparece como **LOCAL** en el switcher si tiene draft local.
