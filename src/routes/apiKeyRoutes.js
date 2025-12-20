/**
 * API Key routes: tenant-scoped API key management
 * Protected by admin role - only admins can manage API keys
 */

const express = require('express');
const { authMiddleware, tenantMiddleware, membershipMiddleware, requireTenantRole, rateLimitTenant, auditMiddleware } = require('../middlewares');
const apiKeyController = require('../controllers/apiKeyController');

const router = express.Router();

// List API keys for tenant
router.get('/tenants/:slug/api-keys', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  apiKeyController.listApiKeys
);

// Get API key by ID
router.get('/tenants/:slug/api-keys/:id', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  apiKeyController.getApiKeyById
);

// Get API key statistics
router.get('/tenants/:slug/api-keys/:id/stats', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  apiKeyController.getApiKeyStats
);

// Create API key (returns plaintext once)
router.post('/tenants/:slug/api-keys', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  auditMiddleware('apikey:create'), 
  apiKeyController.createApiKey
);

// Update API key (label/scopes only)
router.put('/tenants/:slug/api-keys/:id', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  auditMiddleware('apikey:update'), 
  apiKeyController.updateApiKey
);

// Revoke API key (soft delete)
router.delete('/tenants/:slug/api-keys/:id', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  auditMiddleware('apikey:revoke'), 
  apiKeyController.revokeApiKey
);

// Permanently delete API key
router.delete('/tenants/:slug/api-keys/:id/permanent', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  auditMiddleware('apikey:delete'), 
  apiKeyController.deleteApiKey
);

// Reactivate revoked API key
router.post('/tenants/:slug/api-keys/:id/activate', 
  authMiddleware, 
  tenantMiddleware, 
  membershipMiddleware, 
  requireTenantRole('admin'), 
  rateLimitTenant, 
  auditMiddleware('apikey:activate'), 
  apiKeyController.activateApiKey
);

module.exports = router;
