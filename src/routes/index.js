const express = require('express');

// Route configuration
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const tutorRoutes = require('./tutorRoutes');
const documentTypeRoutes = require('./documentTypeRoutes');
const consumptionTypeRoutes = require('./consumptionTypeRoutes');
const claimTypeRoutes = require('./claimTypeRoutes');
const currencyRoutes = require('./currencyRoutes');
const claimRoutes = require('./claimRoutes');
const uploadRoutes = require('./uploadRoutes');
const tenantRoutes = require('./tenantRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');
const integrationRoutes = require('./integrationRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

const router = express.Router();

// User API routes
router.use('/api', userRoutes);

// Client API routes
router.use('/api', customerRoutes);

// Tutor API routes
router.use('/api', tutorRoutes);

// Document type API routes
router.use('/api', documentTypeRoutes);

// Consumption type API routes
router.use('/api', consumptionTypeRoutes);

// Claim type API routes
router.use('/api', claimTypeRoutes);

// Currency API routes
router.use('/api', currencyRoutes);

// Claims API routes
router.use('/api', claimRoutes);

// Upload API routes
router.use('/api', uploadRoutes);

// Tenant/branding multi-tenant API routes
router.use('/api', tenantRoutes);

// API keys management (per-tenant)
router.use('/api', apiKeyRoutes);

// Integration routes (API key auth)
router.use('/api', integrationRoutes);

// Subscription/billing routes (SaaS plans) - includes legacy /license/:userId endpoint
router.use('/api/tenants/:slug', subscriptionRoutes);

module.exports = router;
