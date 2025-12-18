const express = require('express');

// Route configuration
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const tutorRoutes = require('./tutorRoutes');
const documentTypeRoutes = require('./documentTypeRoutes');
const consumptionTypeRoutes = require('./consumptionTypeRoutes');
const claimTypeRoutes = require('./claimTypeRoutes');
const claimRoutes = require('./claimRoutes');
const licenseRoutes = require('./licenseRoutes');
const uploadRoutes = require('./uploadRoutes');
const brandingRoutes = require('./brandingRoutes');

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

// Claims API routes
router.use('/api', claimRoutes);

// License verification API
router.use('/api', licenseRoutes);

// Upload API routes
router.use('/api', uploadRoutes);

// Branding API routes
router.use('/api', brandingRoutes);

module.exports = router;
