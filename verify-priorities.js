#!/usr/bin/env node

/**
 * Verification Script for Priority 1-3 Implementation
 * Checks that all files and integrations are in place
 * 
 * Usage: node verify-priorities.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function check(name, condition, details = '') {
  if (condition) {
    checks.passed.push(`✅ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    checks.failed.push(`❌ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  }
}

function warn(name, details = '') {
  checks.warnings.push(`⚠️  ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

console.log('\n🔍 PRIORITY IMPLEMENTATION VERIFICATION\n');

// ===== PRIORITY 1: RATE LIMITING =====
console.log('📊 PRIORITY 1: RATE LIMITING');
console.log('─'.repeat(50));

const routesIndexPath = path.join(__dirname, 'src/routes/index.js');
let routesIndexContent = '';
try {
  routesIndexContent = fs.readFileSync(routesIndexPath, 'utf8');
} catch (e) {
  warn('Routes index file readable', e.message);
}

check(
  'Rate limiting middleware imported',
  routesIndexContent.includes('rateLimitTenant'),
  'Found rateLimitTenant import'
);

check(
  'Rate limiting applied to /api routes',
  routesIndexContent.includes("router.use('/api', rateLimitTenant)"),
  'Global rate limiting middleware active'
);

// ===== PRIORITY 2: AUDITING =====
console.log('\n📝 PRIORITY 2: AUDITING');
console.log('─'.repeat(50));

const auditLogPath = path.join(__dirname, 'src/models/AuditLog.js');
check(
  'AuditLog model exists',
  fs.existsSync(auditLogPath),
  'src/models/AuditLog.js'
);

const modelsIndexPath = path.join(__dirname, 'src/models/index.js');
let modelsContent = '';
try {
  modelsContent = fs.readFileSync(modelsIndexPath, 'utf8');
} catch (e) {
  warn('Models index file readable', e.message);
}

check(
  'AuditLog exported from models',
  modelsContent.includes("const AuditLog = require('./AuditLog')") &&
  modelsContent.includes('AuditLog'),
  'AuditLog included in model exports'
);

const auditMiddlewarePath = path.join(__dirname, 'src/middlewares/auditMiddleware.js');
let auditMiddlewareContent = '';
try {
  auditMiddlewareContent = fs.readFileSync(auditMiddlewarePath, 'utf8');
} catch (e) {
  warn('Audit middleware file readable', e.message);
}

check(
  'Audit middleware imports AuditLog',
  auditMiddlewareContent.includes('AuditLog') &&
  auditMiddlewareContent.includes('AuditLog.create'),
  'Middleware logs to database'
);

check(
  'Audit middleware accepts action and resourceType',
  auditMiddlewareContent.includes('(action, resourceType)'),
  'Middleware signature includes both parameters'
);

// Check routes for audit middleware
const claimRoutesPath = path.join(__dirname, 'src/routes/claimRoutes.js');
let claimRoutesContent = '';
try {
  claimRoutesContent = fs.readFileSync(claimRoutesPath, 'utf8');
} catch (e) {
  warn('Claim routes file readable', e.message);
}

check(
  'Claim routes apply audit middleware',
  claimRoutesContent.includes("auditMiddleware('CREATE', 'Claim')") &&
  claimRoutesContent.includes("auditMiddleware('UPDATE', 'Claim')") &&
  claimRoutesContent.includes("auditMiddleware('DELETE', 'Claim')"),
  'CREATE, UPDATE, DELETE logged'
);

const customerRoutesPath = path.join(__dirname, 'src/routes/customerRoutes.js');
let customerRoutesContent = '';
try {
  customerRoutesContent = fs.readFileSync(customerRoutesPath, 'utf8');
} catch (e) {
  warn('Customer routes file readable', e.message);
}

check(
  'Customer routes apply audit middleware',
  customerRoutesContent.includes("auditMiddleware('CREATE', 'Customer')") &&
  customerRoutesContent.includes("auditMiddleware('UPDATE', 'Customer')") &&
  customerRoutesContent.includes("auditMiddleware('DELETE', 'Customer')"),
  'CREATE, UPDATE, DELETE logged'
);

const tutorRoutesPath = path.join(__dirname, 'src/routes/tutorRoutes.js');
let tutorRoutesContent = '';
try {
  tutorRoutesContent = fs.readFileSync(tutorRoutesPath, 'utf8');
} catch (e) {
  warn('Tutor routes file readable', e.message);
}

check(
  'Tutor routes apply audit middleware',
  tutorRoutesContent.includes("auditMiddleware('CREATE', 'Tutor')") &&
  tutorRoutesContent.includes("auditMiddleware('UPDATE', 'Tutor')") &&
  tutorRoutesContent.includes("auditMiddleware('DELETE', 'Tutor')"),
  'CREATE, UPDATE, DELETE logged'
);

// ===== PRIORITY 3: FEATURE GATING =====
console.log('\n🎯 PRIORITY 3: FEATURE GATING');
console.log('─'.repeat(50));

const planFeaturesPath = path.join(__dirname, 'src/config/planFeatures.js');
check(
  'Plan features configuration exists',
  fs.existsSync(planFeaturesPath),
  'src/config/planFeatures.js'
);

let planFeaturesContent = '';
try {
  planFeaturesContent = fs.readFileSync(planFeaturesPath, 'utf8');
} catch (e) {
  warn('Plan features file readable', e.message);
}

check(
  'Plan features define free tier',
  planFeaturesContent.includes('free:') &&
  planFeaturesContent.includes('maxClaims: 10'),
  'Free plan: max 10 claims'
);

check(
  'Plan features define pro tier',
  planFeaturesContent.includes('pro:') &&
  planFeaturesContent.includes('maxClaims: 1000'),
  'Pro plan: max 1000 claims'
);

check(
  'Plan features define enterprise tier',
  planFeaturesContent.includes('enterprise:') &&
  planFeaturesContent.includes('maxClaims: null'),
  'Enterprise plan: unlimited'
);

check(
  'Plan features export utility functions',
  planFeaturesContent.includes('hasFeature') &&
  planFeaturesContent.includes('isLimitExceeded') &&
  planFeaturesContent.includes('getRemainingQuota'),
  'Helper functions for feature checks'
);

const resourceLimitMiddlewarePath = path.join(__dirname, 'src/middlewares/resourceLimitMiddleware.js');
check(
  'Resource limit middleware exists',
  fs.existsSync(resourceLimitMiddlewarePath),
  'src/middlewares/resourceLimitMiddleware.js'
);

const featureGateMiddlewarePath = path.join(__dirname, 'src/middlewares/featureGateMiddleware.js');
let featureGateContent = '';
try {
  featureGateContent = fs.readFileSync(featureGateMiddlewarePath, 'utf8');
} catch (e) {
  warn('Feature gate middleware file readable', e.message);
}

check(
  'Feature gate middleware uses plan features',
  featureGateContent.includes('hasFeature') &&
  featureGateContent.includes('requireFeature'),
  'Feature validation active'
);

// Check API key routes for feature gate
const apiKeyRoutesPath = path.join(__dirname, 'src/routes/apiKeyRoutes.js');
let apiKeyRoutesContent = '';
try {
  apiKeyRoutesContent = fs.readFileSync(apiKeyRoutesPath, 'utf8');
} catch (e) {
  warn('API key routes file readable', e.message);
}

check(
  'API key routes feature-gated',
  apiKeyRoutesContent.includes("requireFeature('apiAccess')"),
  'API keys require pro+ plan'
);

check(
  'API key routes resource-limited',
  apiKeyRoutesContent.includes("limitResourceCreation('maxApiKeys', 'ApiKey')"),
  'API keys have quota'
);

// Check for resource limits in claim routes
check(
  'Claim routes resource-limited',
  claimRoutesContent.includes("limitResourceCreation('maxClaims', 'Claim')"),
  'Claims have quota'
);

check(
  'Customer routes resource-limited',
  customerRoutesContent.includes("limitResourceCreation('maxCustomers', 'Customer')"),
  'Customers have quota'
);

check(
  'Tutor routes resource-limited',
  tutorRoutesContent.includes("limitResourceCreation('maxTutors', 'Tutor')"),
  'Tutors have quota'
);

// ===== SUMMARY =====
console.log('\n' + '═'.repeat(50));
console.log('📊 VERIFICATION SUMMARY\n');

console.log(`✅ Passed: ${checks.passed.length}`);
checks.passed.forEach(c => console.log(`   ${c}`));

if (checks.warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${checks.warnings.length}`);
  checks.warnings.forEach(c => console.log(`   ${c}`));
}

if (checks.failed.length > 0) {
  console.log(`\n❌ Failed: ${checks.failed.length}`);
  checks.failed.forEach(c => console.log(`   ${c}`));
  process.exit(1);
} else {
  console.log('\n✨ All checks passed! Priority 1-3 implementation complete.\n');
  process.exit(0);
}
