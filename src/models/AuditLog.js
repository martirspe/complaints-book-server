const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Tenant = require('./Tenant');

/**
 * AuditLog Model
 * Tracks all significant data modifications for compliance and security
 * Records: who, what, when, where
 */
const AuditLog = sequelize.define('AuditLog', {
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
    },
    comment: 'Tenant context for the action'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'User who performed the action'
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE'),
    allowNull: false,
    comment: 'CRUD operation performed'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Entity type (Customer, Claim, User, etc)'
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the modified resource'
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values (for UPDATE actions)'
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New values (for CREATE/UPDATE actions)'
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Diff: which fields changed and how'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Source IP address'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User Agent header'
  },
  status: {
    type: DataTypes.ENUM('success', 'failure'),
    defaultValue: 'success',
    comment: 'Whether the action succeeded'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason if action failed or notes about the action'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Audit logs are immutable
  tableName: 'audit_logs',
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['user_id'] },
    { fields: ['resource_type', 'resource_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
    { fields: ['tenant_id', 'created_at'] } // For tenant audit trails
  ]
});

// Associations
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

Tenant.hasMany(AuditLog, { foreignKey: 'tenant_id' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = AuditLog;
