# SaaS Subscriptions & Plans — Implementation Guide

> **Migration Note**: This system replaces the legacy license system with a unified, SaaS-ready subscription model. All legacy license endpoints have been removed.

## Estructura

El sistema multi-tenant ahora soporta **planes de suscripción por tenant**, listo para integrar pagos (Stripe, PayPal, etc.).

### Modelos
- **`Subscription`**: tabla que vincula cada tenant a un plan (free/basic/pro/enterprise) con estado, período de facturación y proveedor de pagos.
- **`plans.js`**: definición centralizada de features, límites y precios por plan.

### Middlewares & Controllers
- **`featureGateMiddleware.js`**: protege endpoints basado en plan (`requireFeature('api_access')`).
- **`subscriptionController.js`**: GET/POST subscripciones, upgrade, cancelación, uso/métricas.

### Rutas
- `GET /api/tenants/:slug/billing/plans`: listar planes disponibles
- `GET /api/tenants/:slug/billing/subscription`: suscripción actual del tenant
- `GET /api/tenants/:slug/billing/usage`: uso vs límites del plan
- `POST /api/tenants/:slug/billing/upgrade`: upgrade plan (admin)
- `POST /api/tenants/:slug/billing/cancel`: cancelar suscripción (admin)

### Gestión de Tenants
- `POST /api/tenants`: crear nuevo tenant (con suscripción free por defecto)
- `GET /api/tenants`: listar todos los tenants (con paginación)
- `GET /api/tenants/:slug/details`: detalles completos del tenant
- `GET /api/tenants/:slug/stats`: estadísticas de uso (usuarios, reclamos, límites)
- `PUT /api/tenants/:slug`: actualizar información del tenant
- `DELETE /api/tenants/:slug`: eliminar tenant (con validación de usuarios activos)

### Gestión de API Keys
- `GET /api/tenants/:slug/api-keys`: listar API keys del tenant
- `POST /api/tenants/:slug/api-keys`: crear nueva API key (retorna plaintext una vez)
- `GET /api/tenants/:slug/api-keys/:id`: ver detalles de una key
- `GET /api/tenants/:slug/api-keys/:id/stats`: estadísticas de uso de la key
- `PUT /api/tenants/:slug/api-keys/:id`: actualizar label/scopes
- `DELETE /api/tenants/:slug/api-keys/:id`: revocar (soft delete)
- `DELETE /api/tenants/:slug/api-keys/:id/permanent`: eliminar permanentemente
- `POST /api/tenants/:slug/api-keys/:id/activate`: reactivar key revocada

---

## Planes disponibles

Definidos en `config/plans.js`:

| Plan       | Usuarios | Reclamos/mes | Storage | API | Email Support | Rate Limit | Precio  |
|-----------|----------|--------------|---------|-----|----------------|-----------|---------|
| **free**      | 2        | 100          | 1 GB    | ❌  | ❌  | 30 req/min  | $0      |
| **basic**     | 5        | 1,000        | 10 GB   | ❌  | ✅  | 60 req/min  | $49/mes |
| **pro**       | 20       | 10,000       | 100 GB  | ✅  | ✅  | 200 req/min | $149/mes|
| **enterprise**| ∞        | ∞            | ∞       | ✅  | ✅  | 1000 req/min| Custom  |

Personaliza en `config/plans.js`.

---

## Cómo usar: Ejemplo 1 — Proteger feature por plan

```javascript
// Proteger acceso a API keys solo en plans pro+
const requireFeature = require('../middlewares/featureGateMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

app.post('/api/tenants/:slug/api-keys', 
  tenantMiddleware, 
  requireFeature('api_access'), 
  apiKeyController.create
);
```

Si el tenant está en plan **free** o **basic**, retorna:
```json
{
  "message": "Feature \"api_access\" no disponible en el plan free.",
  "upgrade_url": "/api/billing/upgrade"
}
```

---

## Cómo usar: Ejemplo 2 — Rate limiting dinámico por plan

En `config/db.js`, el rate limiter lee el plan del tenant:

```javascript
// Pseudocódigo en rateLimitTenant middleware
const subscription = await Subscription.findOne({
  where: { tenant_id: req.tenant.id }
});
const limit = getRateLimit(subscription); // 30, 60, 200, 1000 según plan
```

**Beneficio**: free plans obtienen 30 req/min; pro plans obtienen 200 automáticamente.

---

## Integración con Stripe (ejemplo)

En `subscriptionController.js`, el método `upgradePlan` puede ser llamado por:

1. **Dashboard de usuario**: botón "Upgrade to Pro" → POST `/api/tenants/:slug/billing/upgrade`
2. **Webhook de Stripe**: cuando pago es confirmado
   ```javascript
   // Webhook Stripe
   app.post('/webhooks/stripe', (req, res) => {
     if (req.body.type === 'checkout.session.completed') {
       const sessionId = req.body.data.object.id;
       // Buscar tenant en BD por sessionId
       // Llamar upgradePlan(tenantId, 'pro', sessionId)
     }
   });
   ```

3. **API Admin**: crear/upgradear subscription para un tenant manualmente.

---

## Migración desde sistema de licencias de User

**Actual (User.js)**:
```javascript
license_type: 'premium',
license_expiration_date: '2025-12-31',
```

**Nuevo (SaaS)**:
```javascript
// En table subscriptions
plan_name: 'pro',
billing_cycle_end: '2025-12-31',
```

**Cambios necesarios**:
1. Quitar campos de `User.js` (ya no necesarios).
2. Reemplazar lógica de licencia en controllers con checks de `subscription.plan_name`.
3. Crear migración Sequelize (cuando sea momento de producción).

---

## Métodos útiles en `config/plans.js`

```javascript
// Obtener features de un plan
getPlanFeatures('pro') // → { max_users: 20, api_access: true, ... }

// Verificar si tenant tiene feature
hasFeature(subscription, 'api_access') // → true/false

// Obtener rate limit del plan
getRateLimit(subscription) // → 200
```

---

## Seeding y plan por defecto

Ambos scripts (`seed.js`, `seed-default.js`) crean una suscripción **free** con validez 1 año:

```javascript
await Subscription.create({
  tenant_id: tenant.id,
  plan_name: 'free',
  status: 'active',
  billing_cycle_start: now,
  billing_cycle_end: new Date(now.getFullYear() + 1, ...),
  auto_renew: true
});
```

---

## Próximos pasos

1. **Stripe/PayPal Integration**:
   - Crear endpoint `POST /billing/checkout` que inicia session de pago.
   - Registrar webhook para escuchar `payment_intent.succeeded`.
   - Llamar `upgradePlan` con `payment_provider_id` de Stripe.

2. **Metering & Usage Limits**:
   - Ampliar `getUsage()` para trackear consumo en tiempo real.
   - Emitir warnings cuando se acerquen a límites.
   - Pausar claims si se exceden límites en free tier.

3. **Facturación**:
   - Tabla `Invoices` para histórico de pagos.
   - Email con recibos y próxima renovación.
   - Manejo de pagos fallidos (retry, notificaciones).

4. **UI en Angular**:
   - Dashboard de suscripción mostrando plan actual, uso, botones de upgrade.
   - Marketplace de planes con call-to-action.

---

## Seguridad

- **Admin-only** endpoints de subscripción usan `requireTenantRole('admin')`.
- **Feature gates** usan `requireFeature()` para validar plan antes de acción.
- **Rate limiting** se aplica automáticamente según plan.
- Pagos externos (Stripe) validan tokens/signatures en webhooks.

---

Para preguntas o cambios en planes, edita `src/config/plans.js` y reinicia el servidor.
