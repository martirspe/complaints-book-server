// Data Models
const User = require('./User');
const Customer = require('./Customer');
const Tutor = require('./Tutor');
const DocumentType = require('./DocumentType');
const ConsumptionType = require('./ConsumptionType');
const ClaimType = require('./ClaimType');
const Currency = require('./Currency');
const Claim = require('./Claim');
const Tenant = require('./Tenant');
const UserTenant = require('./UserTenant');
const ApiKey = require('./ApiKey');
const Subscription = require('./Subscription');
const AuditLog = require('./AuditLog');

module.exports = {
  User,
  Customer,
  Tutor,
  DocumentType,
  ConsumptionType,
  ClaimType,
  Currency,
  Claim,
  Tenant,
  UserTenant,
  ApiKey,
  Subscription,
  AuditLog
};
