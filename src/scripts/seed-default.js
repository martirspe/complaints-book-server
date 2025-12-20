/* Default init seed: only baseline catalogs + default tenant + admin user. */
const { connectDB } = require('../config/db');
const { DocumentType, ConsumptionType, ClaimType, Currency, User, Tenant, UserTenant, Subscription } = require('../models');
const defaultTenant = require('../config/defaultTenant');
const bcrypt = require('bcrypt');

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

async function seedAdminUser(tenant) {
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let user = await User.findOne({ where: { email: defaultEmail } });
  if (!user) {
    const hashed = await bcrypt.hash(defaultPassword, 10);
    user = await User.create({
      tenant_id: tenant?.id || null,
      first_name: 'Admin',
      last_name: 'User',
      email: defaultEmail,
      password: hashed,
      role: 'admin',
    });
    console.log(`Seeded: admin user (${defaultEmail})`);
  }

  if (tenant && user) {
    await UserTenant.findOrCreate({ where: { user_id: user.id, tenant_id: tenant.id }, defaults: { role: 'admin' } });
  }
}

async function seedSubscription(tenant) {
  if (!tenant) return;
  const existing = await Subscription.findOne({ where: { tenant_id: tenant.id } });
  if (existing) return;
  const now = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year trial
  await Subscription.create({
    tenant_id: tenant.id,
    plan_name: 'free', // Start with free plan
    status: 'active',
    billing_cycle_start: now,
    billing_cycle_end: endDate,
    auto_renew: true
  });
  console.log(`Seeded: subscription for tenant ${tenant.slug} (plan: free)`);
}

(async () => {
  try {
    await connectDB();
    await seedDocumentTypes();
    await seedConsumptionTypes();
    await seedClaimTypes();
    await seedCurrencies();
    const tenant = await seedDefaultTenant();
    await seedAdminUser(tenant);
    await seedSubscription(tenant);
    console.log('Default seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Default seeding failed:', err);
    process.exit(1);
  }
})();
