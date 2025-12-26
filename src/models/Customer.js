const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');

// Data Models
const DocumentType = require('./DocumentType');
const Tenant = require('./Tenant');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  document_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DocumentType,
      key: 'id'
    }
  },
  document_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_younger: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: 'update_date',
  tableName: 'customers'
});

DocumentType.hasMany(Customer, { foreignKey: 'document_type_id' });
Customer.belongsTo(DocumentType, { foreignKey: 'document_type_id' });

Tenant.hasMany(Customer, { foreignKey: 'tenant_id' });
Customer.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = Customer;
