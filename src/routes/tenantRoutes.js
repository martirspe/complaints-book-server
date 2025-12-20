/**
 * Tenant routes: branding and CRUD operations
 * Includes branding endpoints and full tenant management
 */

const express = require('express');
const { Tenant } = require('../models');
const branding = require('../config/branding');
const tenantController = require('../controllers/tenantController');
const { authMiddleware } = require('../middlewares');

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

const sendTenantBranding = async (req, res, slug) => {
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
    });
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo branding de tenant');
    res.status(500).json({ message: 'Error obteniendo branding de tenant' });
  }
};

// GET /api/tenants/:slug/branding
router.get('/tenants/:slug/branding', async (req, res) => {
  const { slug } = req.params;
  return sendTenantBranding(req, res, slug);
});

// GET /api/tenants/default/branding -> usa DEFAULT_TENANT_SLUG o "default"
router.get('/tenants/default/branding', async (req, res) => {
  const slug = process.env.DEFAULT_TENANT_SLUG || 'default';
  return sendTenantBranding(req, res, slug);
});

// GET /api/tenants/:slug (datos generales del tenant - legacy, usar endpoint CRUD abajo)
router.get('/tenants/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ where: { slug } });
    if (!tenant) return res.status(404).json({ message: 'Tenant no encontrado' });
    res.json(tenant);
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo tenant');
    res.status(500).json({ message: 'Error obteniendo tenant' });
  }
});

// ============== CRUD Operations (Protected) ==============

// Create a new tenant
router.post('/', authMiddleware, tenantController.createTenant);

// Get all tenants (with pagination and search)
router.get('/', authMiddleware, tenantController.getTenants);

// Get tenant details with subscription info
router.get('/:slug/details', authMiddleware, tenantController.getTenantBySlug);

// Update tenant
router.put('/:slug', authMiddleware, tenantController.updateTenant);

// Delete tenant
router.delete('/:slug', authMiddleware, tenantController.deleteTenant);

// Get tenant statistics
router.get('/:slug/stats', authMiddleware, tenantController.getTenantStats);

module.exports = router;
