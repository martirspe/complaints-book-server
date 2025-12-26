# Checklist: Implementación de Seguridad Multi-Tenant

Guía rápida para aplicar todas las mejoras de seguridad.

---

## ✅ Fase 1: Código (COMPLETADO)

- [x] **Middleware superadmin**: Creado y exportado
- [x] **Rutas de tenant**: Separadas por nivel de acceso (público/superadmin/admin)
- [x] **Rutas de subscriptions**: Protegidas con cadena completa
- [x] **Rutas de customers/tutors**: Protegidas con apiKeyOrJwt
- [x] **Modelos Customer/Tutor**: Agregado campo tenant_id
- [x] **Controller customer**: 6 métodos con tenant scoping
- [x] **Controller tutor**: 6 métodos con tenant scoping
- [x] **Controller claim**: Validación cross-tenant en createClaim
- [x] **Scripts de migración**: Creados (add-tenant-id, assign-tenant)
- [x] **Documentación**: SECURITY_ARCHITECTURE.md, MIGRATION_GUIDE.md

---

## 📝 Fase 2: Base de Datos (PENDIENTE)

### 2.1 Backup

```bash
# MySQL
mysqldump -u root -p reclamofacil_db > backup_$(date +%Y%m%d_%H%M%S).sql

# PostgreSQL
pg_dump -U postgres reclamofacil_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

- [ ] Backup realizado
- [ ] Backup verificado (intenta restaurar en otra BD de prueba)

### 2.2 Ejecutar Migraciones

```bash
# Agregar columnas tenant_id
node src/scripts/add-tenant-id-to-customers-tutors.js up
```

- [ ] Migración ejecutada sin errores
- [ ] Verificar columnas creadas:
  ```sql
  DESCRIBE customers;  -- Debe mostrar tenant_id
  DESCRIBE tutors;     -- Debe mostrar tenant_id
  ```

### 2.3 Asignar Tenants

**Opción A: Asignación automática** (si tienes múltiples tenants y claims)
```bash
node src/scripts/assign-tenant-to-existing-records.js auto
```

**Opción B: Asignación manual** (si tienes un solo tenant)
```bash
node src/scripts/assign-tenant-to-existing-records.js assign <tenant-slug>
```

- [ ] Script ejecutado
- [ ] Verificar asignaciones:
  ```sql
  SELECT COUNT(*) as total FROM customers;
  SELECT COUNT(*) as assigned FROM customers WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) as orphans FROM customers WHERE tenant_id IS NULL;
  
  SELECT COUNT(*) as total FROM tutors;
  SELECT COUNT(*) as assigned FROM tutors WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) as orphans FROM tutors WHERE tenant_id IS NULL;
  ```

- [ ] **IMPORTANTE**: Si hay orphans, asignarlos manualmente:
  ```sql
  UPDATE customers SET tenant_id = <id> WHERE tenant_id IS NULL;
  UPDATE tutors SET tenant_id = <id> WHERE tenant_id IS NULL;
  ```

---

## 🧪 Fase 3: Testing (PENDIENTE)

### 3.1 Tests de Aislamiento

**Setup de prueba:**
1. Crear 2 tenants: tenant-a y tenant-b
2. Crear 1 customer en cada tenant
3. Crear 1 tutor en cada tenant
4. Crear usuarios admin en cada tenant

**Test 1: Customer Cross-Tenant**
```bash
# Autenticar como admin de tenant-a
POST /api/users/login
{ "email": "admin@tenant-a.com", "password": "..." }

# Intentar obtener customer de tenant-b
GET /api/tenants/tenant-a/customers/<id_de_tenant_b>
```
- [ ] Respuesta: 404 o 403 ✓
- [ ] NO debe retornar el customer de tenant-b

**Test 2: Tutor Cross-Tenant**
```bash
# Autenticar como admin de tenant-a
# Intentar obtener tutor de tenant-b
GET /api/tenants/tenant-a/tutors/<id_de_tenant_b>
```
- [ ] Respuesta: 404 o 403 ✓

**Test 3: Claim con Customer de otro Tenant**
```bash
# Autenticar como admin de tenant-a
POST /api/tenants/tenant-a/claims
{
  "customer_id": <id_de_customer_de_tenant_b>,
  "claim_type_id": 1,
  ...
}
```
- [ ] Respuesta: 404 "Cliente no encontrado en este tenant" ✓

**Test 4: Crear Customer/Tutor**
```bash
POST /api/tenants/tenant-a/customers
{ "first_name": "Test", ... }
```
- [ ] Customer creado correctamente
- [ ] Verificar en BD que `tenant_id` = id de tenant-a:
  ```sql
  SELECT * FROM customers WHERE first_name = 'Test';
  ```

### 3.2 Tests de Superadmin

**Test 5: Crear Tenant**
```bash
# Login como superadmin
POST /api/users/login
{ "email": "superadmin@example.com", "password": "..." }

# Crear nuevo tenant
POST /api/tenants
{ "name": "Nuevo Tenant", "slug": "nuevo-tenant", ... }
```
- [ ] Solo funciona con superadmin ✓
- [ ] Admin normal recibe 403 ✓

**Test 6: Listar Todos los Tenants**
```bash
GET /api/tenants  (sin :slug)
```
- [ ] Solo funciona con superadmin ✓
- [ ] Retorna todos los tenants de la plataforma ✓

### 3.3 Tests de Roles

**Test 7: Admin puede gestionar su tenant**
```bash
# Login como admin de tenant-a
PUT /api/tenants/tenant-a
{ "name": "Nombre Actualizado" }
```
- [ ] Funciona correctamente ✓

**Test 8: Staff NO puede gestionar tenant**
```bash
# Login como staff de tenant-a
PUT /api/tenants/tenant-a
{ "name": "Intento de cambio" }
```
- [ ] Respuesta: 403 Forbidden ✓

---

## 🚀 Fase 4: Deployment (PENDIENTE)

### 4.1 Pre-Deployment

- [ ] Todas las pruebas pasaron
- [ ] Backup de producción realizado
- [ ] Plan de rollback documentado
- [ ] Ventana de mantenimiento agendada
- [ ] Equipo notificado

### 4.2 Deployment

```bash
# 1. Pull código
git pull origin main

# 2. Instalar dependencias (si hay nuevas)
npm install

# 3. Ejecutar migraciones
node src/scripts/add-tenant-id-to-customers-tutors.js up
node src/scripts/assign-tenant-to-existing-records.js auto

# 4. Reiniciar servidor
pm2 restart reclamofacil-server
# o
systemctl restart reclamofacil

# 5. Limpiar cache (si aplica)
redis-cli FLUSHDB
```

- [ ] Código desplegado
- [ ] Migraciones ejecutadas
- [ ] Servidor reiniciado
- [ ] Cache limpiado

### 4.3 Post-Deployment

**Smoke Tests:**
```bash
# 1. Health check
curl http://api.reclamofacil.com/health

# 2. Login
curl -X POST http://api.reclamofacil.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 3. Listar customers
curl http://api.reclamofacil.com/api/tenants/default/customers \
  -H "Authorization: Bearer <token>"
```

- [ ] Health check OK
- [ ] Login funciona
- [ ] Endpoints responden correctamente
- [ ] No hay errores 500 en logs

**Monitoreo (primeras 24 horas):**
- [ ] Revisar logs cada 4 horas
- [ ] Verificar tasa de errores no aumentó
- [ ] Confirmar no hay intentos de cross-tenant access

---

## 🆘 Rollback (Si algo sale mal)

### Rollback de Código
```bash
git revert <commit_hash>
pm2 restart reclamofacil-server
```

### Rollback de Base de Datos
```bash
# Eliminar columnas tenant_id
node src/scripts/add-tenant-id-to-customers-tutors.js down

# O restaurar desde backup
mysql -u root -p reclamofacil_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📊 Métricas de Éxito

Después del deployment, verificar:

- [ ] **Aislamiento**: 0 accesos cross-tenant en logs
- [ ] **Performance**: Tiempo de respuesta similar (<10% diferencia)
- [ ] **Errores**: Tasa de error <0.1%
- [ ] **Uploads**: Archivos se guardan en carpeta correcta del tenant
- [ ] **Rate limiting**: Se aplica correctamente por tenant

---

## 📞 Contactos de Emergencia

- **Desarrollador Principal**: [Tu nombre/email]
- **DevOps**: [Contacto DevOps]
- **On-call**: [Número de emergencia]

---

## ✅ Checklist Ejecutivo

```
[x] Código implementado y commiteado
[ ] Backup de base de datos
[ ] Migraciones ejecutadas
[ ] Tenant_id asignado a todos los registros
[ ] Testing de aislamiento completado
[ ] Testing de roles completado
[ ] Deployment en staging OK
[ ] Deployment en producción OK
[ ] Smoke tests post-deployment OK
[ ] Monitoreo 24h OK
[ ] Documentación actualizada
[ ] Equipo capacitado
```

---

## 🎯 Estado Actual

**Fase 1 (Código)**: ✅ **COMPLETADO**

**Fase 2 (Base de Datos)**: ⏳ **PENDIENTE** - Listo para ejecutar

**Fase 3 (Testing)**: ⏳ **PENDIENTE** - Requiere Fase 2

**Fase 4 (Deployment)**: ⏳ **PENDIENTE** - Requiere Fase 2 y 3

---

**Próximo paso**: Ejecutar migraciones de base de datos (Fase 2)
