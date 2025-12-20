/**
 * DEPRECATED FILES - Migrados y eliminados tras consolidación en subscriptionController.js
 * 
 * REMOVAL STATUS:
 * ✅ REMOVED:
 *   - src/controllers/licenseController.js (funcionalidad movida a subscriptionController.checkUserSubscription)
 *   - src/routes/licenseRoutes.js (rutas movidas a subscriptionRoutes.js)
 *
 * MIGRATION COMPLETE:
 * ✅ The endpoint GET /api/license/:userId is now handled by:
 *    - GET /api/tenants/:slug/license/:userId → subscriptionController.checkUserSubscription()
 *
 * ✅ All license verification logic is now part of the Subscription model and plan management system.
 *    This consolidation reduces code duplication and improves maintainability.
 * 
 * ✅ Feature gate middleware (featureGateMiddleware.js) now controls access to features per plan.
 *
 * ============================================================
 * 
 * IMPLEMENTATION NOTES:
 * 
 * 1. Legacy User fields removed:
 *    - User.license_type
 *    - User.license_expiration_date
 *    (Replaced by Subscription.plan_name and Subscription.billing_cycle_end)
 * 
 * 2. New model: Subscription
 *    - Links tenants to plans (free, basic, pro, enterprise)
 *    - Tracks billing cycles, payment providers, auto-renewal
 *    - Supports metadata for custom features per plan
 * 
 * 3. New config: config/plans.js
 *    - Centralized plan definitions with features and limits
 *    - Methods: getPlanFeatures(), hasFeature(), getRateLimit()
 * 
 * 4. Consolidated endpoints in subscriptionRoutes.js:
 *    - GET /api/tenants/:slug/billing/plans
 *    - GET /api/tenants/:slug/billing/subscription
 *    - GET /api/tenants/:slug/billing/usage
 *    - POST /api/tenants/:slug/billing/upgrade
 *    - POST /api/tenants/:slug/billing/cancel
 *    - GET /api/tenants/:slug/license/:userId (LEGACY)
 * 
 * SAFETY CHECKPOINTS:
 * - No imports of licenseController remain in active code
 * - No imports of licenseRoutes remain in active code
 * - All tests should validate subscriptionController.checkUserSubscription()
 * 
 * Migration date: 2025-12-20
 * Status: COMPLETE ✅ (archivos legacy eliminados)
 */
