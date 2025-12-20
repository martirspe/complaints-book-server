# Instrucciones de Limpieza del Repositorio

## ✅ Estado

Los archivos deprecated (`src/controllers/licenseController.js` y `src/routes/licenseRoutes.js`) ya fueron eliminados tras la consolidación en `subscriptionController` y `subscriptionRoutes`. Este documento queda como registro del proceso y verificación.

## 🔍 Verificación Rápida (post-eliminación)

1. Confirmar que no existen referencias en el código activo:
   ```bash
   grep -r "licenseController" src/ --include="*.js"
   grep -r "licenseRoutes" src/ --include="*.js"
   ```
   Resultado esperado: **0 matches**.

2. Validar endpoints críticos siguen funcionando:
   ```bash
   curl http://localhost:3000/api/tenants/default/license/1
   curl http://localhost:3000/api/tenants/default/billing/subscription
   curl http://localhost:3000/api/tenants/default/billing/usage
   ```

## 🔄 Tests Recomendados

Ejecútalos para asegurar la consolidación:

```bash
npm test -- --grep "checkUserSubscription"
npm test -- --grep "listPlans"
npm test -- --grep "getSubscription"
npm test -- --grep "getUsage"
npm test -- --grep "upgradePlan"
```

## 📝 Referencias

- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
- [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md)
- [DEPRECATION_NOTES.md](./DEPRECATION_NOTES.md)

## ⚠️ Rollback (si es necesario)

```bash
git revert <commit-hash>
```

---

**Estado**: Limpieza completada  
**Revisado**: ✅  
**Dependencias**: 0 (sin artefactos deprecated)
