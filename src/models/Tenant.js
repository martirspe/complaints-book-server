const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Modelo Tenant: define branding y metadatos por cliente/tenant.
const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  company_brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company_ruc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  primary_color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accent_color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo_light_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo_dark_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  favicon_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: 'update_date',
  tableName: 'tenants'
});

module.exports = Tenant;
