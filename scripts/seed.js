/* Dev seed script: inserts baseline data if tables are empty */
const { connectDB } = require('../config/db');
const { DocumentType, ConsumptionType, ClaimType, User } = require('../models');
const bcrypt = require('bcrypt');

async function seedDocumentTypes() {
  const count = await DocumentType.count();
  if (count > 0) return;
  await DocumentType.bulkCreate([
    { name: 'DNI' },
    { name: 'CE' },
    { name: 'Pasaporte' },
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

async function seedAdminUser() {
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const exists = await User.findOne({ where: { email: defaultEmail } });
  if (exists) return;
  const hashed = await bcrypt.hash(defaultPassword, 10);
  await User.create({
    first_name: 'Admin',
    last_name: 'User',
    email: defaultEmail,
    password: hashed,
    role: 'admin',
    license_type: null,
    license_expiration_date: null,
  });
  console.log(`Seeded: admin user (${defaultEmail})`);
}

(async () => {
  try {
    await connectDB();
    await seedDocumentTypes();
    await seedConsumptionTypes();
    await seedClaimTypes();
    await seedAdminUser();
    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
