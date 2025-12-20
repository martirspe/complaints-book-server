const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');

const Currency = sequelize.define('Currency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  symbol: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: false,
  tableName: 'currencies'
});

module.exports = Currency;
