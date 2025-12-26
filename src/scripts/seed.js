/* Development/Testing seed: includes superadmin, API keys, and all baseline data. Use for testing and development. */
const { connectDB } = require('../config/db');
const { DocumentType, ConsumptionType, ClaimType, Currency, User, Tenant, UserTenant, ApiKey, Subscription } = require('../models');
const { getPlanConfig } = require('../config/planFeatures');
const defaultTenant = require('../config/defaultTenant');
const bcrypt = require('bcrypt');
const { generateApiKey } = require('../utils/apiKeyUtils');

async function seedDocumentTypes() {
  const count = await DocumentType.count();
  if (count > 0) return;
  await DocumentType.bulkCreate([
    { name: 'DNI' },
    { name: 'CARNET DE EXTRANJERIA' },
    { name: 'PASAPORTE' },
    { name: 'RUC' },
    { name: 'BREVETE' },
  ]);
  console.log('Seeded: document_types');
}

async function seedConsumptionTypes() {
  const count = await ConsumptionType.count();
  if (count > 0) return;
  await ConsumptionType.bulkCreate([
    { name: 'Producto' },
    { name: 'Servicio' },
  ]);
  console.log('Seeded: consumption_types');
}

async function seedClaimTypes() {
  const count = await ClaimType.count();
  if (count > 0) return;
  await ClaimType.bulkCreate([
    { name: 'Reclamo', description: 'Inconformidad relacionada al producto/servicio.' },
    { name: 'Queja', description: 'Malestar por la atención brindada.' },
  ]);
  console.log('Seeded: claim_types');
}

async function seedCurrencies() {
  const count = await Currency.count();
  if (count > 0) return;
  await Currency.bulkCreate([
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/.', is_active: true },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', is_active: true },
  ]);
  console.log('Seeded: currencies');
}

async function seedDefaultTenant() {
  const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'default';
  let tenant = await Tenant.findOne({ where: { slug: defaultSlug } });
  if (!tenant) {
    tenant = await Tenant.create({
      slug: defaultSlug,
      company_brand: defaultTenant.companyBrand,
      company_name: defaultTenant.companyName,
      company_ruc: defaultTenant.companyRuc,
      primary_color: defaultTenant.primaryColor,
      accent_color: defaultTenant.accentColor,
      logo_light_url: defaultTenant.logoLightPath,
      logo_dark_url: defaultTenant.logoDarkPath,
      favicon_url: defaultTenant.faviconPath,
      notifications_email: process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL || defaultTenant.notificationsEmail,
    });
    console.log(`Seeded: tenant (${defaultSlug})`);
  }
  return tenant;
}

async function seedSuperadminUser() {
  const defaultEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
  const defaultPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123';
  let user = await User.findOne({ where: { email: defaultEmail } });
  if (!user) {
    const hashed = await bcrypt.hash(defaultPassword, 10);
    user = await User.create({
      first_name: 'Superadmin',
      last_name: 'User',
      email: defaultEmail,
      password: hashed,
      role: 'superadmin',
    });
    console.log(`Seeded: superadmin user (${defaultEmail})`);
  }
  return user;
}

async function seedAdminUser(tenant) {
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let user = await User.findOne({ where: { email: defaultEmail } });
  if (!user) {
    const hashed = await bcrypt.hash(defaultPassword, 10);
    user = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: defaultEmail,
      password: hashed,
      role: 'admin',
    });
    console.log(`Seeded: admin user (${defaultEmail})`);
  }

  // Ensure membership
  if (tenant && user) {
    await UserTenant.findOrCreate({ where: { user_id: user.id, tenant_id: tenant.id }, defaults: { role: 'admin' } });
  }

  return user;
}

async function seedApiKey(tenant) {
  if (!tenant) return;
  // Respect plan limits: only create API key if plan allows
  const subscription = await Subscription.findOne({ where: { tenant_id: tenant.id } });
  const planName = subscription?.plan_name || 'free';
  const planConfig = getPlanConfig(planName);
  if (typeof planConfig.maxApiKeys === 'number' && planConfig.maxApiKeys < 1) {
    console.log(`Skipping API key seed for tenant ${tenant.slug} (plan ${planName} allows 0 keys).`);
    return;
  }
  try {
    const existing = await ApiKey.findOne({ where: { tenant_id: tenant.id } });
    if (existing) {
      console.log(`✓ API key for tenant ${tenant.slug} already exists (${existing.label}), skipping.`);
      return;
    }
  } catch (err) {
    console.error('Error checking for existing API key:', err.message);
    return;
  }
  
  const { key, key_hash } = generateApiKey();
  try {
    await ApiKey.create({ 
      tenant_id: tenant.id, 
      label: 'default-seed', 
      scopes: 'claims:read,claims:write', 
      key_hash, 
      active: true 
    });
    console.log(`Seeded: api key for tenant ${tenant.slug} (save this key): ${key}`);
  } catch (err) {
    console.error(`Failed to create API key for tenant ${tenant.slug}:`, err.message);
  }
}

async function seedSubscription(tenant) {
  if (!tenant) return;
  const existing = await Subscription.findOne({ where: { tenant_id: tenant.id } });
  if (existing) return;
  
  // Allow plan selection via environment variable
  const { PLAN_FEATURES } = require('../config/planFeatures');
  const availablePlans = Object.keys(PLAN_FEATURES);
  const defaultPlan = process.env.DEFAULT_TENANT_PLAN_ON_SEED || 'free';
  
  if (!availablePlans.includes(defaultPlan)) {
    console.warn(`Plan "${defaultPlan}" not found. Available plans: ${availablePlans.join(', ')}. Using "free".`);
  }
  
  const planToUse = availablePlans.includes(defaultPlan) ? defaultPlan : 'free';
  
  const now = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year trial
  await Subscription.create({
    tenant_id: tenant.id,
    plan_name: planToUse,
    status: 'active',
    billing_cycle_start: now,
    billing_cycle_end: endDate,
    auto_renew: true
  });
  console.log(`Seeded: subscription for tenant ${tenant.slug} (plan: ${planToUse})`);
}

(async () => {
  try {
    await connectDB();
    await seedDocumentTypes();
    await seedConsumptionTypes();
    await seedClaimTypes();
    await seedCurrencies();
    const tenant = await seedDefaultTenant();
    await seedSuperadminUser();
    await seedAdminUser(tenant);
    await seedSubscription(tenant);
    await seedApiKey(tenant);
    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
