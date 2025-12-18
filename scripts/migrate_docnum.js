require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrate() {
  try {
    console.log('Starting migration: change tutors.document_number to VARCHAR(8)');
    await sequelize.query('ALTER TABLE tutors MODIFY COLUMN document_number VARCHAR(8) NOT NULL UNIQUE;');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();