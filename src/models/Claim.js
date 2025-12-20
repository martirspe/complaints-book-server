const { DataTypes } = require('sequelize');

// DB Configuration
const { sequelize } = require('../config/db');

// Data Models
const User = require('./User');
const Customer = require('./Customer');
const Tutor = require('./Tutor');
const ConsumptionType = require('./ConsumptionType');
const ClaimType = require('./ClaimType');
const Currency = require('./Currency');
const Tenant = require('./Tenant');

const Claim = sequelize.define('Claim', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  tutor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tutor,
      key: 'id'
    }
  },
  consumption_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ConsumptionType,
      key: 'id'
    }
  },
  claim_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ClaimType,
      key: 'id'
    }
  },
  currency_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Currency,
      key: 'id'
    },
    defaultValue: 1 // Default: Sol Peruano
  },
  order_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  claimed_amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  request: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assigned_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  response_attachment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  },
  creation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  assignment_date: {
    type: DataTypes.DATE,
  },
  response_date: {
    type: DataTypes.DATE,
  },
  update_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: 'update_date',
  tableName: 'claims'
});

Customer.hasMany(Claim, { foreignKey: 'customer_id' });
Claim.belongsTo(Customer, { foreignKey: 'customer_id' });

Tutor.hasMany(Claim, { foreignKey: 'tutor_id' });
Claim.belongsTo(Tutor, { foreignKey: 'tutor_id' });

ClaimType.hasMany(Claim, { foreignKey: 'claim_type_id' });
Claim.belongsTo(ClaimType, { foreignKey: 'claim_type_id' });

ConsumptionType.hasMany(Claim, { foreignKey: 'consumption_type_id' });
Claim.belongsTo(ConsumptionType, { foreignKey: 'consumption_type_id' });

User.hasMany(Claim, { foreignKey: 'assigned_user', as: 'assignedClaims' });
Claim.belongsTo(User, { foreignKey: 'assigned_user', as: 'assignedUser' });

Currency.hasMany(Claim, { foreignKey: 'currency_id' });
Claim.belongsTo(Currency, { foreignKey: 'currency_id' });

Tenant.hasMany(Claim, { foreignKey: 'tenant_id' });
Claim.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = Claim;
