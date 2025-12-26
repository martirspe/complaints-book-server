# Guía de Migración: Aislamiento Multi-Tenant

Esta guía explica cómo aplicar las migraciones necesarias para implementar el aislamiento completo de datos entre tenants.

## 📋 Resumen

Se agregaron columnas `tenant_id` a las tablas `customers` y `tutors` para garantizar que cada tenant solo acceda a sus propios datos.

## 🔧 Pasos de Migración

### 1. Backup de Base de Datos

**IMPORTANTE**: Siempre haz un backup completo antes de ejecutar migraciones.

```bash
# MySQL
mysqldump -u usuario -p nombre_db > backup_$(date +%Y%m%d).sql

# PostgreSQL
pg_dump -U usuario nombre_db > backup_$(date +%Y%m%d).sql
```

### 2. Agregar Columnas tenant_id

Este script agrega las columnas `tenant_id` a las tablas `customers` y `tutors`:

```bash
node src/scripts/add-tenant-id-to-customers-tutors.js up
```

**Qué hace:**
- Agrega columna `tenant_id` (nullable) a `customers`
- Agrega columna `tenant_id` (nullable) a `tutors`
- Crea índices para optimizar consultas por tenant
- Crea foreign keys hacia la tabla `tenants`

### 3. Asignar Tenants a Registros Existentes

Tienes dos opciones según tu escenario:

#### Opción A: Asignación Automática (Multi-tenant)

Si tienes múltiples tenants y claims ya registrados, el script puede asignar automáticamente basándose en las relaciones existentes:

```bash
node src/scripts/assign-tenant-to-existing-records.js auto
```

**Qué hace:**
- Busca claims asociados a cada customer/tutor
- Asigna el `tenant_id` del claim al customer/tutor
- Reporta registros que no pudieron asignarse automáticamente

#### Opción B: Asignación Manual a un Tenant

Si solo tienes un tenant o quieres asignar todos los registros huérfanos a un tenant específico:

```bash
node src/scripts/assign-tenant-to-existing-records.js assign <tenant-slug>
```

Ejemplo:
```bash
node src/scripts/assign-tenant-to-existing-records.js assign empresa-demo
```

### 4. Verificar la Migración

Verifica que todos los registros tengan `tenant_id` asignado:

```sql
-- Ver customers sin tenant
SELECT COUNT(*) as orphan_customers 
FROM customers 
WHERE tenant_id IS NULL;

-- Ver tutors sin tenant
SELECT COUNT(*) as orphan_tutors 
FROM tutors 
WHERE tenant_id IS NULL;

-- Ver distribución por tenant
SELECT t.name, t.slug,
  (SELECT COUNT(*) FROM customers WHERE tenant_id = t.id) as customers,
  (SELECT COUNT(*) FROM tutors WHERE tenant_id = t.id) as tutors
FROM tenants t;
```

### 5. (Opcional) Hacer tenant_id Obligatorio

Una vez que todos los registros tienen `tenant_id` válido, puedes hacer la columna NOT NULL:

```sql
ALTER TABLE customers MODIFY COLUMN tenant_id INT NOT NULL;
ALTER TABLE tutors MODIFY COLUMN tenant_id INT NOT NULL;
```

También actualiza los modelos Sequelize:

```javascript
// En Customer.js y Tutor.js
tenant_id: {
  type: DataTypes.INTEGER,
  allowNull: false, // Cambiar a false
  references: {
    model: 'tenants',
    key: 'id'
  }
}
```

## ⚠️ Consideraciones Importantes

### Mantenimiento

- **Ventana de mantenimiento**: Ejecuta las migraciones durante un período de bajo tráfico
- **Reinicio**: Reinicia el servidor después de completar las migraciones
- **Cache**: Limpia cualquier caché (Redis) después de la migración

### Validación Post-Migración

1. **Prueba de aislamiento**: Intenta acceder a recursos de otro tenant (debe fallar)
2. **Creación de registros**: Crea nuevos customers/tutors y verifica que tengan `tenant_id`
3. **Consultas existentes**: Verifica que los endpoints existentes funcionen correctamente

### Rollback

Si necesitas revertir la migración:

```bash
node src/scripts/add-tenant-id-to-customers-tutors.js down
```

**⚠️ ADVERTENCIA**: Esto eliminará las columnas `tenant_id` y perderás el aislamiento de datos.

## 📊 Impacto en el Código

### Controladores Actualizados

Los siguientes controladores fueron actualizados para validar `tenant_id`:

- ✅ `customerController.js`: Todas las operaciones filtran por `tenant_id`
- ✅ `tutorController.js`: Todas las operaciones filtran por `tenant_id`
- ✅ `claimController.js`: Valida que customer/tutor pertenezcan al tenant

### Middlewares de Protección

- ✅ `apiKeyOrJwt`: Todas las rutas de customer/tutor requieren autenticación
- ✅ `tenantMiddleware`: Resuelve el tenant desde slug/header/subdomain
- ✅ `membershipMiddleware`: Valida membresía del usuario en el tenant

### Modelos Actualizados

- ✅ `Customer.js`: Agregada columna `tenant_id` y relación con `Tenant`
- ✅ `Tutor.js`: Agregada columna `tenant_id` y relación con `Tenant`

## 🧪 Testing

### Pruebas Manuales

1. **Test de aislamiento entre tenants**:
   ```bash
   # Autenticarse como admin de tenant A
   POST /api/auth/login
   { "email": "admin@tenantA.com", "password": "..." }
   
   # Intentar acceder a un customer de tenant B (debe fallar)
   GET /api/tenants/tenantB/customers/:id
   # Respuesta esperada: 403 Forbidden o 404 Not Found
   ```

2. **Test de creación con tenant correcto**:
   ```bash
   # Crear customer en tenant A
   POST /api/tenants/tenantA/customers
   { "first_name": "Juan", ... }
   
   # Verificar que el customer tiene tenant_id correcto
   SELECT * FROM customers WHERE email = 'juan@example.com';
   # tenant_id debe ser el id de tenantA
   ```

3. **Test de relaciones cross-tenant**:
   ```bash
   # Intentar crear un claim con customer de otro tenant
   POST /api/tenants/tenantA/claims
   { "customer_id": <id_de_customer_de_tenantB>, ... }
   # Respuesta esperada: 404 "Cliente no encontrado en este tenant"
   ```

## 📝 Checklist de Migración

- [ ] Backup de base de datos realizado
- [ ] Script de migración ejecutado (`up`)
- [ ] Registros existentes asignados a tenants
- [ ] Verificación: todos los registros tienen `tenant_id`
- [ ] Testing de aislamiento entre tenants
- [ ] Testing de creación de nuevos registros
- [ ] Testing de actualización de registros existentes
- [ ] Servidor reiniciado
- [ ] Cache limpiado (si aplica)
- [ ] Documentación actualizada
- [ ] Equipo notificado de los cambios

## 🆘 Solución de Problemas

### Error: "Tenant context requerido"

**Causa**: El middleware `tenantMiddleware` no pudo resolver el tenant.

**Solución**: 
- Verifica que el header `x-tenant` o `x-tenant-slug` esté presente
- Verifica que el parámetro `:slug` esté en la ruta
- Verifica que el tenant exista en la base de datos

### Error: "Cliente no encontrado en este tenant"

**Causa**: El customer no pertenece al tenant actual.

**Solución**:
- Verifica que estés usando el tenant correcto
- Verifica que el `tenant_id` del customer coincida con el tenant actual
- Ejecuta el script de asignación si es un registro legacy

### Registros sin tenant_id después de la migración

**Causa**: Registros sin claims asociados o tenants mal configurados.

**Solución**:
```sql
-- Asignar manualmente a un tenant
UPDATE customers SET tenant_id = <tenant_id> WHERE tenant_id IS NULL;
UPDATE tutors SET tenant_id = <tenant_id> WHERE tenant_id IS NULL;
```

## 📞 Soporte

Para problemas durante la migración, contacta al equipo de desarrollo o revisa los logs del servidor.

**Logs útiles**:
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Buscar errores de tenant
grep "tenant" logs/app.log | grep -i error
```
