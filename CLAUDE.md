# Mensajeros Config — Panel multi-tenant

Frontend del panel admin para apps de mensajería. Permite a cada empresa (tenant) configurar marca, módulos, países y métodos de pago. Hay un simulador 3D de teléfono que previsualiza los cambios en tiempo real.

## Stack

- React 18 + Vite (JavaScript, no TypeScript)
- Zustand para estado (con persist en localStorage)
- Framer Motion para animaciones
- Three.js + React Three Fiber para el simulador 3D
- React Router 6
- **Estilos: inline styles únicamente** (no Tailwind, no CSS modules)

## Setup inicial

1. Clonar el repo y entrar a la carpeta `web/`.
2. Copiar `.env.example` a `.env`.
3. El `VITE_TENANT_API_URL` debe apuntar al backend remoto vía ngrok (le preguntás a Franco la URL actual). Si va a correr backend local, usar `http://localhost:3001`.
4. `npm install`
5. `npm run dev` → arranca en `http://localhost:5173`.

El backend NO está en este repo. Vive en `../backend/` (Express + PostgreSQL) y corre por separado. El frontend solo le hace fetch.

## Actualizar a la última versión

```bash
git pull origin main
npm install   # solo si cambió package.json
```

No hay base de datos local que migrar — todo el estado del frontend persiste en `localStorage` del navegador. Si después de un pull algo se ve raro, abrir DevTools → Application → Local Storage y borrar las keys `mensajeros-config-*` y `moover-*`.

## Deploy

GitHub Pages se actualiza solo al pushear a `main` (workflow de GitHub Actions). No hay deploy manual.

## Estructura clave

- `src/pages/` — una página por ruta del router
- `src/store/useTenantStore.js` — store principal del tenant (configuración persistida)
- `src/store/useAuthStore.js` — sesión del usuario
- `src/hooks/useUserRole.js` — niveles: L1/L2 = sistema, L10 = super admin tenant, L11 = admin país
- `src/hooks/useTenantManager.js` — CRUD de tenants y drafts locales
- `src/components/simulator/` — simulador 3D del teléfono
- `src/router/index.jsx` — definición de rutas y `RootRedirect`

## Roles y rutas

| Nivel | Quién | Ruta inicial |
|-------|-------|--------------|
| L1/L2 | Admin del sistema | `/system/tenants` |
| L10   | Super Admin Tenant | `/brand` (o `/onboarding` si no tiene tenant) |
| L11   | Admin País | `/brand` con país asignado |

## Convenciones

- Idioma de UI y comentarios: **Español** (acentos correctos siempre)
- Sin comentarios redundantes que expliquen QUÉ hace el código — solo el PORQUÉ si no es obvio
- Confirmar con el usuario antes de cambios destructivos (rm, force push, drop, etc.)
- Branch principal: `main`. No hay PRs ni feature branches estrictos — commits directos a main.
- Co-Authored-By en commits hechos con Claude
