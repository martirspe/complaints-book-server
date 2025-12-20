// Middlewares
const authMiddleware = require('./authMiddleware');
const errorMiddleware = require('./errorMiddleware');
const cacheMiddleware = require('./cacheMiddleware');
const tenantMiddleware = require('./tenantMiddleware');
const membershipMiddleware = require('./membershipMiddleware');
const requireTenantRole = require('./requireTenantRole');
const rateLimitTenant = require('./rateLimitTenant');
const auditMiddleware = require('./auditMiddleware');
const apiKeyMiddleware = require('./apiKeyMiddleware');
const requireApiKeyScope = require('./requireApiKeyScope');
const apiKeyOrJwt = require('./apiKeyOrJwt');
const requireApiKeyScopeOrJwt = require('./requireApiKeyScopeOrJwt');

module.exports = {
  authMiddleware,
  errorMiddleware,
  cacheMiddleware,
  tenantMiddleware,
  membershipMiddleware,
  requireTenantRole,
  rateLimitTenant,
  auditMiddleware,
  apiKeyMiddleware,
  requireApiKeyScope,
  apiKeyOrJwt,
  requireApiKeyScopeOrJwt,
};