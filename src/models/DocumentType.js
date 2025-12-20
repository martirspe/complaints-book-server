const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');

const DocumentType = sequelize.define('DocumentType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'document_types'
});

module.exports = DocumentType;
