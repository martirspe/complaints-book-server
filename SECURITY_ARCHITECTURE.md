# Arquitectura de Seguridad Multi-Tenant

Documentación completa de la implementación de seguridad multi-tenant en ReclamoFacil.

## 🎯 Objetivo

Garantizar el **aislamiento completo de datos** entre tenants, evitando que un tenant acceda o modifique datos de otro.

## 🏗️ Principios Implementados

### 1. Autenticación Dual

El sistema soporta dos métodos de autenticación:

#### JWT (Para usuarios web)
```javascript
// Header de autenticación
Authorization: Bearer <token>

// Payload del token
{
  id: userId,
  email: "user@example.com",
  role: "admin" | "staff" | "superadmin"
}
```

#### API Keys (Para integraciones)
```javascript
// Header de autenticación
x-api-key: <api_key>

// Metadata de la API key
{
  tenant_id: 1,
  scopes: ["claims:read", "claims:write"],
  active: true
}
```

### 2. Resolución de Tenant

El tenant se resuelve en el siguiente orden de prioridad:

```javascript
// 1. Parámetro de ruta
GET /api/tenants/:slug/claims

// 2. Header x-tenant o x-tenant-slug
x-tenant: empresa-demo

// 3. Subdominio
empresa-demo.reclamofacil.com

// 4. Fallback (solo para rutas públicas)
tenant_slug = "public"
```

Implementado en: `tenantMiddleware.js`

### 3. Cadena de Middlewares

Todas las rutas protegidas siguen esta cadena:

```javascript
router.get('/endpoint',
  authMiddleware,           // 1. Valida JWT o requiere autenticación
  tenantMiddleware,         // 2. Resuelve el tenant
  membershipMiddleware,     // 3. Valida que el usuario pertenezca al tenant
  requireTenantRole('admin'), // 4. Valida el rol dentro del tenant (opcional)
  controller.method
);

// O para API keys + JWT
router.get('/endpoint',
  apiKeyOrJwt,              // 1. Valida API key O JWT
  tenantMiddleware,         // 2. Resuelve el tenant
  membershipMiddleware,     // 3. Valida membresía (solo si es JWT)
  controller.method
);
```

### 4. Roles y Permisos

#### Roles Globales

- **superadmin**: Acceso completo a la plataforma, puede gestionar todos los tenants
  - Crear/eliminar tenants
  - Ver estadísticas globales
  - Acceder a configuración de plataforma

#### Roles por Tenant (tabla `user_tenants`)

- **admin**: Administrador del tenant
  - Gestionar usuarios del tenant
  - Ver/editar configuración del tenant
  - Acceso completo a recursos del tenant
  
- **staff**: Usuario operativo
  - Ver y gestionar reclamos
  - Acceso limitado a configuración

#### Middleware de Validación

```javascript
// superadminMiddleware.js
// Valida que req.user.role === 'superadmin'
// Usado en: crear/eliminar tenants

// requireTenantRole.js
// Valida que user_tenants.role >= rol_requerido
// Usado en: operaciones específicas del tenant
```

### 5. Scoping de Recursos

Todos los recursos están aislados por `tenant_id`:

#### Modelos con tenant_id

- ✅ `Claim` - Reclamos
- ✅ `Customer` - Clientes
- ✅ `Tutor` - Tutores/Representantes legales
- ✅ `ApiKey` - API keys de integración
- ✅ `Subscription` - Suscripciones y planes
- ✅ `UserTenant` - Relación usuario-tenant

#### Modelos Globales (sin tenant_id)

- `User` - Usuarios (pueden pertenecer a múltiples tenants)
- `Tenant` - Tenants/Organizaciones
- `DocumentType` - Catálogo de tipos de documento
- `ClaimType` - Catálogo de tipos de reclamo
- `ConsumptionType` - Catálogo de tipos de consumo
- `Currency` - Catálogo de monedas

### 6. Validación en Controladores

Todos los controladores validan `tenant_id` en las consultas:

```javascript
// ❌ INCORRECTO - Sin filtro de tenant
const customer = await Customer.findByPk(id);

// ✅ CORRECTO - Con filtro de tenant
const tenantId = req.tenant?.id;
if (!tenantId) {
  return res.status(400).json({ message: 'Tenant context requerido' });
}
const customer = await Customer.findOne({
  where: { id, tenant_id: tenantId }
});
```

#### Controladores Actualizados

- ✅ `claimController.js` - Todas las operaciones filtran por tenant_id
- ✅ `customerController.js` - Todas las operaciones filtran por tenant_id
- ✅ `tutorController.js` - Todas las operaciones filtran por tenant_id
- ✅ `apiKeyController.js` - Todas las operaciones filtran por tenant_id
- ✅ `subscriptionController.js` - Todas las operaciones filtran por tenant_id
- ✅ `userController.js` - Lista usuarios solo del tenant actual

### 7. Uploads con Namespacing

Los archivos se guardan en carpetas separadas por tenant:

```
uploads/
  ├── empresa-demo/
  │   ├── logos/
  │   │   └── uuid.png
  │   └── claims/
  │       └── uuid.pdf
  ├── otro-tenant/
  │   ├── logos/
  │   └── claims/
  └── default/
```

Implementado en: `config/multer.js`

```javascript
const tenantSlug = (
  req.params?.slug || 
  req.tenant?.slug || 
  req.apiKey?.Tenant?.slug || 
  'default'
).toString();

const targetPath = path.join(uploadPath, tenantSlug);
```

### 8. Rate Limiting por Tenant

El rate limiting se aplica por tenant + IP:

```javascript
// Redis key
rl:${tenantSlug}:${req.ip}

// Configuración
WINDOW_SECONDS = 900  (15 minutos)
MAX_REQUESTS = 300    (por ventana)

// Headers de respuesta
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 600
```

Implementado en: `middlewares/rateLimitTenant.js`

## 🛡️ Rutas y Seguridad

### Rutas Públicas (sin autenticación)

```javascript
// Branding público de un tenant
GET /api/tenants/:slug
GET /api/tenants/:slug/logo

// Catálogos globales
GET /api/document-types
GET /api/claim-types
GET /api/consumption-types
GET /api/currencies
```

### Rutas de Superadmin

```javascript
// Solo accesibles con role=superadmin
POST   /api/tenants              // Crear tenant
GET    /api/tenants              // Listar todos los tenants
DELETE /api/tenants/:slug        // Eliminar tenant
```

### Rutas de Tenant Admin

```javascript
// Requieren: auth + tenant + membership + role=admin
GET    /api/tenants/:slug/details    // Ver detalles del tenant
GET    /api/tenants/:slug/stats      // Estadísticas del tenant
PUT    /api/tenants/:slug            // Actualizar tenant
POST   /api/tenants/:slug/logo       // Subir logo

// Gestión de usuarios del tenant
GET    /api/tenants/:slug/users      
POST   /api/tenants/:slug/users      
PUT    /api/tenants/:slug/users/:id  
DELETE /api/tenants/:slug/users/:id  
```

### Rutas de Recursos del Tenant

```javascript
// Requieren: apiKeyOrJwt + tenant + membership
GET    /api/tenants/:slug/customers
POST   /api/tenants/:slug/customers
GET    /api/tenants/:slug/customers/:id
PUT    /api/tenants/:slug/customers/:id
DELETE /api/tenants/:slug/customers/:id

// Similar para: tutors, claims, api-keys, subscriptions
```

## 🔍 Validaciones de Seguridad

### 1. Validación de Membresía

```javascript
// membershipMiddleware.js
const membership = await UserTenant.findOne({
  where: { 
    user_id: req.user.id,
    tenant_id: req.tenant.id 
  }
});

if (!membership) {
  return res.status(403).json({ 
    message: 'No tienes acceso a este tenant' 
  });
}
```

### 2. Validación de Relaciones Cross-Tenant

```javascript
// Ejemplo: al crear un claim
const customer = await Customer.findOne({
  where: { id: customer_id, tenant_id: tenantId }
});

if (!customer) {
  return res.status(404).json({ 
    message: 'Cliente no encontrado en este tenant' 
  });
}
```

### 3. Validación de Unicidad por Tenant

```javascript
// Ejemplo: email de customer debe ser único por tenant
const existing = await Customer.findOne({
  where: { email, tenant_id: tenantId }
});

if (existing) {
  return res.status(409).json({ 
    message: 'Este correo ya está registrado' 
  });
}
```

## 🧪 Casos de Prueba

### Test 1: Aislamiento de Datos

```javascript
// Setup
const tenantA = await createTenant('tenant-a');
const tenantB = await createTenant('tenant-b');
const customerA = await createCustomer(tenantA.id);
const customerB = await createCustomer(tenantB.id);

// Test
const response = await request
  .get(`/api/tenants/tenant-a/customers/${customerB.id}`)
  .set('Authorization', tokenTenantA);

// Assertion
expect(response.status).toBe(404); // No debe encontrarlo
```

### Test 2: Validación de API Key Scope

```javascript
// Setup
const apiKeyReadOnly = await createApiKey(tenant.id, ['claims:read']);

// Test
const response = await request
  .post(`/api/tenants/tenant-a/claims`)
  .set('x-api-key', apiKeyReadOnly)
  .send(claimData);

// Assertion
expect(response.status).toBe(403); // Scope insuficiente
```

### Test 3: Rate Limiting por Tenant

```javascript
// Test
for (let i = 0; i < 301; i++) {
  await request
    .get(`/api/tenants/tenant-a/claims`)
    .set('Authorization', token);
}

const lastResponse = await request
  .get(`/api/tenants/tenant-a/claims`)
  .set('Authorization', token);

// Assertion
expect(lastResponse.status).toBe(429);
expect(lastResponse.headers['retry-after']).toBeDefined();
```

## 📊 Diagrama de Flujo de Autenticación

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ apiKeyOrJwt /    │
│ authMiddleware   │◄─── Valida token o API key
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ tenantMiddleware │◄─── Resuelve tenant (slug/header/subdomain)
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ membershipMiddleware │◄─── Valida UserTenant (solo JWT)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ requireTenantRole    │◄─── Valida role en UserTenant
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│   Controller     │◄─── Filtra queries por tenant_id
└──────────────────┘
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Ejecutar migraciones de base de datos
- [ ] Asignar tenant_id a registros existentes
- [ ] Verificar que no hay registros huérfanos
- [ ] Backup completo de base de datos
- [ ] Testing de aislamiento en staging

### Deployment

- [ ] Desplegar nuevos middlewares
- [ ] Desplegar controladores actualizados
- [ ] Desplegar modelos actualizados
- [ ] Reiniciar servidores
- [ ] Limpiar cache de Redis

### Post-Deployment

- [ ] Smoke tests de endpoints críticos
- [ ] Verificar logs de errores
- [ ] Monitorear métricas de rate limiting
- [ ] Validar uploads se guardan en carpetas correctas
- [ ] Confirmar aislamiento entre tenants

## 📖 Referencias

- [Guía de Migración](./MIGRATION_GUIDE.md)
- [Documentación de API Keys](./SUBSCRIPTIONS.md#api-keys)
- [Testing Guide](./TESTING_GUIDE.md)

## 🔐 Mejores Prácticas

1. **Nunca uses `findByPk` sin validar tenant**: Siempre usa `findOne` con `tenant_id` en WHERE
2. **Valida relaciones cross-tenant**: Al crear relaciones (claim→customer), valida que ambos pertenezcan al mismo tenant
3. **No confíes solo en middleware**: Los controladores deben validar `req.tenant?.id`
4. **Logs de auditoría**: Registra todas las operaciones multi-tenant para auditoría
5. **Testing exhaustivo**: Prueba todos los endpoints con diferentes tenants
6. **Monitoreo**: Alerta si detectas intentos de acceso cross-tenant

## ⚠️ Vulnerabilidades Comunes

### ❌ IDOR (Insecure Direct Object Reference)

```javascript
// Vulnerable
GET /api/tenants/tenant-a/customers/123
// Un atacante podría cambiar el ID y acceder a otro customer

// Protección
const customer = await Customer.findOne({
  where: { id: req.params.id, tenant_id: req.tenant.id }
});
```

### ❌ Mass Assignment

```javascript
// Vulnerable
await Customer.create(req.body);
// Un atacante podría enviar { tenant_id: 999 }

// Protección
await Customer.create({
  ...req.body,
  tenant_id: req.tenant.id // Forzar tenant del contexto
});
```

### ❌ SQL Injection en tenant_id

```javascript
// Vulnerable (si se usa raw SQL)
SELECT * FROM customers WHERE tenant_id = ${req.tenant.id}

// Protección (usar Sequelize ORM)
Customer.findAll({ where: { tenant_id: req.tenant.id } });
```

## 📞 Contacto

Para reportar vulnerabilidades de seguridad, contacta al equipo de seguridad.
