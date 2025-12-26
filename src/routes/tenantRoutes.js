/**
 * Tenant routes: tenant info and CRUD operations
 * Includes tenant profile endpoints and full tenant management
 */

const express = require('express');
const { Tenant } = require('../models');
const tenantController = require('../controllers/tenantController');
const { authMiddleware, tenantMiddleware, membershipMiddleware, requireTenantRole, superadminMiddleware } = require('../middlewares');
const { uploadBranding } = require('../middlewares/uploadMiddleware');

const router = express.Router();

const resolveProtocol = (req) => {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const forceHttps = process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true';
  return forceHttps ? 'https' : proto;
};

const toAbsolute = (host, url) => {
  if (!url) return null;
  const value = String(url).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${host}/${value.replace(/^\//, '')}`;
};

const sendTenantProfile = async (req, res, slug) => {
  try {
    const tenant = await Tenant.findOne({ where: { slug } });
    if (!tenant) return res.status(404).json({ message: 'Tenant no encontrado' });

    const host = `${resolveProtocol(req)}://${req.get('host')}`;
    res.json({
      tenant: slug,
      company_brand: tenant.company_brand,
      company_name: tenant.company_name,
      company_ruc: tenant.company_ruc,
      primary_color: tenant.primary_color,
      accent_color: tenant.accent_color,
      logo_light_url: toAbsolute(host, tenant.logo_light_url),
      logo_dark_url: toAbsolute(host, tenant.logo_dark_url),
      favicon_url: toAbsolute(host, tenant.favicon_url),
      notifications_email: tenant.notifications_email
    });
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo información de tenant');
    res.status(500).json({ message: 'Error obteniendo información de tenant' });
  }
};

// ============== Public Tenant Branding Endpoints ==============
// These endpoints are public (no auth) for displaying tenant branding

// GET /api/tenants/:slug (tenant info)
router.get('/tenants/:slug', async (req, res) => {
  const { slug } = req.params;
  return sendTenantProfile(req, res, slug);
});

// GET /api/tenants/default (default tenant info)
router.get('/tenants/default', async (req, res) => {
  const slug = process.env.DEFAULT_TENANT_SLUG || 'default';
  return sendTenantProfile(req, res, slug);
});

// ============== Superadmin Routes (Platform Management) ==============

// Create a new tenant (superadmin only)
router.post('/tenants', authMiddleware, superadminMiddleware, tenantController.createTenant);

// Get all tenants with pagination and search (superadmin only)
router.get('/tenants', authMiddleware, superadminMiddleware, tenantController.getTenants);

// ============== Tenant Admin Routes (Self-Management) ==============

// Get tenant details with subscription info (tenant admin only)
router.get('/tenants/:slug/details', authMiddleware, tenantMiddleware, membershipMiddleware, requireTenantRole('admin'), tenantController.getTenantBySlug);

// Update tenant (branding + contact), admin only, allows multipart uploads
router.put(
  '/tenants/:slug',
  authMiddleware,
  tenantMiddleware,
  membershipMiddleware,
  requireTenantRole('admin'),
  uploadBranding,
  tenantController.updateTenant
);

// Delete tenant (superadmin only for safety)
router.delete('/tenants/:slug', authMiddleware, superadminMiddleware, tenantController.deleteTenant);

// Get tenant statistics (tenant admin only)
router.get('/tenants/:slug/stats', authMiddleware, tenantMiddleware, membershipMiddleware, requireTenantRole('admin'), tenantController.getTenantStats);

module.exports = router;
