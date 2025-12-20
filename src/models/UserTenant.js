const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Tenant = require('./Tenant');

// Tabla puente para membresía usuario-tenant y roles por tenant
const UserTenant = sequelize.define('UserTenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    unique: 'user_tenant_unique'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    },
    unique: 'user_tenant_unique'
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    allowNull: false,
    defaultValue: 'staff'
  }
}, {
  tableName: 'user_tenants',
  timestamps: true
});

User.belongsToMany(Tenant, { through: UserTenant, foreignKey: 'user_id', otherKey: 'tenant_id' });
Tenant.belongsToMany(User, { through: UserTenant, foreignKey: 'tenant_id', otherKey: 'user_id' });

module.exports = UserTenant;
