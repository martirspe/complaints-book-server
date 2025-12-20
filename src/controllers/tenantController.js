/**
 * Tenant Controller: CRUD operations for tenant management
 * 
 * Manages tenant creation, updates, and retrieval.
 * Each tenant represents an independent organization in the multi-tenant system.
 */

const { Tenant, Subscription, User, UserTenant } = require('../models');
const { PLANS } = require('../config/plans');

/**
 * Create a new tenant
 * POST /api/tenants
 */
exports.createTenant = async (req, res) => {
  try {
    const { slug, company_name, domain, contact_email, contact_phone } = req.body;

    // Validate required fields
    if (!slug || !company_name) {
      return res.status(400).json({ message: 'slug y company_name son requeridos' });
    }

    // Check if slug already exists
    const existingTenant = await Tenant.findOne({ where: { slug } });
    if (existingTenant) {
      return res.status(400).json({ message: 'El slug ya está en uso' });
    }

    // Create tenant
    const tenant = await Tenant.create({
      slug,
      company_name,
      domain,
      contact_email,
      contact_phone
    });

    // Create default free subscription
    const subscription = await Subscription.create({
      tenant_id: tenant.id,
      plan_name: 'free',
      status: 'active',
      billing_cycle_start: new Date(),
      billing_cycle_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      auto_renew: true
    });

    req.log?.info({ tenant_id: tenant.id, slug }, 'Tenant creado exitosamente');

    res.status(201).json({
      message: 'Tenant creado exitosamente',
      tenant,
      subscription
    });
  } catch (err) {
    req.log?.error({ err }, 'Error creando tenant');
    res.status(500).json({ message: 'Error creando tenant', error: err.message });
  }
};

/**
 * Get all tenants (with pagination)
 * GET /api/tenants
 */
exports.getTenants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { slug: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Tenant.findAndCountAll({
      where,
      include: [
        {
          model: Subscription,
          attributes: ['id', 'plan_name', 'status', 'billing_cycle_end']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      tenants: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo tenants');
    res.status(500).json({ message: 'Error obteniendo tenants' });
  }
};

/**
 * Get tenant by slug
 * GET /api/tenants/:slug
 */
exports.getTenantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({
      where: { slug },
      include: [
        {
          model: Subscription,
          attributes: ['id', 'plan_name', 'status', 'billing_cycle_start', 'billing_cycle_end', 'auto_renew']
        }
      ]
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Get user count
    const userCount = await User.count({ where: { tenant_id: tenant.id } });

    res.json({
      tenant,
      plan_details: PLANS[tenant.Subscription?.plan_name || 'free'],
      user_count: userCount
    });
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo tenant');
    res.status(500).json({ message: 'Error obteniendo tenant' });
  }
};

/**
 * Update tenant
 * PUT /api/tenants/:slug
 */
exports.updateTenant = async (req, res) => {
  try {
    const { slug } = req.params;
    const { company_name, domain, contact_email, contact_phone, notifications_email } = req.body;

    const tenant = await Tenant.findOne({ where: { slug } });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Update only provided fields
    if (company_name !== undefined) tenant.company_name = company_name;
    if (domain !== undefined) tenant.domain = domain;
    if (contact_email !== undefined) tenant.contact_email = contact_email;
    if (contact_phone !== undefined) tenant.contact_phone = contact_phone;
    if (notifications_email !== undefined) tenant.notifications_email = notifications_email;

    await tenant.save();

    req.log?.info({ tenant_id: tenant.id, slug }, 'Tenant actualizado exitosamente');

    res.json({
      message: 'Tenant actualizado exitosamente',
      tenant
    });
  } catch (err) {
    req.log?.error({ err }, 'Error actualizando tenant');
    res.status(500).json({ message: 'Error actualizando tenant' });
  }
};

/**
 * Delete tenant (soft delete - mark as inactive)
 * DELETE /api/tenants/:slug
 */
exports.deleteTenant = async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ where: { slug } });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Check if tenant has active users
    const userCount = await User.count({ where: { tenant_id: tenant.id } });
    if (userCount > 0 && !req.query.force) {
      return res.status(400).json({
        message: `El tenant tiene ${userCount} usuarios activos. Use ?force=true para forzar eliminación.`
      });
    }

    // Cancel subscription
    const subscription = await Subscription.findOne({ where: { tenant_id: tenant.id } });
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date();
      subscription.cancellation_reason = 'Tenant eliminado';
      await subscription.save();
    }

    // Soft delete: mark as inactive or actually delete
    await tenant.destroy();

    req.log?.info({ tenant_id: tenant.id, slug }, 'Tenant eliminado exitosamente');

    res.json({
      message: 'Tenant eliminado exitosamente',
      tenant_id: tenant.id
    });
  } catch (err) {
    req.log?.error({ err }, 'Error eliminando tenant');
    res.status(500).json({ message: 'Error eliminando tenant' });
  }
};

/**
 * Get tenant statistics
 * GET /api/tenants/:slug/stats
 */
exports.getTenantStats = async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ where: { slug } });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    const { Claim } = require('../models');
    const Sequelize = require('sequelize');

    // Get stats
    const [userCount, claimCount, thisMonthClaims] = await Promise.all([
      User.count({ where: { tenant_id: tenant.id } }),
      Claim.count({ where: { tenant_id: tenant.id } }),
      Claim.count({
        where: {
          tenant_id: tenant.id,
          creation_date: {
            [Sequelize.Op.gte]: new Date(new Date().setDate(1))
          }
        }
      })
    ]);

    const subscription = await Subscription.findOne({ where: { tenant_id: tenant.id } });
    const planFeatures = PLANS[subscription?.plan_name || 'free'];

    res.json({
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        company_name: tenant.company_name
      },
      subscription: {
        plan: subscription?.plan_name || 'free',
        status: subscription?.status || 'active',
        billing_cycle_end: subscription?.billing_cycle_end
      },
      usage: {
        users: userCount,
        users_limit: planFeatures.max_users,
        claims_total: claimCount,
        claims_this_month: thisMonthClaims,
        claims_limit: planFeatures.max_claims_per_month
      },
      warnings: {
        users_approaching_limit: userCount >= (planFeatures.max_users * 0.8),
        claims_approaching_limit: thisMonthClaims >= (planFeatures.max_claims_per_month * 0.8)
      }
    });
  } catch (err) {
    req.log?.error({ err }, 'Error obteniendo estadísticas del tenant');
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
};
