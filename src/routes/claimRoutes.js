const express = require('express');

// Upload middleware
const { uploadClaim, uploadResolveClaim } = require('../middlewares/uploadMiddleware');
// Optional reCAPTCHA middleware
const recaptchaMiddleware = require('../middlewares/recaptchaMiddleware');
const { validateClaimCreate, validateClaimUpdate, validateClaimAssign, validateClaimResolve } = require('../middlewares/validationMiddleware');
const { authMiddleware, tenantMiddleware, membershipMiddleware, requireTenantRole, rateLimitTenant, auditMiddleware, apiKeyOrJwt, requireApiKeyScopeOrJwt } = require('../middlewares');

// Claims controller
const {
  createClaim,
  getClaims,
  getClaimById,
  updateClaim,
  deleteClaim,
  assignClaim,
  resolveClaim
} = require('../controllers/claimController');

const router = express.Router();

// Create a new claim (tenant + auth protected). Multipart first to populate req.body
router.post('/tenants/:slug/claims', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:write'), rateLimitTenant, auditMiddleware('claim:create'), uploadClaim, validateClaimCreate, recaptchaMiddleware, createClaim);

// Get all claims for tenant
router.get('/tenants/:slug/claims', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:read'), rateLimitTenant, getClaims);

// Get a claim by ID (tenant scoped)
router.get('/tenants/:slug/claims/:id', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:read'), rateLimitTenant, getClaimById);

// Update a claim
router.put('/tenants/:slug/claims/:id', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:write'), rateLimitTenant, requireTenantRole('admin', 'staff'), auditMiddleware('claim:update'), validateClaimUpdate, uploadClaim, updateClaim);

// Delete a claim
router.delete('/tenants/:slug/claims/:id', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:write'), rateLimitTenant, requireTenantRole('admin'), auditMiddleware('claim:delete'), deleteClaim);

// Assign a claim
router.patch('/tenants/:slug/claims/:id/assign', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:write'), rateLimitTenant, requireTenantRole('admin', 'staff'), auditMiddleware('claim:assign'), validateClaimAssign, assignClaim);

// Resolve a claim (multipart parsing first to populate req.body)
router.patch('/tenants/:slug/claims/:id/resolve', apiKeyOrJwt, requireApiKeyScopeOrJwt('claims:write'), rateLimitTenant, requireTenantRole('admin', 'staff'), auditMiddleware('claim:resolve'), uploadResolveClaim, validateClaimResolve, resolveClaim);

module.exports = router;
