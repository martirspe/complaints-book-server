const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Tenant = require('./Tenant');

/**
 * Subscription model: manages SaaS plans per tenant.
 * Plans are defined separately (free, basic, pro, enterprise).
 * This tracks which plan is active, when it expires, and billing info.
 */
const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  plan_name: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    allowNull: false,
    defaultValue: 'free'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  // Billing period
  billing_cycle_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  billing_cycle_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // External payment reference (Stripe, PayPal, etc.)
  payment_provider: {
    type: DataTypes.STRING,
    allowNull: true, // 'stripe', 'paypal', null for free
  },
  payment_provider_id: {
    type: DataTypes.STRING,
    allowNull: true, // subscription ID in payment provider
  },
  // Auto-renewal
  auto_renew: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // Metadata (e.g., seats purchased, rate limit override, custom features)
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: 'update_date',
  tableName: 'subscriptions'
});

Tenant.hasOne(Subscription, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = Subscription;
