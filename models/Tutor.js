const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');

// Data Model
const DocumentType = require('./DocumentType');

const Tutor = sequelize.define('Tutor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    type: DataTypes.STRING,
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
  }
}, {
  timestamps: false,
  tableName: 'tutors'
});

DocumentType.hasMany(Tutor, { foreignKey: 'document_type_id' });
Tutor.belongsTo(DocumentType, { foreignKey: 'document_type_id' });

module.exports = Tutor;
