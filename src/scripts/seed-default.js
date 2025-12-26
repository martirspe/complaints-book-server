/* Production baseline seed: catalogs, default tenant, admin user, subscription. Optional superadmin via env flag. */
const { connectDB } = require('../config/db');
const { DocumentType, ConsumptionType, ClaimType, Currency, User, Tenant, UserTenant, Subscription } = require('../models');
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
    const companyBrand = process.env.DEFAULT_TENANT_COMPANY_BRAND || 'ReclamoFácil';
    const companyName = process.env.DEFAULT_TENANT_COMPANY_NAME || 'ReclamoFácil S.A.C.';
    const companyRuc = process.env.DEFAULT_TENANT_COMPANY_RUC || '20605432109';
    const primaryColor = process.env.DEFAULT_TENANT_PRIMARY_COLOR || '#2563EB';
    const accentColor = process.env.DEFAULT_TENANT_ACCENT_COLOR || '#16A34A';
    const logoLightPath = process.env.DEFAULT_TENANT_LOGO_LIGHT_PATH || 'assets/default-tenant/logo-light.png';
    const logoDarkPath = process.env.DEFAULT_TENANT_LOGO_DARK_PATH || 'assets/default-tenant/logo-dark.png';
    const faviconPath = process.env.DEFAULT_TENANT_FAVICON_PATH || 'assets/default-tenant/favicon.png';
    const notificationsEmail = process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL || 'soporte@reclamofacil.com';

    tenant = await Tenant.create({
      slug: defaultSlug,
      company_brand: companyBrand,
      company_name: companyName,
      company_ruc: companyRuc,
      primary_color: primaryColor,
      accent_color: accentColor,
      logo_light_url: logoLightPath,
      logo_dark_url: logoDarkPath,
      favicon_url: faviconPath,
      notifications_email: notificationsEmail,
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

async function seedSuperadminUserConditional() {
  const shouldCreate = (process.env.CREATE_SUPERADMIN_ON_SEED || 'false').toLowerCase() === 'true';
  if (!shouldCreate) {
    console.log('Skipping superadmin creation (set CREATE_SUPERADMIN_ON_SEED=true to enable).');
    return;
  }

  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'superadmin123';
  let user = await User.findOne({ where: { email } });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      first_name: 'Superadmin',
      last_name: 'User',
      email,
      password: hashed,
      role: 'superadmin',
    });
    console.log(`Seeded: superadmin user (${email})`);
  } else {
    console.log(`Superadmin user (${email}) already exists, skipping.`);
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
    plan_name: 'free', // Production: always start with free plan
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
    await seedSuperadminUserConditional();
    await seedAdminUser(tenant);
    await seedSubscription(tenant);
    console.log('Default seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Default seeding failed:', err);
    process.exit(1);
  }
})();
