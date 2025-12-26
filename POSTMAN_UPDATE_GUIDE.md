# 📋 Actualización de Colección Postman - Seguridad Multi-Tenant

**Fecha**: Diciembre 25, 2025  
**Versión**: 2.0 - Multi-Tenant Secured  
**Estado**: ✅ Completada

---

## 🎯 Cambios Realizados

### 1. **Actualización de Variables**

#### Nuevas Variables Agregadas

```javascript
{
  "tenantSlugB": "tenant-b",  // Segundo tenant para tests de aislamiento
  "superadminToken": "<superadmin_jwt_token>"  // Token de superadmin
}
```

**Propósito**: Facilitar pruebas de seguridad multi-tenant y validar aislamiento entre tenants.

---

### 2. **Reorganización de Rutas de Tenants**

Se han segregado las rutas de tenant en **3 niveles de acceso**:

#### 🔓 **PUBLIC (Sin autenticación)**
```
GET /api/tenants/:slug              # Información pública del tenant
GET /api/tenants/:slug/logo         # Logo público
```

**Quién accede**: Cualquiera (público)

#### 🔒 **SUPERADMIN ONLY**
```
POST /api/tenants                   # Crear tenant
GET /api/tenants                    # Listar TODOS los tenants
DELETE /api/tenants/:slug           # Eliminar tenant
```

**Quién accede**: Solo usuarios con `role = 'superadmin'`

**Validación**: El header `Authorization` debe contener `{{superadminToken}}`

#### 🔐 **TENANT ADMIN (Self-Management Only)**
```
GET /api/tenants/:slug/details      # Detalles propios del tenant
GET /api/tenants/:slug/stats        # Estadísticas propias
PUT /api/tenants/:slug              # Actualizar PROPIO tenant
```

**Quién accede**: Admin del tenant actual (validado via `tenantMiddleware + membershipMiddleware`)

**Headers requeridos**: `Authorization` + `x-tenant`

---

### 3. **Tenant Scoping para Customers**

Todas las rutas de customers ahora usan el patrón **tenant-scoped**:

```
POST   /api/tenants/:slug/customers              # Crear
GET    /api/tenants/:slug/customers              # Listar
GET    /api/tenants/:slug/customers/:id          # Obtener
GET    /api/tenants/:slug/customers/document/:doc # Por documento
PUT    /api/tenants/:slug/customers/:id          # Actualizar
DELETE /api/tenants/:slug/customers/:id          # Eliminar
```

**Headers requeridos**:
```json
{
  "Authorization": "Bearer {{authToken}}",
  "x-tenant": "{{tenantSlug}}"
}
```

**Base de datos**: Los clientes se filtran por `tenant_id` en cada operación

---

### 4. **Tenant Scoping para Tutors**

Todas las rutas de tutors ahora usan el patrón **tenant-scoped**:

```
POST   /api/tenants/:slug/tutors              # Crear
GET    /api/tenants/:slug/tutors              # Listar
GET    /api/tenants/:slug/tutors/:id          # Obtener
GET    /api/tenants/:slug/tutors/document/:doc # Por documento
PUT    /api/tenants/:slug/tutors/:id          # Actualizar
DELETE /api/tenants/:slug/tutors/:id          # Eliminar
```

**Headers requeridos**: Mismo patrón que Customers

---

### 5. **Nueva Carpeta: Security Tests**

Se agregó una carpeta completa de pruebas de seguridad **🔐 Security Tests**:

#### Tests de Aislamiento Cross-Tenant

1. **❌ Cross-Tenant Customer Access**
   - Intenta acceder a customer de otro tenant
   - Esperado: 403 o 404
   - Valida: Aislamiento de datos

2. **❌ Cross-Tenant Tutor Access**
   - Intenta acceder a tutor de otro tenant
   - Esperado: 403 o 404
   - Valida: Aislamiento de tutores

3. **❌ Create Claim with Wrong Tenant Customer**
   - Intenta crear claim con customer de otro tenant
   - Esperado: 404 "Cliente no encontrado en este tenant"
   - Valida: Validación cross-tenant en controlador

4. **❌ Non-Superadmin Create Tenant**
   - Intenta crear tenant con token de admin (no superadmin)
   - Esperado: 403 o 401
   - Valida: Solo superadmin puede crear tenants

5. **❌ Non-Superadmin Delete Tenant**
   - Intenta eliminar tenant con token de admin
   - Esperado: 403 o 401
   - Valida: Solo superadmin puede eliminar tenants

6. **✅ Verify Customer Has Correct Tenant_ID**
   - Obtiene customer y verifica datos
   - Valida: Respuesta correcta y estructura

---

## 📊 Estructura de Variables

### Tokens (Actualizar con valores reales)

```json
{
  "authToken": "<jwt_token_staff_user>",
  "adminToken": "<jwt_token_admin_user>",
  "superadminToken": "<jwt_token_superadmin_user>"
}
```

### Identificadores (Actualizar después de pruebas)

```json
{
  "customerId": "1",
  "tutorId": "1",
  "userId": "1",
  "claimId": "1",
  "apiKeyId": "1"
}
```

### Configuración

```json
{
  "baseUrl": "http://localhost:3000",
  "tenantSlug": "default",
  "tenantSlugB": "tenant-b"
}
```

---

## 🧪 Cómo Ejecutar Tests de Seguridad

### 1. **Configurar Variables Iniciales**

En Postman, edita la colección y actualiza:

```javascript
authToken         // Token de usuario staff
adminToken        // Token de admin del tenant
superadminToken   // Token de superadmin (rol global)
tenantSlug        // Tenant principal (ej: "default")
tenantSlugB       // Segundo tenant para tests
```

### 2. **Ejecutar Test Suite**

Selecciona la carpeta **🔐 Security Tests** y haz clic en "Run":

```
Collection Runner
├── Run Security Tests
├── Environment: Production (o tu entorno)
└── Tests: 6 casos
```

### 3. **Revisar Resultados**

Postman mostrará:
- ✅ Tests pasados
- ❌ Tests fallidos
- Detalles de cada request/response

---

## 🔍 Validaciones Implementadas

### En el Frontend (Postman Tests)

```javascript
pm.test('Cross-tenant access denied', function() {
  pm.expect(pm.response.code).to.be.oneOf([403, 404]);
});

pm.test('Non-superadmin cannot create tenant', function() {
  pm.expect(pm.response.code).to.be.oneOf([403, 401]);
});
```

### En el Backend (Código)

1. **Validación de Tenant Context**
   ```javascript
   const tenantId = req.tenant?.id;
   if (!tenantId) {
     return res.status(400).json({ message: 'Tenant context requerido' });
   }
   ```

2. **Filtrado por Tenant en Queries**
   ```javascript
   const customer = await Customer.findOne({
     where: { id, tenant_id: tenantId }
   });
   ```

3. **Validación de Pertenencia**
   ```javascript
   if (!customer) {
     return res.status(404).json({ 
       message: 'Cliente no encontrado en este tenant' 
     });
   }
   ```

---

## 📈 Comparativa Antes/Después

### Antes de Actualización
```
Customers:
- GET /api/customers              (sin scoping)
- POST /api/customers             (sin validación tenant)
- Sin tests de seguridad
- Sin validación cross-tenant

Tenants:
- Todo requería adminToken
- Sin separación superadmin/admin
```

### Después de Actualización
```
Customers:
- GET /api/tenants/:slug/customers    (con tenant_id scoping)
- POST /api/tenants/:slug/customers   (valida customer pertenece al tenant)
- 6 tests de seguridad incluidos
- Validación cross-tenant en controlador

Tenants:
- 3 niveles: público/superadmin/admin
- Superadmin solo para operaciones de plataforma
- Admin solo para autogestión del tenant
- Tests incluidos para cada nivel
```

---

## 🚀 Flujo de Prueba Recomendado

### Paso 1: Seed y Setup
```bash
# Ejecutar seed para crear datos iniciales
npm run seed

# Verifica:
- ✅ Tenant "default" creado
- ✅ Admin user creado
- ✅ Customers y tutors creados
```

### Paso 2: Obtener Tokens
```
1. Login como admin
   POST /api/users/login
   Copia el JWT token → variable authToken

2. Login como superadmin (si existe)
   POST /api/users/login
   Copia el JWT token → variable superadminToken
```

### Paso 3: Actualizar Variables
```javascript
// En Postman, edita Collection > Variables
authToken = "<token_obtenido_paso_2>"
superadminToken = "<token_obtenido_paso_2>"
```

### Paso 4: Crear Datos de Test
```
1. Create Customer
   POST /api/tenants/default/customers
   Copia customer.id → variable customerId

2. Create Tutor
   POST /api/tenants/default/tutors
   Copia tutor.id → variable tutorId
```

### Paso 5: Ejecutar Security Tests
```
1. Selecciona carpeta "🔐 Security Tests"
2. Haz clic en "Run"
3. Revisa resultados
```

---

## ✅ Checklist de Actualización

- [x] Variables incluidas (authToken, adminToken, superadminToken)
- [x] Rutas de Tenants segregadas por nivel
- [x] Customers con tenant scoping
- [x] Tutors con tenant scoping
- [x] Security tests folder creada
- [x] 6 test cases de aislamiento incluidos
- [x] Tests validan respuestas correctas
- [x] Documentación completa

---

## 📝 Notas Importantes

### Variables Requeridas

Actualiza estas variables ANTES de ejecutar:

```json
{
  "superadminToken": "⚠️ CRÍTICO - Debe ser token con role=superadmin",
  "adminToken": "Token del admin del tenant",
  "authToken": "Token de usuario normal (staff)"
}
```

### Seguridad

- ❌ **NUNCA** subas tokens reales a Git
- ✅ Usa variables de entorno en Postman
- ✅ Mantén superadminToken seguro en producción
- ✅ Los tests validan aislamiento automáticamente

### Troubleshooting

**Error 403 en Security Tests**:
- Verifica que superadminToken tiene `role='superadmin'`
- Ejecuta `git log` para ver si middleware se aplicó

**Error 404 en Customer/Tutor**:
- Verifica customerId/tutorId son válidos para el tenant actual
- Comprueba que tenant_id está poblado en BD

---

## 📞 Referencia Rápida

| Endpoint | Headers | Propósito |
|----------|---------|-----------|
| `POST /api/tenants` | superadminToken | Crear tenant (SUPERADMIN ONLY) |
| `GET /api/tenants/:slug/details` | adminToken + x-tenant | Detalles del tenant (ADMIN ONLY) |
| `POST /api/tenants/:slug/customers` | authToken + x-tenant | Crear customer en tenant |
| `POST /api/tenants/:slug/tutors` | authToken + x-tenant | Crear tutor en tenant |

---

**Colección actualizada**: ✅ postman_collection.json
**Descripción**: Multi-Tenant Secured - Diciembre 2025
