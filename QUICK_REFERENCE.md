# 📚 Quick Reference - Migración de Licencias Completada

## 🎯 En 30 segundos

**¿Qué pasó?**  
La lógica antigua de licencias (`licenseController.js`) fue consolidada en el nuevo sistema de suscripciones (`subscriptionController.js`) y los archivos legacy ya fueron eliminados.

- **¿Qué cambió?**  
- ❌ Licencias por usuario → ✅ Suscripciones por tenant
- ❌ Dos archivos redundantes → ✅ Un controller consolidado
- ❌ Sin feature gates → ✅ `requireFeature()` middleware
- ❌ Sin metering → ✅ `getUsage()` endpoint
- 🔔 Notificaciones por tenant: los correos BCC usan `notifications_email` del tenant; si falta, caen en `DEFAULT_TENANT_NOTIFICATIONS_EMAIL` y luego en `defaultTenant.js`.
- 🖼️ Branding por defecto servido desde `assets/default-tenant` (logo-light, logo-dark, favicon); los logos subidos por tenants viven en `uploads/logos`.

**¿Qué sigue funcionando?**  
✅ Todo. El endpoint legacy `/api/license/:userId` sigue activo desde `subscriptionController`.

---

## 📍 Dónde encontrar qué

| Necesidad | Ubicación | Archivo |
|-----------|-----------|---------|
| Lógica de suscripción | Controller | `src/controllers/subscriptionController.js` |
| Rutas de suscripción | Routes | `src/routes/subscriptionRoutes.js` |
| Definición de planes | Config | `src/config/plans.js` |
| Proteger feature | Middleware | `src/middlewares/featureGateMiddleware.js` |
| Modelos | Data | `src/models/Subscription.js` |
| Documentación | Docs | `SUBSCRIPTIONS.md` |

---

## 🚀 Endpoints Clave

### Públicos
```
GET /api/tenants/:slug/billing/plans
GET /api/tenants/:slug/billing/subscription
GET /api/tenants/:slug/billing/usage
```

### Admin-only
```
# Suscripciones
POST /api/tenants/:slug/billing/upgrade
POST /api/tenants/:slug/billing/cancel

# Tenants
POST /api/tenants
GET /api/tenants
GET /api/tenants/:slug/details
GET /api/tenants/:slug/stats
PUT /api/tenants/:slug
DELETE /api/tenants/:slug

# API Keys
GET /api/tenants/:slug/api-keys
POST /api/tenants/:slug/api-keys
GET /api/tenants/:slug/api-keys/:id
GET /api/tenants/:slug/api-keys/:id/stats
PUT /api/tenants/:slug/api-keys/:id
DELETE /api/tenants/:slug/api-keys/:id
DELETE /api/tenants/:slug/api-keys/:id/permanent
POST /api/tenants/:slug/api-keys/:id/activate
```

---

## 💡 Cómo usar

### 1. Verificar plan de un user
```javascript
const response = await fetch('/api/tenants/default/license/1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { active, plan, features } = await response.json();
```

### 2. Proteger endpoint por feature
```javascript
const requireFeature = require('../middlewares/featureGateMiddleware');

app.post('/api-keys', requireFeature('api_access'), createApiKey);
```

### 3. Obtener información de plan
```javascript
const { getPlanFeatures } = require('./config/plans');
const features = getPlanFeatures('pro');
console.log(features.api_access); // true
```

### 4. Chequear uso
```javascript
const response = await fetch('/api/tenants/default/billing/usage');
const { usage, warnings } = await response.json();
if (warnings.claims_approaching_limit) {
  // Mostrar upgrade dialog
}
```

---

## 📖 Documentación

1. **SUBSCRIPTIONS.md** - Guía completa (40% del contenido)
2. **MIGRATION_SUMMARY.md** - Cambios técnicos
3. **VERIFICATION_REPORT.md** - Testing y validación
4. **TESTING_GUIDE.md** - Cómo testear
5. **CLEANUP_GUIDE.md** - Paso a paso para eliminar archivos
6. **CONSOLIDATION_SUMMARY.md** - Resumen visual

---

## ❓ FAQ Rápido

**P: ¿Dónde está licenseController.js?**  
R: Fue eliminado. Toda la funcionalidad vive en `subscriptionController.checkUserSubscription()`.

**P: ¿Se perdió algún dato?**  
R: No. Todas las funcionalidades fueron migradas. Los campos `license_*` de User fueron reemplazados por `Subscription`.

**P: ¿Qué pasó con el endpoint /license/:userId?**  
R: Fue eliminado. Usa `/billing/subscription` y `/billing/usage` para obtener información de suscripción.

**P: ¿Cómo agrego un nuevo plan?**  
R: Edita `src/config/plans.js` y agrega una entrada en el objeto `PLANS`.

**P: ¿Cómo protejo un endpoint?**  
R: Usa `requireFeature('feature_name')` middleware.

**P: ¿Cómo integro Stripe?**  
R: El webhook de Stripe llamará a `upgradePlan()` cuando un pago sea confirmado.

---

## ✅ Status

- Consolidación: ✅ COMPLETA
- Documentación: ✅ COMPLETA
- Testing: ✅ READY
- Limpieza: ⏳ PENDIENTE (opcional)

---

## 🎓 Aprende más

```bash
# Quick start
cat SUBSCRIPTIONS.md

# Técnico
cat MIGRATION_SUMMARY.md

# Testing
cat TESTING_GUIDE.md

# Limpieza
cat CLEANUP_GUIDE.md
```

---

**Última actualización**: 2025-12-20  
**Versión**: 1.0  
**Estado**: Producción-Ready ✅
