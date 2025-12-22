# API REST multi-tenant de Libro de Reclamaciones

API para gestionar reclamos con soporte multi-tenant, RBAC y autenticación híbrida (JWT + API keys). Tecnología: Node.js, Express, Sequelize, MySQL y Redis.

## Características clave
- Multi-tenant: resolución de tenant por subdominio, header `x-tenant`/`x-tenant-slug` o parámetro de ruta; pertenencia vía `UserTenant`.
- Autenticación: JWT para usuarios de app; API keys con `scopes` para integraciones; middleware híbrido (JWT o API key) en rutas de claims/integraciones.
- Seguridad: rate limiting por tenant (Redis), auditoría por request, CORS configurable, validación de uploads con multer.
- Catálogos básicos (document types, claim types, consumption types, currencies) y branding por tenant.
- Notificaciones por tenant: los emails copian en BCC el `notifications_email` del tenant; si falta, usa `DEFAULT_TENANT_NOTIFICATIONS_EMAIL` y luego `defaultTenant.js`.
- Seeds: script completo (incluye API key) y seed mínimo.

## Requisitos
- Docker Desktop (recomendado) o Node 18+, MySQL 8 y Redis 7.

## Arranque rápido con Docker (monorepo)
Desde la raíz del repositorio:
```bash
docker compose build
docker compose up
```
Servicios: API en http://localhost:3000, Angular en http://localhost:4200, MySQL en localhost:3306 (DB `complaints_book`, root sin password), Redis en localhost:6379. Los uploads se montan en `uploads/`.

## Configuración local (sin Docker)
```bash
npm install
npm run dev   # nodemon
```
Necesitas MySQL y Redis levantados y el archivo `.env` configurado.

## Variables de entorno mínimas
```
PORT=3000
DB_HOST=localhost
DB_NAME=complaints_book
DB_USER=cb_user
DB_PASSWORD=cb_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=changeme
ALLOWED_ORIGINS=http://localhost:4200
DEFAULT_TENANT_SLUG=default
FORCE_HTTPS=false
DEFAULT_TENANT_NOTIFICATIONS_EMAIL=soporte@example.com
```
Opcionales: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_*` (SMTP), `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.

Overrides opcionales del tenant por defecto (fallback):
- `DEFAULT_TENANT_COMPANY_BRAND`, `DEFAULT_TENANT_COMPANY_NAME`, `DEFAULT_TENANT_COMPANY_RUC`
- `DEFAULT_TENANT_PRIMARY_COLOR`, `DEFAULT_TENANT_ACCENT_COLOR`
- `DEFAULT_TENANT_LOGO_LIGHT_PATH`, `DEFAULT_TENANT_LOGO_DARK_PATH`, `DEFAULT_TENANT_FAVICON_PATH`
- `DEFAULT_TENANT_NOTIFICATIONS_EMAIL` (email por defecto para notificaciones del tenant)

Nota: si no defines estos, el sistema usa los valores por defecto de `src/config/defaultTenant.js`. No son obligatorios.

## Seeds
- Completo (catálogos + tenant + admin + API key con scopes `claims:read,claims:write`): `npm run seed`
- Minimal (catálogos + tenant + admin, sin API key): `npm run seed:default`

Credenciales por defecto: admin `admin@example.com` / `admin123` (sobre-escribibles por env). El seed completo imprime la API key una sola vez: guárdala.

## Autenticación y tenancy
- Tenancy: usar ruta `/tenants/:slug`, header `x-tenant`/`x-tenant-slug` o subdominio (`slug.api.local`). El JWT incluye `tenant_slug` y se valida contra el tenant resuelto.
- Roles: `admin` y `staff` por tenant (tabla `user_tenants`); middleware `requireTenantRole` protege rutas de administración.
- API keys: hash en BD; header `x-api-key`. Scopes disponibles: `claims:read`, `claims:write`, `branding:read` (extensible). Actualiza `last_used_at` en cada request.
- Híbrido: rutas de claims y de integraciones aceptan JWT o API key (`apiKeyOrJwt`); se aplica rate limit por tenant.
- Auditoría: middleware registra método, ruta, usuario/API key y respuesta.

## Endpoints principales (resumen)
- Catálogos públicos: `GET /api/document_types`, `GET /api/consumption_types`, `GET /api/claim_types`, `GET /api/currencies`.
- Auth usuarios: `POST /api/users/login` (JWT), CRUD de usuarios con RBAC y pertenencia de tenant.
- Tenants (admin JWT): CRUD completo en `/api/tenants` - crear, listar, actualizar, eliminar tenants; estadísticas de uso por tenant.
- Claims (híbrido JWT o API key): `GET/POST /api/tenants/:slug/claims`, `GET/PUT/DELETE /api/tenants/:slug/claims/:id`, flujos de asignación/resolución según rol.
- API keys (admin JWT): CRUD completo en `/api/tenants/:slug/api-keys` - crear, listar, actualizar, revocar, reactivar, eliminar permanentemente; estadísticas de uso.
- Suscripciones (SaaS): `GET /api/tenants/:slug/billing/plans`, `GET /billing/subscription`, `GET /billing/usage`, `POST /billing/upgrade` (admin), `POST /billing/cancel` (admin).
- Integraciones (API key con scopes): `POST /api/integrations/:slug/claims` (crear reclamo), `GET /api/integrations/:slug/claims/:id`.
- Branding: `GET /api/tenants/:slug/branding` y `GET /api/tenants/default/branding` devuelven logos/colores del tenant (URLs absolutas). El endpoint legacy público de tenant fue eliminado.

### Ejemplo rápido con API key
```bash
# Crear reclamo vía integración usando API key sembrada
curl -X POST http://localhost:3000/api/integrations/default/claims \
  -H "x-api-key: <API_KEY_IMPRESA_EN_SEED>" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"consumption_type_id":1,"claim_type_id":1,"description":"Ejemplo"}'
```

## Branding y despliegue
- Para URLs HTTPS forzadas en branding, define `NODE_ENV=production` o `FORCE_HTTPS=true`.
- Activos por defecto se sirven desde `assets/default-tenant` (logo-light, logo-dark, favicon). Los logos subidos por tenants viven en `uploads/logos` y los adjuntos de reclamos en `uploads/claims`. Puedes sobreescribir rutas con `DEFAULT_TENANT_*` o usar URLs públicas/CDN.
- Los correos de notificación usan `notifications_email` del tenant; de no existir, caen en `DEFAULT_TENANT_NOTIFICATIONS_EMAIL` y luego en el valor de `defaultTenant.notificationsEmail`.

## Salud y monitoreo
- `GET /health` retorna estado de base de datos.
- Rate limiting y cache usan Redis; revisa métricas en tu instancia de Redis.