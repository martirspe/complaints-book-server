const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');
const Tenant = require('./Tenant');

const User = sequelize.define('User', {
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
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: 'update_date',
  tableName: 'users',
});

Tenant.hasMany(User, { foreignKey: 'tenant_id' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = User;
